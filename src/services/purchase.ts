// ==============================================================================
// Monetization Architecture: PurchaseService & DummyPurchaseService
// Section 14 & Final Polish Spec
// Compatible with GooglePlayPurchaseService and future backend verification.
// ==============================================================================

import { PurchaseRecord, SkinId, EntitySkinId, OrbCosmeticId } from '../types';
import { storage } from './storage';
import { getOrCreateGuestPlayerId } from './identity';
import { STORE_PRODUCTS, BUNDLES, PLAYER_SKINS, ENTITY_SKINS, ORB_COSMETICS } from '../data/cosmeticsData';

export interface ProductInfo {
  id: string;
  name: string;
  description: string;
  priceDisplay: string;
  priceRp: number;
}

export interface IPurchaseService {
  getProducts(): Promise<ProductInfo[]>;
  purchase(productId: string): Promise<{ success: boolean; message: string; transaction?: PurchaseRecord }>;
  restorePurchases(): Promise<{ success: boolean; count: number; message: string }>;
}

export class DummyPurchaseService implements IPurchaseService {
  public async getProducts(): Promise<ProductInfo[]> {
    const list: ProductInfo[] = [];

    // Core Products
    for (const p of Object.values(STORE_PRODUCTS)) {
      list.push({
        id: p.id,
        name: p.name,
        description: p.description,
        priceDisplay: p.priceDisplay,
        priceRp: p.priceRp,
      });
    }

    // Bundles
    for (const b of BUNDLES) {
      list.push({
        id: b.id,
        name: b.name,
        description: b.description,
        priceDisplay: b.priceDisplay,
        priceRp: b.priceRp,
      });
    }

    // Premium Player Skins
    for (const s of PLAYER_SKINS.filter((x) => x.category === 'PREMIUM')) {
      list.push({
        id: s.id,
        name: s.name,
        description: s.description,
        priceDisplay: s.priceDisplay || 'Rp20.000',
        priceRp: s.priceRp || 20000,
      });
    }

    // Premium Entity Skins
    for (const e of ENTITY_SKINS.filter((x) => x.category === 'PREMIUM')) {
      list.push({
        id: e.id,
        name: e.name,
        description: e.description,
        priceDisplay: e.priceDisplay || 'Rp20.000',
        priceRp: e.priceRp || 20000,
      });
    }

    // Premium Orbs
    for (const o of ORB_COSMETICS) {
      list.push({
        id: o.id,
        name: o.name,
        description: o.description,
        priceDisplay: o.priceDisplay,
        priceRp: o.priceRp,
      });
    }

    return list;
  }

