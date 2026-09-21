import { StoryChapter, StoryFragment, GameEnding, Achievement } from '../types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter_1',
    number: 1,
    title: {
      id: 'CHAPTER 1 — PELARIAN',
      en: 'CHAPTER 1 — THE ESCAPE',
    },
    teaser: {
      id: 'Langkah pertama di koridor tanpa ujung.',
      en: 'The first footsteps along the endless corridor.',
    },
    synopsis: {
      id: 'Kau terbangun di tengah bayang-bayang siber yang membeku. Udara dingin dan statik berdesis di telingamu. Instingmu hanya berteriak satu hal: lari, dan jangan pernah menoleh ke belakang.',
      en: 'You awoke amidst freezing cyber shadows. Cold air and static whispered in your ears. Your instincts screamed only one command: run, and never look back.',
    },
    unlockRequirementText: {
      id: 'Terbuka sejak awal permainan.',
      en: 'Unlocked from the beginning.',
    },
  },
  {
    id: 'chapter_2',
    number: 2,
    title: {
      id: 'CHAPTER 2 — SUARA ITU',
      en: 'CHAPTER 2 — THE SOUND',
    },
    teaser: {
      id: 'Bukan gema... seseorang sedang memanggilmu.',
      en: 'Not an echo... someone is calling your name.',
    },
    synopsis: {
      id: 'Setiap kali kecepatanmu bertambah, desau angin membawa serpihan suara. Suara itu terasa begitu akrab, berasal tepat beberapa jengkal di belakang lehermu. Mengapa ia memanggil namamu?',
      en: 'As your velocity builds, the wind carries fractured voices. The sound is heartbreakingly familiar, breathing inches behind your neck. Why does it speak your name?',
    },
    unlockRequirementText: {
      id: 'Capai total jarak 3.000m atau temukan 3 fragmen.',
      en: 'Reach 3,000m total distance or discover 3 fragments.',
    },
  },
  {
    id: 'chapter_3',
    number: 3,
    title: {
      id: 'CHAPTER 3 — INGATAN SILAM',
      en: 'CHAPTER 3 — THE MEMORY',
    },
    teaser: {
      id: 'Pecahan cermin sebelum dunia runtuh.',
      en: 'Shards of glass before the world shattered.',
    },
    synopsis: {
      id: 'Orb energi di lintasan bukanlah sekadar baterai sirkuit. Di dalamnya tersimpan kilasan ingatan: laboratorium riset waktu, protokol karantina, dan janji seorang kawan yang tak sempat kau tepati.',
      en: 'The energy orbs across the track are not mere power cells. Inside reside memory shards: a chronos research lab, a quarantine breach, and an unkept promise.',
    },
    unlockRequirementText: {
      id: 'Kumpulkan 6 Fragmen Ingatan.',
      en: 'Collect 6 Memory Fragments.',
    },
  },
  {
    id: 'chapter_4',
    number: 4,
    title: {
      id: 'CHAPTER 4 — SESUATU DI KEGELAPAN',
      en: 'CHAPTER 4 — THE THING',
    },
    teaser: {
      id: 'Sesuatu mengingat siapa dirimu.',
      en: 'Something remembers who you are.',
    },
    synopsis: {
      id: 'Bayangan di belakangmu memiliki wujud. Ia tidak berusaha membunuhmu secara membabi buta; ia menirukan setiap gerak langkahmu. Semakin kau takut, semakin rapat bayangan itu menyatu dengan siluetmu.',
      en: 'The silhouette behind you has taken shape. It does not blindly slaughter; it mirrors your every stride. The greater your fear, the tighter it fuses with your soul.',
    },
    unlockRequirementText: {
      id: 'Kumpulkan 10 Fragmen atau lakukan Look Back pertama kali.',
      en: 'Collect 10 Fragments or trigger your first Look Back.',
    },
  },
  {
    id: 'chapter_5',
    number: 5,
    title: {
      id: 'CHAPTER 5 — KEBENARAN',
      en: 'CHAPTER 5 — THE TRUTH',
    },
    teaser: {
      id: 'Siapa yang sebenarnya melarikan diri?',
      en: 'Who is truly running away?',
    },
    synopsis: {
      id: 'Catatan protokol ke-7 terpecahkan. Koridor ini bukan penjara bawah tanah, melainkan rekaman siklus kesadaran yang terperangkap dalam loop milidetik tepat sebelum tabrakan besar.',
      en: 'Protocol 7 decrypted. This corridor is no underground prison; it is a recursive consciousness loop frozen in the final milliseconds before the impact.',
    },
    unlockRequirementText: {
      id: 'Buka minimal 2 Ending berbeda.',
      en: 'Unlock at least 2 different Endings.',
    },
  },
  {
    id: 'chapter_6',
    number: 6,
    title: {
      id: 'FINAL CHAPTER — JANGAN BERKEDIP',
      en: "FINAL CHAPTER — DON'T BLINK",
    },
    teaser: {
      id: 'Ketika kedua mata akhirnya berhenti mencari jalan keluar.',
      en: 'When both eyes finally cease seeking an exit.',
    },
    synopsis: {
      id: 'Semua fragmen menyatu. Berkedip adalah cara kesadaranmu mengatur ulang rasa sakit. Tetapi jika kau berani menatap jurang tanpa sekali pun menutup mata, siklus abadi ini akan runtuh.',
      en: 'All fragments align. Blinking was your mind resetting unbearable grief. But if you stare straight into the void without shutting your eyes, the endless cycle will shatter.',
    },
    unlockRequirementText: {
      id: 'Buka 4 Ending atau temukan 16 Fragmen Cerita.',
      en: 'Unlock 4 Endings or collect 16 Story Fragments.',
    },
  },
];

