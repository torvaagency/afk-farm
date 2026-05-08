import { useState, useEffect } from "react";
import { PLANTS } from "./constants";

export interface FarmSlot {
  plantId: string;
  plantedAt: number;
  isHarvestable: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "xp" | "item";
}

export interface GameState {
  money: number;
  inventory: Record<string, number>; // plantId -> count of seeds
  crops: Record<string, number>; // plantId -> count of harvested crops
  items: Record<string, number>; // itemId -> count
  activeEffects: {
    speedBoostUntil: number;
  };
  level: number;
  exp: number;
  slots: (FarmSlot | null)[];
  unlockedSlots: number;
}

const INITIAL_STATE: GameState = {
  money: 20,
  inventory: {
    wheat: 1,
  },
  crops: {},
  items: {},
  activeEffects: {
    speedBoostUntil: 0,
  },
  level: 1,
  exp: 0,
  slots: Array(16).fill(null),
  unlockedSlots: 1,
};

export function useGameStore() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem("farming_game_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.items) parsed.items = {};
        if (!parsed.activeEffects) parsed.activeEffects = { speedBoostUntil: 0 };
        if (parsed.level === undefined) parsed.level = 1;
        if (parsed.exp === undefined) parsed.exp = 0;
        return parsed;
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    localStorage.setItem("farming_game_state", JSON.stringify(state));
  }, [state]);

  const getExpToNextLevel = (level: number) => {
    return Math.floor(Math.pow(level, 2.2) * 250);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        let changed = false;
        const isSpeedBoosted = Date.now() < prev.activeEffects.speedBoostUntil;
        const speedMultiplier = isSpeedBoosted ? 2 : 1;

        const newSlots = prev.slots.map((slot) => {
          if (!slot || slot.isHarvestable) return slot;
          const plant = PLANTS[slot.plantId];
          const elapsed = (Date.now() - slot.plantedAt) / 1000;
          if (elapsed * speedMultiplier >= plant.growTime) {
            changed = true;
            return { ...slot, isHarvestable: true };
          }
          return slot;
        });

        return changed ? { ...prev, slots: newSlots } : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const buySeed = (plantId: string) => {
    const plant = PLANTS[plantId];
    if (state.level < plant.levelRequired) {
      addToast(`Requires Level ${plant.levelRequired}!`, "info");
      return false;
    }
    if (state.money >= plant.cost) {
      setState((prev) => ({
        ...prev,
        money: prev.money - plant.cost,
        inventory: {
          ...prev.inventory,
          [plantId]: (prev.inventory[plantId] || 0) + 1,
        },
      }));
      addToast(`Bought ${plant.name} seed!`, "success");
      return true;
    }
    addToast("Not enough money!", "info");
    return false;
  };

  const plantSeed = (slotIndex: number, plantId: string) => {
    if (state.slots[slotIndex] === null && state.inventory[plantId] > 0) {
      setState((prev) => {
        const newSlots = [...prev.slots];
        newSlots[slotIndex] = {
          plantId,
          plantedAt: Date.now(),
          isHarvestable: false,
        };
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            [plantId]: prev.inventory[plantId] - 1,
          },
          slots: newSlots,
        };
      });
      return true;
    }
    return false;
  };

  const harvestCrop = (slotIndex: number) => {
    const slot = state.slots[slotIndex];
    if (slot && slot.isHarvestable) {
      const plant = PLANTS[slot.plantId];
      const expGain = Math.floor(plant.cost / 20) + 5;
      const foundPotion = Math.random() < 0.15;
      let finalLevel = state.level;
      
      setState((prev) => {
        const newSlots = [...prev.slots];
        newSlots[slotIndex] = null;
        
        let newExp = prev.exp + expGain;
        let newLevel = prev.level;
        
        while (newExp >= getExpToNextLevel(newLevel)) {
          newExp -= getExpToNextLevel(newLevel);
          newLevel++;
        }
        finalLevel = newLevel;

        let newItems = { ...prev.items };
        if (foundPotion) {
          const itemType = "speed_potion";
          newItems[itemType] = (newItems[itemType] || 0) + 1;
        }

        return {
          ...prev,
          crops: {
            ...prev.crops,
            [slot.plantId]: (prev.crops[slot.plantId] || 0) + 1,
          },
          items: newItems,
          slots: newSlots,
          level: newLevel,
          exp: newExp,
        };
      });

      // Fire toasts outside setState
      addToast(`+${expGain} XP`, "xp");
      if (finalLevel > state.level) {
        addToast(`LEVEL UP! You are now level ${finalLevel}!`, "success");
      }
      if (foundPotion) {
        addToast("Found a Speed Potion!", "item");
      }
      
      return true;
    }
    return false;
  };

  const useItem = (itemId: string) => {
    if (state.items[itemId] > 0) {
      if (itemId === "speed_potion") {
        setState((prev) => ({
          ...prev,
          items: {
            ...prev.items,
            [itemId]: prev.items[itemId] - 1,
          },
          activeEffects: {
            ...prev.activeEffects,
            speedBoostUntil: Date.now() + 60000,
          },
        }));
        addToast("Speed Boost Activated! (60s)", "success");
        return true;
      }
    }
    return false;
  };

  const sellCrop = (plantId: string) => {
    const count = state.crops[plantId] || 0;
    if (count > 0) {
      const plant = PLANTS[plantId];
      setState((prev) => ({
        ...prev,
        money: prev.money + plant.sellPrice,
        crops: {
          ...prev.crops,
          [plantId]: prev.crops[plantId] - 1,
        },
      }));
      addToast(`Sold ${plant.name} for $${plant.sellPrice}`, "success");
      return true;
    }
    return false;
  };

  const sellAllCrops = () => {
    let totalGain = 0;
    Object.entries(state.crops).forEach(([id, count]) => {
      totalGain += count * PLANTS[id].sellPrice;
    });

    if (totalGain > 0) {
      setState((prev) => ({
        ...prev,
        money: prev.money + totalGain,
        crops: {},
      }));
      addToast(`Sold everything for $${totalGain}`, "success");
    }
  };

  const buySlot = () => {
    const cost = Math.floor(Math.pow(state.unlockedSlots, 2.5) * 100);
    if (state.money >= cost && state.unlockedSlots < 16) {
      setState((prev) => ({
        ...prev,
        money: prev.money - cost,
        unlockedSlots: prev.unlockedSlots + 1,
      }));
      addToast(`Unlocked slot ${state.unlockedSlots + 1}!`, "success");
      return true;
    }
    addToast("Not enough money!", "info");
    return false;
  };

  const resetGame = () => {
    localStorage.removeItem("farming_game_state");
    setState(INITIAL_STATE);
  };

  return {
    state,
    toasts,
    buySeed,
    plantSeed,
    harvestCrop,
    sellCrop,
    sellAllCrops,
    buySlot,
    nextSlotCost: Math.floor(Math.pow(state.unlockedSlots, 2.5) * 100),
    useItem,
    isSpeedBoosted: Date.now() < state.activeEffects.speedBoostUntil,
    expToNextLevel: getExpToNextLevel(state.level),
    resetGame,
  };
}