  public async purchase(productId: string): Promise<{ success: boolean; message: string; transaction?: PurchaseRecord }> {
    const playerId = getOrCreateGuestPlayerId();
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const purchasedAt = Date.now();

    const record: PurchaseRecord = {
      transaction_id: transactionId,
      product_id: productId,
      player_id: playerId,
      platform: 'web',
      purchased_at: purchasedAt,
      verification_status: 'mock_verified',
    };

    try {
      // 1. Core Products
      if (productId === 'remove_ads') {
        storage.removeAds();
        storage.recordPurchase(record);
        return {
          success: true,
          message: 'Ads removed successfully! Rewarded revive remains available.',
          transaction: record,
        };
      }

      if (productId === 'full_story') {
        storage.setFullStoryUnlocked(true);
        storage.recordPurchase(record);
        return {
          success: true,
          message: 'Full Story Unlocked! All journal chapters are now available.',
          transaction: record,
        };
      }

      if (productId === 'supporter_pack') {
        storage.setSupporterPackUnlocked(true);
        storage.unlockSkinFree('default');
        storage.recordPurchase(record);
        return {
          success: true,
          message: 'Supporter Pack activated! Thank you for supporting DON’T BLINK.',
          transaction: record,
        };
      }

      // 2. Bundles
      const bundle = BUNDLES.find((b) => b.id === productId);
      if (bundle) {
        storage.addPurchasedBundle(bundle.id);
        for (const item of bundle.itemIds) {
          if (item.type === 'player') {
            storage.unlockSkinFree(item.id as SkinId);
          } else if (item.type === 'entity') {
            storage.unlockEntitySkinFree(item.id as EntitySkinId);
          } else if (item.type === 'orb') {
            storage.unlockOrbCosmetic(item.id as OrbCosmeticId);
          }
        }
        storage.recordPurchase(record);
        return {
          success: true,
          message: `${bundle.name} unlocked successfully! All items added to your locker.`,
          transaction: record,
        };
      }

      // 3. Player Skin
      const playerSkin = PLAYER_SKINS.find((s) => s.id === productId);
      if (playerSkin) {
        storage.unlockSkinFree(playerSkin.id as SkinId);
        storage.selectSkin(playerSkin.id as SkinId);
        storage.recordPurchase(record);
        return {
          success: true,
          message: `${playerSkin.name} unlocked and equipped!`,
          transaction: record,
        };
      }

      // 4. Entity Skin
      const entitySkin = ENTITY_SKINS.find((e) => e.id === productId);
      if (entitySkin) {
        storage.unlockEntitySkinFree(entitySkin.id as EntitySkinId);
        storage.selectEntitySkin(entitySkin.id as EntitySkinId);
        storage.recordPurchase(record);
        return {
          success: true,
          message: `${entitySkin.name} entity visual unlocked and equipped!`,
          transaction: record,
        };
      }

      // 5. Orb Cosmetic
      const orb = ORB_COSMETICS.find((o) => o.id === productId);
      if (orb) {
        storage.unlockOrbCosmetic(orb.id as OrbCosmeticId);
        storage.selectOrbCosmetic(orb.id as OrbCosmeticId);
        storage.recordPurchase(record);
        return {
          success: true,
          message: `${orb.name} artefact unlocked and equipped!`,
          transaction: record,
        };
      }

      return {
        success: false,
        message: `Unknown product: ${productId}`,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Transaction simulation encountered an unexpected error.',
      };
    }
  }

  public async restorePurchases(): Promise<{ success: boolean; count: number; message: string }> {
    const data = storage.getData();
    const history = data.purchaseHistory || [];
    let count = 0;

    for (const record of history) {
      const pid = record.product_id;
      if (pid === 'remove_ads') {
        storage.removeAds();
        count++;
      } else if (pid === 'full_story') {
        storage.setFullStoryUnlocked(true);
        count++;
      } else if (pid === 'supporter_pack') {
        storage.setSupporterPackUnlocked(true);
        count++;
      } else if (pid.startsWith('bundle_')) {
        const bundle = BUNDLES.find((b) => b.id === pid);
        if (bundle) {
          storage.addPurchasedBundle(bundle.id);
          for (const item of bundle.itemIds) {
            if (item.type === 'player') storage.unlockSkinFree(item.id as SkinId);
            if (item.type === 'entity') storage.unlockEntitySkinFree(item.id as EntitySkinId);
            if (item.type === 'orb') storage.unlockOrbCosmetic(item.id as OrbCosmeticId);
          }
          count++;
        }
      } else {
        // Individual items
        if (PLAYER_SKINS.some((s) => s.id === pid)) {
          storage.unlockSkinFree(pid as SkinId);
          count++;
        }
        if (ENTITY_SKINS.some((e) => e.id === pid)) {
          storage.unlockEntitySkinFree(pid as EntitySkinId);
          count++;
        }
        if (ORB_COSMETICS.some((o) => o.id === pid)) {
          storage.unlockOrbCosmetic(pid as OrbCosmeticId);
          count++;
        }
      }
    }

    return {
      success: true,
      count,
      message: count > 0 ? `Restored ${count} purchased item(s) successfully!` : 'No previous purchases found to restore.',
    };
  }
}

export const purchases = new DummyPurchaseService();
