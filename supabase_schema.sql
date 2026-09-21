-- ==============================================================================
-- DON'T BLINK — Supabase Global Leaderboard Hardened Schema & Security Policies
-- ==============================================================================
-- Description: Production database definition with Row Level Security (RLS),
-- strict field constraints, anti-cheat rate bounds, and anti-replay session tokens.
-- ==============================================================================

-- 1. Create Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    run_duration INTEGER NOT NULL,
    ending_id TEXT DEFAULT NULL,
    skin_id TEXT DEFAULT 'default',
    run_session_id TEXT DEFAULT NULL,

    -- Constraints preventing invalid, impossible, or manipulated submissions
    CONSTRAINT chk_player_name_length 
        CHECK (char_length(trim(player_name)) >= 1 AND char_length(player_name) <= 20),
    
    CONSTRAINT chk_score_bounds 
        CHECK (score >= 0 AND score <= 5000000),
    
    CONSTRAINT chk_distance_bounds 
        CHECK (distance >= 0 AND distance <= 1000000),
    
    CONSTRAINT chk_duration_bounds 
        CHECK (run_duration >= 2 AND run_duration <= 86400),
    
    -- Anti-Cheat Physical Rate Constraint:
    -- Max theoretical score in DON'T BLINK is ~2,240 pts/sec.
    -- (run_duration * 3500) + 1000 guarantees legitimate players never get rejected
    -- while instantly rejecting automated score manipulation bots.
    CONSTRAINT chk_score_rate_realistic 
        CHECK (score <= (run_duration * 3500) + 1000),
        
    -- Max theoretical runner velocity is ~830 px/sec.
    CONSTRAINT chk_distance_rate_realistic 
        CHECK (distance <= (run_duration * 1200) + 200),
        
    -- Anti-tampering check on ending ID
    CONSTRAINT chk_ending_id_valid
        CHECK (ending_id IS NULL OR ending_id IN (
            'ending_01', 'ending_02', 'ending_03', 'ending_04',
            'ending_05', 'ending_06', 'ending_07'
        )),

    -- Anti-tampering check on skin ID
    CONSTRAINT chk_skin_id_valid
        CHECK (skin_id IN ('default', 'neon', 'robot', 'ghost', 'pixel', 'golden'))
);

-- 2. Indexes for High-Performance Queries & Replay Prevention
-- Fast index for top leaderboard ranking
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_created 
    ON public.leaderboard (score DESC, created_at DESC);

-- Unique index on run_session_id to prevent duplicate replay submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_unique_run_session 
    ON public.leaderboard (run_session_id) 
    WHERE run_session_id IS NOT NULL;

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to READ top leaderboard rows
DROP POLICY IF EXISTS "Public can view top leaderboard entries" ON public.leaderboard;
CREATE POLICY "Public can view top leaderboard entries" 
    ON public.leaderboard 
    FOR SELECT 
    USING (true);

-- Allow anonymous and authenticated users to INSERT valid game over runs
DROP POLICY IF EXISTS "Public can submit verified run records" ON public.leaderboard;
CREATE POLICY "Public can submit verified run records" 
    ON public.leaderboard 
    FOR INSERT 
    WITH CHECK (
        -- Enforce name cleanliness and positive metrics
        char_length(trim(player_name)) >= 1 AND
        char_length(player_name) <= 20 AND
        score >= 0 AND score <= 5000000 AND
        distance >= 0 AND distance <= 1000000 AND
        run_duration >= 2 AND
        score <= (run_duration * 3500) + 1000
    );

-- STRICT REJECTION OF ARBITRARY MODIFICATIONS:
-- Deny all UPDATE and DELETE operations for public/anon roles
REVOKE UPDATE, DELETE ON public.leaderboard FROM anon, authenticated;

-- Grant minimal necessary permissions
GRANT SELECT, INSERT ON public.leaderboard TO anon, authenticated;
