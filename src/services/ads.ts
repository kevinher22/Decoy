// Monetization Architecture: AdService (Section 13)
// Modular, privacy-respecting ad orchestration ready for Google AdSense / AdMob / WebAds
import { storage } from './storage';
import { analytics } from './analytics';

export type AdPlacement = 'game_over_interstitial' | 'rewarded_extra_coins' | 'rewarded_second_chance';

export interface AdEventPayload {
  placement: AdPlacement;
  rewardEarned?: boolean;
}

export interface IAdService {
  isAdAvailable(placement: AdPlacement): Promise<boolean>;
  showInterstitial(placement?: AdPlacement): Promise<boolean>;
  showRewarded(
    placement: AdPlacement,
    onReward: () => void,
    onClose?: () => void
  ): Promise<boolean>;
  isAdsRemoved(): boolean;
}

class AdService implements IAdService {
  private isInitialized: boolean = false;
  private adRunning: boolean = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.info('[AdService] Monetization architecture ready.');
  }

  public isAdsRemoved(): boolean {
    return !!storage.getData().adsRemoved;
  }

  public async isAdAvailable(placement: AdPlacement): Promise<boolean> {
    if (placement === 'game_over_interstitial') {
      return !this.isAdsRemoved();
    }
    // Rewarded revives and bonus coin opportunities remain available even if Remove Ads is purchased
    return true;
  }

  public async showInterstitial(placement: AdPlacement = 'game_over_interstitial'): Promise<boolean> {
    if (this.isAdsRemoved() || this.adRunning) return false;

    this.adRunning = true;
    analytics.logEvent('ad_interstitial_requested', { placement });

    // Simulated graceful interstitial presentation without blocking the user
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.adRunning = false;
    analytics.logEvent('ad_interstitial_completed', { placement });
    return true;
  }

  public async showRewarded(
    placement: AdPlacement,
    onReward: () => void,
    onClose?: () => void
  ): Promise<boolean> {
    if (this.adRunning) return false;

    // If Remove Ads is purchased, award the reward instantly without ad delay!
    if (this.isAdsRemoved()) {
      analytics.logEvent('ad_rewarded_instant_vip', { placement });
      onReward();
      onClose?.();
      return true;
    }

    this.adRunning = true;
    analytics.logEvent('ad_rewarded_requested', { placement });

    // Simulated short sponsored break
    setTimeout(() => {
      this.adRunning = false;
      onReward();
      analytics.logEvent('ad_rewarded_completed', { placement });
      onClose?.();
    }, 450);

    return true;
  }
}

export const ads = new AdService();