export const STORY_FRAGMENTS: StoryFragment[] = [
  {
    id: 'frag_01',
    number: 1,
    category: 'WARNING',
    title: {
      id: 'Bisikan Pertama',
      en: 'The First Whisper',
    },
    excerpt: {
      id: 'Pertama kali aku mendengar suara itu, aku pikir seseorang memanggilku...',
      en: 'The first time I heard the voice, I thought someone was calling me...',
    },
    content: {
      id: 'Pertama kali aku mendengar suara itu, aku pikir seseorang memanggilku dari kejauhan. Tapi suaranya tidak memiliki arah rambat; ia bergetar persis di belakang gendang telingaku.',
      en: 'The first time I heard the voice, I thought someone was calling me from a distance. But the sound had no acoustic direction; it vibrated immediately behind my eardrums.',
    },
  },
  {
    id: 'frag_02',
    number: 2,
    category: 'WARNING',
    title: {
      id: 'Dari Belakang',
      en: 'From Behind',
    },
    excerpt: {
      id: 'Tapi suara itu selalu datang dari belakang...',
      en: 'Yet the voice always arrived from behind...',
    },
    content: {
      id: 'Ke mana pun aku berlari, langkah kakinya berderap persis satu detik setelah langkah kakiku. Bayangannya memanjang di lantai mendahului tubuhku sendiri.',
      en: 'Wherever I sprint, its footsteps fall exactly one second after mine. Its shadow stretches across the tiles, overtaking my own body.',
    },
  },
  {
    id: 'frag_03',
    number: 3,
    category: 'WARNING',
    title: {
      id: 'Larangan Mutlak',
      en: 'The Absolute Ban',
    },
    excerpt: {
      id: 'Aku akhirnya mengerti kenapa mereka menyuruhku jangan melihat.',
      en: 'I finally understand why they ordered me never to look.',
    },
    content: {
      id: 'Papan peringatan di gerbang lab tertulis dengan darah kering: "Jangan menoleh. Begitu pandanganmu bertumbukan dengannya, ruang di antara kalian tidak lagi memiliki jarak."',
      en: 'The warning plate at the facility gate was scrawled in dried blood: "Do not turn around. The moment your eyes meet it, the space between you ceases to exist."',
    },
  },
  {
    id: 'frag_04',
    number: 4,
    category: 'MEMORY',
    title: {
      id: 'Jam Digital 02:17 AM',
      en: 'Digital Clock 02:17 AM',
    },
    excerpt: {
      id: 'Layar monitor selalu macet di angka yang sama.',
      en: 'The monitors are forever frozen at the same numbers.',
    },
    content: {
      id: 'Setiap terminal yang kulewati menampilkan waktu yang persis: 02:17:44 AM. Detiknya tidak pernah bergulir ke angka 45. Aku terperangkap di detik terjadinya ledakan.',
      en: 'Every terminal I sprint past displays identical digits: 02:17:44 AM. The seconds never tick to 45. I am imprisoned within the exact moment of detonation.',
    },
  },
  {
    id: 'frag_05',
    number: 5,
    category: 'LOCATION',
    title: {
      id: 'Koridor Tanpa Horizon',
      en: 'The Horizonless Corridor',
    },
    excerpt: {
      id: 'Lantai ini dibangun dari frekuensi cahaya padat.',
      en: 'This floor is forged from solid frequency light.',
    },
    content: {
      id: 'Tidak ada dinding bata atau langit-langit beton. Yang ada hanyalah garis neon biru kehijauan yang terus membentang ke kegelapan kosmik tak bertepi.',
      en: 'There are no concrete walls or brick ceilings. Only neon cyan pulse rails stretching infinitely into an unyielding cosmic void.',
    },
  },
  {
    id: 'frag_06',
    number: 6,
    category: 'CHARACTER',
    title: {
      id: 'Baju Zirah Protokol',
      en: 'The Protocol Chassis',
    },
    excerpt: {
      id: 'Tubuhku terasa ringan, terlalu ringan untuk manusia.',
      en: 'My chassis feels light, far too light for human flesh.',
    },
    content: {
      id: 'Kutatap kedua tanganku saat melompat. Bukan kulit dan tulang, melainkan komposit titanium nano dengan lampu indikator denyut quantum. Apa yang mereka lakukan pada diriku?',
      en: 'I glance at my hands as I leap. Not flesh or bone, but nano titanium alloy with pulsing quantum core telemetry. What did they turn me into?',
    },
  },
  {
    id: 'frag_07',
    number: 7,
    category: 'ENTITY',
    title: {
      id: 'Entitas Refleksi',
      en: 'The Reflection Entity',
    },
    excerpt: {
      id: 'Ia tidak memiliki wajah, hanya topeng kegelapan.',
      en: 'It wears no face, only a mask of dark static.',
    },
    content: {
      id: 'Ketika aku melompati penghalang laser, udara di belakangku beriak. Entitas itu tidak terbang; ia melangkah melalui bayangan yang kutinggalkan di tanah.',
      en: 'When I clear a high laser barrier, the air ripples behind me. The entity does not fly; it strides directly through the shadows I cast upon the ground.',
    },
  },
  {
    id: 'frag_08',
    number: 8,
    category: 'MEMORY',
    title: {
      id: 'Suara Rekan Terakhir',
      en: 'The Last Colleague',
    },
    excerpt: {
      id: '"Tekan tombol penutup gerbang, jangan tunggu aku!"',
      en: '"Purge the gate, do not wait for me!"',
    },
    content: {
      id: 'Ingatan itu tiba-tiba menabrak kepalaku: Suara Sarah di interkom, alarm darurat merah menyala, dan tanganku yang gemetar menekan tombol isolasi reaktor sambil meninggalkannya di dalam.',
      en: 'The memory strikes like lightning: Sarah\'s frantic voice over the intercom, scarlet meltdown sirens, and my trembling hand slamming the reactor quarantine hatch, sealing her inside.',
    },
  },
  {
    id: 'frag_09',
    number: 9,
    category: 'WARNING',
    title: {
      id: 'Anatomi Berkedip',
      en: 'The Anatomy of a Blink',
    },
    excerpt: {
      id: 'Berkedip membutuhkan 100 milidetik...',
      en: 'A blink takes only 100 milliseconds...',
    },
    content: {
      id: 'Bagi manusia normal, berkedip hanyalah membasahi kornea. Namun di dalam simulasi ini, 100 milidetik kegelapan sudah cukup bagi entitas untuk melompati seratus meter lebih dekat.',
      en: 'For normal mortals, blinking merely moistens the cornea. But within this simulated rift, 100 milliseconds of blackness allows the entity to bridge a hundred meters in an instant.',
    },
  },
  {
    id: 'frag_10',
    number: 10,
    category: 'TRUTH',
    title: {
      id: 'Orb Kapsul Jiwa',
      en: 'Soul Capsule Orbs',
    },
    excerpt: {
      id: 'Cahaya keemasan ini bukan mata uang arcade biasa.',
      en: 'These golden gleams are no ordinary arcade tokens.',
    },
    content: {
      id: 'Setiap kali aku menyerap orb energi bercahaya, sebuah kalimat dari masa lalu kembali tersusun di benakku. Kita mengumpulkan pecahan kesadaran kita sendiri yang tercecer saat kecelakaan.',
      en: 'Whenever I absorb a gleaming energy orb, a lost sentence from the past reconstructs in my mind. We are collecting fragments of our own consciousness scattered in the impact.',
    },
  },
  {
    id: 'frag_11',
    number: 11,
    category: 'ENTITY',
    title: {
      id: 'Bukan Monster Biasa',
      en: 'No Ordinary Beast',
    },
    excerpt: {
      id: 'Ia tidak memiliki niat membunuh, melainkan duka.',
      en: 'It carries no bloodlust, only profound mourning.',
    },
    content: {
      id: 'Ada kehangatan aneh di dalam hawa dingin yang ia bawa. Seolah-olah entitas itu menangis setiap kali aku berhasil lolos dari cengkeramannya.',
      en: 'There is a bizarre sorrow within the chill it casts. It is as though the entity weeps every time I slip away from its reach.',
    },
  },
  {
    id: 'frag_12',
    number: 12,
    category: 'LOCATION',
    title: {
      id: 'Celah Statik Glitch',
      en: 'The Static Glitch Rift',
    },
    excerpt: {
      id: 'Latar belakang neon kadang robek menampilkan dunia nyata.',
      en: 'The neon backdrop occasionally tears, exposing reality.',
    },
    content: {
      id: 'Di balik langit fajar digital, aku sempat melihat ranjang rumah sakit putih, selang infus berdetak, dan bunyi monitor EKG yang hampir datar. Apakah koridor ini adalah komaku?',
      en: 'Behind the digital dawn sky, I caught a split-second glimpse of a sterile white ICU bed, rhythmic IV drips, and an almost-flatlined ECG monitor. Is this track my coma?',
    },
  },
  {
    id: 'frag_13',
    number: 13,
    category: 'WARNING',
    title: {
      id: 'Godaan Menoleh',
      en: 'The Urge to Look Back',
    },
    excerpt: {
      id: 'Rasa ingin tahu adalah racun yang paling manis.',
      en: 'Curiosity is the sweetest poison.',
    },
    content: {
      id: 'Suara itu berbisik pelan: "Tolong... hanya satu detik... tatap mataku." Jika kau menurutinya, dunia ini akan terpelintir menjadi ilusi yang lebih gelap.',
      en: 'The whisper murmurs: "Please... just for one second... look into my eyes." If you submit, the fabric of this realm twists into an even darker illusion.',
    },
  },
  {
    id: 'frag_14',
    number: 14,
    category: 'CHARACTER',
    title: {
      id: 'Pelari Tanpa Nama',
      en: 'The Nameless Runner',
    },
    excerpt: {
      id: 'Nomor seri di punggungku: SUBJEK 00.',
      en: 'Serial number stamped on my spine: SUBJECT 00.',
    },
    content: {
      id: 'Subjek 00: prototipe kesadaran digital pertama. Jika aku berhasil menyelesaikan jarak tanpa henti, kesadaranku dapat dikembalikan ke tubuh jasmaniku di dunia nyata.',
      en: 'Subject 00: the first digital neural bridge prototype. If I can sustain unbroken velocity through the threshold, my mind can be rekindled into my physical vessel.',
    },
  },
  {
    id: 'frag_15',
    number: 15,
    category: 'TRUTH',
    title: {
      id: 'Korupsi & Anomali',
      en: 'Corruption & Anomalies',
    },
    excerpt: {
      id: 'Semakin sering menyentuh anomali, batasan diri mengabur.',
      en: 'Touch too many anomalies, and the self dissolves.',
    },
    content: {
      id: 'Zat anomali ungu di lintasan meningkatkan refleks, tapi mengubah frekuensi armor. Mereka yang terlalu banyak menyerapnya tidak lagi takut pada kegelapan — mereka menjadi kegelapan itu.',
      en: 'The violet anomaly matter on the track sharpens kinetic reflexes, but mutates your core frequency. Those who absorb too much cease fearing the void — they become it.',
    },
  },
  {
    id: 'frag_16',
    number: 16,
    category: 'MEMORY',
    title: {
      id: 'Janji di Bawah Hujan',
      en: 'A Promise in the Rain',
    },
    excerpt: {
      id: '"Kalau sesuatu terjadi padaku, jangan pernah berhenti berlari."',
      en: '"If something happens to me, never stop running."',
    },
    content: {
      id: 'Itu adalah kata-katanya sebelum eksperimen dimulai. Bukan entitas itu yang memaksaku berlari; janjikulah yang menyalakan mesin pendorong ini selamanya.',
      en: 'Those were her words before the core went live. The entity did not compel me to run; my own solemn vow fired these quantum thrusters for eternity.',
    },
  },
  {
    id: 'frag_17',
    number: 17,
    category: 'ENTITY',
    title: {
      id: 'Tangan-Tangan Bayangan',
      en: 'Shadow Grasp',
    },
    excerpt: {
      id: 'Rintangan di tanah bukan batu bata, melainkan sisa penyesalan.',
      en: 'Obstacles on the road are not barriers, but calcified regrets.',
    },
    content: {
      id: 'Penghalang merah dan pilar energi adalah proyeksi dari rasa bersalahku. Semakin cepat aku berlari, semakin tajam rintangan itu berusaha menghentikan langkahku.',
      en: 'The red pillars and energy gates are mental projections of my guilt. The faster I flee, the more aggressively they manifest to halt my escape.',
    },
  },
  {
    id: 'frag_18',
    number: 18,
    category: 'TRUTH',
    title: {
      id: 'Arti Sesungguhnya DON\'T BLINK',
      en: "The True Meaning of DON'T BLINK",
    },
    excerpt: {
      id: 'Jangan pejamkan mata terhadap kenyataan.',
      en: 'Never shut your eyes to reality.',
    },
    content: {
      id: 'DON\'T BLINK bukan sekadar aturan gameplay mekanik arcade. Ini adalah perintah agar jiwaku tidak menyerah tertidur ke dalam kematian otak yang permanen.',
      en: "DON'T BLINK is no mere mechanical arcade rule. It is the bio-command demanding my soul refuses to sleep into irreversible brain death.",
    },
  },
  {
    id: 'frag_19',
    number: 19,
    category: 'LOCATION',
    title: {
      id: 'Pintu Gerbang Alpha',
      en: 'Gateway Alpha',
    },
    excerpt: {
      id: 'Di ujung 10.000 meter, ada pendar cahaya putih terang.',
      en: 'At the 10,000-meter mark, a pure white dawn awaits.',
    },
    content: {
      id: 'Garis finis itu nyata. Sensor di visorku mendeteksi desiran angin segar dunia luar di balik kabut tebal 10.000 meter. Tapi hanya jiwa yang berani dan bersih yang dapat menembusnya.',
      en: 'The finish line is real. My visor telemetry detects real-world atmospheric barometers beyond the 10,000m barrier. But only a steady, uncorrupted mind may breach it.',
    },
  },
  {
    id: 'frag_20',
    number: 20,
    category: 'TRUTH',
    title: {
      id: 'Penyatuan Terakhir',
      en: 'The Final Synthesis',
    },
    excerpt: {
      id: 'Entitas itu... adalah diriku sendiri.',
      en: 'The entity... was me all along.',
    },
    content: {
      id: 'Entitas yang mengejarku bukanlah monster atau iblis. Itu adalah tubuh jasmaniku yang tertinggal di dunia nyata, meraba dalam gelap berusaha menarik kesadarannya pulang.',
      en: 'The entity pursuing me is neither demon nor parasite. It is my mortal flesh waiting in the hospital bed, reaching through the dark trying to pull its soul back home.',
    },
  },
];

export const GAME_ENDINGS: GameEnding[] = [
  {
    id: 'ending_01',
    number: '01',
    title: {
      id: 'THE ESCAPE (Pelarian)',
      en: 'THE ESCAPE',
    },
    subtitle: {
      id: 'Menembus batas kabut digital.',
      en: 'Breaching the digital fog.',
    },
    shortDescription: {
      id: 'Karakter berhasil berlari menembus jarak ekstrem dengan keberanian tinggi dan korupsi rendah.',
      en: 'The runner breaks through the extreme distance with resolute courage and minimal corruption.',
    },
    teaserHint: {
      id: 'Bertahan hingga jarak yang sangat jauh dengan keberanian tinggi dan menjaga kemurnian jiwa.',
      en: 'Survive to monumental distance with high courage and low corruption.',
    },
    sceneType: 'escape',
    narrativeLines: [
      {
        id: 'Lampu-lampu neon perlahan memudar di belakangmu. Getaran lintasan siber mereda menjadi keheningan yang damai.',
        en: 'The harsh neon lights gently dissolve behind you. The rhythmic vibration of the cyber track fades into serene stillness.',
      },
      {
        id: 'Karakter melambat, mengambil napas dalam-dalam untuk pertama kalinya.',
        en: 'The runner slows down, drawing a long, unhurried breath for the very first time.',
      },
      {
        id: '"Aku berhasil... Aku akhirnya keluar."',
        en: '"I made it... I finally escaped."',
      },
      {
        id: 'Layar perlahan meredup menuju kegelapan mutlak.',
        en: 'The view gently dims toward absolute blackness.',
      },
      {
        id: 'Tiba-tiba, sebuah bisikan halus terdengar tepat di belakang telingamu: "...kau yakin?"',
        en: 'Suddenly, a faint, familiar whisper breathes behind your ear: "...are you sure?"',
      },
    ],
  },
  {
    id: 'ending_02',
    number: '02',
    title: {
      id: 'THE TRUTH (Kebenaran)',
      en: 'THE TRUTH',
    },
    subtitle: {
      id: 'Membaca data terlarang fasilitas.',
      en: 'Deciphering the facility mainframe.',
    },
    shortDescription: {
      id: 'Terbuka bagi pencari rahasia yang mengumpulkan banyak fragmen ingatan dan memiliki awareness tinggi.',
      en: 'Unlocked by seekers who gathered substantial memory fragments and maintained acute awareness.',
    },
    teaserHint: {
      id: 'Kumpulkan banyak fragmen ingatan dan selidiki dunia game dengan penuh kesadaran.',
      en: 'Collect abundant memory fragments and observe the world with high awareness.',
    },
    sceneType: 'truth',
    narrativeLines: [
      {
        id: 'Terminal raksasa di dinding lintasan menyala secara serentak. Seluruh kode sumber terpampang di hadapanmu.',
        en: 'The monolithic terminals along the track fire up in unison. Raw source telemetry cascades before your eyes.',
      },
      {
        id: 'Semua rekaman kecelakaan laboratorium terbuka. Kau melihat rekaman dirimu sendiri yang menolak untuk mati.',
        en: 'The disaster logs unlock. You see footage of your own conscious mind refusing to succumb to cardiac arrest.',
      },
      {
        id: 'Entitas yang mengejarmu bukanlah pemburu. Ia adalah tali penambat kehidupanmu sendiri.',
        en: 'The entity chasing you was never an executioner. It was your own lifeline.',
      },
      {
        id: 'Sebuah pertanyaan baru muncul: jika ia adalah penyelamatmu, mengapa kau begitu takut untuk berhenti?',
        en: 'A terrifying question remains: if it is your savior, why are you so terrified to stop?',
      },
    ],
  },
  {
    id: 'ending_03',
    number: '03',
    title: {
      id: 'YOU BLINKED (Kau Menoleh)',
      en: 'YOU BLINKED',
    },
    subtitle: {
      id: 'Melanggar aturan mutlak.',
      en: 'Violating the singular command.',
    },
    shortDescription: {
      id: 'Terjadi saat pemain memicu event Look Back dan menatap langsung entitas di belakangnya.',
      en: 'Triggered when the player executes Look Back and gazes directly into the entity behind them.',
    },
    teaserHint: {
      id: 'Ada saat di mana rasa penasaran mengalahkan rasa takut untuk menoleh.',
      en: 'A moment when curiosity overpowers fear, compelling you to turn around.',
    },
    sceneType: 'blinked',
    narrativeLines: [
      {
        id: 'Kau tidak tahan lagi. Kau menghentikan langkahmu dan memutar kepala ke belakang.',
        en: 'You could not endure it any longer. You halted your stride and turned your head.',
      },
      {
        id: 'BLINK. Layar berkedip hebat. Semua audio mendadak sunyi senyap tanpa desah napas.',
        en: 'BLINK. The screen flashes erratically. All sound cuts out into deafening dead silence.',
      },
      {
        id: 'Ruang dan waktu terlipat. Koridor neon runtuh menjadi serpihan piksel yang berputar.',
        en: 'Space and time fold. The neon corridor collapses into a swirling vortex of dead pixels.',
      },
      {
        id: 'Ketika matamu kembali terbuka, kau berdiri di tempat yang sama sekali berbeda... dan entitas itu kini berdiri di depanmu.',
        en: 'When your eyes open, you stand in an entirely different dimension... and the entity is standing right in front of you.',
      },
    ],
  },
  {
    id: 'ending_04',
    number: '04',
    title: {
      id: 'THE THING (Menjadi Sesuatu)',
      en: 'THE THING',
    },
    subtitle: {
      id: 'Tenggelam dalam korupsi siber.',
      en: 'Consumed by cyber corruption.',
    },
    shortDescription: {
      id: 'Karakter menyerap terlalu banyak materi anomali gelap hingga batas kemanusiaannya lenyap.',
      en: 'The runner absorbs an overdose of dark anomalies until the boundary of humanity dissolves.',
    },
    teaserHint: {
      id: 'Biarkan korupsi meresap ke dalam sirkuitmu dan hadapi bahaya malam tanpa ragu.',
      en: 'Let corruption seep into your circuits and embrace the deepest nocturnal danger.',
    },
    sceneType: 'thing',
    narrativeLines: [
      {
        id: 'Zat anomali ungu menyala di urat logam tubuhmu. Rasa sakit berganti menjadi euforia dingin.',
        en: 'Violet anomaly matter burns through your chassis conduits. Agony transforms into icy euphoria.',
      },
      {
        id: 'Kecepatanmu melipatgandakan batasan simulasi. Armor titaniummu mulai memancarkan kabut gelap yang pekat.',
        en: 'Your speed shatters simulation barriers. Your titanium armor emits a thick, encroaching dark miasma.',
      },
      {
        id: 'Karakter menatap bayangannya di lantai. Bayangan itu kini memiliki mata merah menyala dan tanduk frekuensi.',
        en: 'The runner stares at their reflection. The shadow now possesses crimson burning eyes and frequency horns.',
      },
      {
        id: 'Kau tidak lagi berlari dari entitas itu. Kau telah menjadi entitas berikutnya yang akan mengejar pelari baru.',
        en: 'You are no longer running from the entity. You have become the nightmare that will hunt the next runner.',
      },
    ],
  },
  {
    id: 'ending_05',
    number: '05',
    title: {
      id: 'THE MEMORY (Ingatan Silam)',
      en: 'THE MEMORY',
    },
    subtitle: {
      id: 'Mosaik masa lalu sebelum bencana.',
      en: 'The mosaic of the day before the crash.',
    },
    shortDescription: {
      id: 'Membuka seluruh tabir masa lalu sebelum permainan dimulai berkat kumpulan fragmen ingatan lengkap.',
      en: 'Unlocks the full flashback before the game began through an extensive collection of memory fragments.',
    },
    teaserHint: {
      id: 'Kumpulkan hampir semua fragmen ingatan masa lalu yang tercecer di lintasan.',
      en: 'Recover nearly all fragments of lost memories scattered across the course.',
    },
    sceneType: 'memory',
    narrativeLines: [
      {
        id: 'Pecahan kristal ingatan melayang di udara, bersatu membentuk hologram masa lalu yang utuh.',
        en: 'The memory crystals levitate, coalescing into an unbroken holographic timeline of the past.',
      },
      {
        id: 'Kau melihat dirimu tertawa di laboratorium bersama rekanmu sebelum alarm kebakaran reaktor meraung.',
        en: 'You see yourself smiling in the facility with your dearest colleague before the meltdown alarm shrieked.',
      },
      {
        id: 'Kau melihat saat-saat terakhir kau memasang helm antarmuka saraf ke kepalamu sendiri demi menyelamatkannya.',
        en: 'You witness the exact moment you strapped the neural interface onto yourself to save her from the blast.',
      },
      {
        id: 'Sekarang kau mengerti. Kau tidak berlari untuk melarikan diri dari musuh, kau berlari untuk menepati janjimu.',
        en: 'Now you understand. You were never fleeing an enemy; you were sprinting to honor your promise.',
      },
    ],
  },
  {
    id: 'ending_06',
    number: '06',
    title: {
      id: 'FALSE ESCAPE (Pelarian Semu)',
      en: 'FALSE ESCAPE',
    },
    subtitle: {
      id: 'Kemenangan yang menipu kesadaran.',
      en: 'A deceptive triumph of consciousness.',
    },
    shortDescription: {
      id: 'Pemain mengira telah menamatkan permainan saat credit mulai berjalan, sebelum kenyataan mengerikan memotongnya.',
      en: 'The player believes they conquered the run as end credits roll, before a chilling revelation cuts through.',
    },
    teaserHint: {
      id: 'Selesaikan pelarian tertentu tanpa menyadari jebakan ilusi waktu.',
      en: 'Complete an apparent escape while remaining blind to the temporal snare.',
    },
    sceneType: 'false_escape',
    narrativeLines: [
      {
        id: 'Pintu gerbang putih terbuka lebar. Lagu kemenangan berputar dengan nada ceria. Teks KREDIT mulai bergulir perlahan.',
        en: 'The grand white gates part wide. A triumphant melody swells. End credits begin to scroll peacefully.',
      },
      {
        id: 'Created by: KEHERCER... Game Design: KEHERCER... Terima kasih telah bermain...',
        en: 'Created by: KEHERCER... Game Design: KEHERCER... Thank you for playing...',
      },
      {
        id: '—GLITCH— Musik mendadak melambat, terdistorsi menjadi dengungan bass horor yang mengerikan.',
        en: '—GLITCH— The music suddenly drags down, twisting into a horrifying low-frequency screech.',
      },
      {
        id: 'Layar retak berkedip merah darah. Tulisan kredit terbakar menjadi abu piksel.',
        en: 'The screen fractures into pulsing blood-red static. The credits incinerate into pixel ashes.',
      },
      {
        id: '"YOU NEVER ESCAPED. CHAPTER BARU TELAH TERBUKA."',
        en: '"YOU NEVER ESCAPED. A NEW CHAPTER HAS BEEN UNLOCKED."',
      },
    ],
  },
  {
    id: 'ending_07',
    number: '07',
    title: {
      id: "DON'T BLINK (Ending Sejati)",
      en: "DON'T BLINK (True Ending)",
    },
    subtitle: {
      id: 'Kemenangan sejati atas siklus kematian.',
      en: 'The absolute triumph over the cycle of death.',
    },
    shortDescription: {
      id: 'Secret True Ending yang membutuhkan penguasaan skill, fragmen cerita banyak, awareness tinggi, dan rahasia terpecahkan.',
      en: 'The ultimate secret true ending requiring consummate skill, abundant fragments, high awareness, and deciphered secrets.',
    },
    teaserHint: {
      id: 'Kuasai seluruh misteri, jaga kesadaran tertinggi tanpa korupsi, dan temukan harmoni sejati.',
      en: 'Master all mysteries, maintain peak awareness without corruption, and discover true harmony.',
    },
    sceneType: 'dont_blink',
    narrativeLines: [
      {
        id: 'Di titik puncak lintasan, untuk pertama kalinya dalam sejarah simulasi, kau memutuskan untuk berhenti berlari secara sadar.',
        en: 'At the apex of the track, for the first time in simulated history, you consciously choose to bring your sprint to a halt.',
      },
      {
        id: 'Di belakangmu, entitas bayangan itu juga berhenti. Tidak ada serangan. Tidak ada teror.',
        en: 'Behind you, the shadowy entity also comes to a complete halt. No assault. No terror.',
      },
      {
        id: 'Karakter perlahan berbalik: "Jadi... selama ini kau tidak berniat menyakitiku."',
        en: 'The runner gently turns around: "So... all this time, you never wanted to harm me."',
      },
      {
        id: 'Entitas itu mengulurkan tangannya. Bayangan gelapnya terkelupas, memancarkan cahaya hangat seorang sahabat.',
        en: 'The entity reaches out its hand. Its dark shroud sheds away, revealing the radiant warmth of your companion.',
      },
      {
        id: '"Bangunlah," bisiknya lembut. "Dunia luar sudah menunggumu."',
        en: '"Wake up," she whispers softly. "The real world is waiting for you."',
      },
      {
        id: 'Kau membuka matamu di dunia nyata. Monitor rumah sakit berbunyi teratur. Kau berhasil selamat.',
        en: 'You open your eyes in the physical realm. The hospital monitor beeps in steady rhythm. You survived.',
      },
    ],
  },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'First Run / Langkah Perdana',
    description: 'Take your first leap into the danger zone / Mulai pelarian pertamamu.',
    icon: '🚀',
    unlocked: false,
  },
  {
    id: 'century',
    title: 'Century / Satu Abad',
    description: 'Reach a score of 100 points / Capai skor 100 poin.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner / Pelari Kilat',
    description: 'Survive at least 30 seconds in a single run / Bertahan 30 detik dalam satu putaran.',
    icon: '⏱️',
    unlocked: false,
  },
  {
    id: 'combo_master',
    title: 'Combo Master / Raja Kombo',
    description: 'Reach a blistering x6 combo multiplier / Raih pengali kombo x6.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'no_hit',
    title: 'Flawless Pace / Irama Sempurna',
    description: 'Survive 25 seconds with 5+ obstacles cleanly dodged / Lewati 5+ rintangan bersih.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'high_roller',
    title: 'High Roller / Master Skor',
    description: 'Score 1,000 points or more in one attempt / Raih 1.000 poin atau lebih.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'record_breaker',
    title: 'Record Breaker / Pemecah Rekor',
    description: 'Beat your previous personal best score / Pecahkan rekor pribadimu.',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'coin_collector',
    title: 'Orb Hoarder / Pengumpul Orb',
    description: 'Collect 50 total energy orbs across all runs / Kumpulkan 50 orb energi.',
    icon: '🪙',
    unlocked: false,
  },
  {
    id: 'fashionista',
    title: 'Style Icon / Ikon Gaya',
    description: 'Unlock any new custom character skin / Buka skin karakter baru.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'runner_distance',
    title: 'Runner / Pelari Sejati',
    description: 'Reach 2,500m total distance across all runs / Capai 2.500m total jarak.',
    icon: '👟',
    unlocked: false,
  },
  {
    id: 'survivor_danger',
    title: 'Survivor / Bertahan Hidup',
    description: 'Survive through the Night or Neon danger phase / Bertahan menembus fase malam/neon.',
    icon: '🌙',
    unlocked: false,
  },
  {
    id: 'memory_hunter',
    title: 'Memory Hunter / Pemburu Ingatan',
    description: 'Discover 5 or more Story Fragments / Temukan 5 atau lebih fragmen cerita.',
    icon: '🧩',
    unlocked: false,
  },
  {
    id: 'looking_back',
    title: 'Looking Back / Berani Menoleh',
    description: 'Trigger the Look Back event during a run / Picu aksi Menoleh (Look Back).',
    icon: '👁️',
    unlocked: false,
  },
  {
    id: 'not_afraid',
    title: 'Not Afraid / Tanpa Rasa Takut',
    description: 'Dodge 3 obstacles in high-speed danger mode / Hindari 3 rintangan di kecepatan tinggi.',
    icon: '⚔️',
    unlocked: false,
  },
  {
    id: 'the_truth_unlocked',
    title: 'The Truth / Membuka Kebenaran',
    description: 'Discover Ending 02: The Truth / Temukan Ending 02: The Truth.',
    icon: '📜',
    unlocked: false,
  },
  {
    id: 'all_stories',
    title: 'All Stories / Seluruh Kisah',
    description: 'Unlock 4 or more endings / Buka 4 atau lebih ending cerita.',
    icon: '🌌',
    unlocked: false,
  },
  {
    id: 'dont_blink_true',
    title: "DON'T BLINK / Mahakarya Sejati",
    description: "Unlock Secret Ending 07: DON'T BLINK / Buka Secret Ending 07: DON'T BLINK.",
    icon: '👁️‍🗨️',
    unlocked: false,
  },
];
