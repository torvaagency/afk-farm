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
  money: 100,
  inventory: {
    wheat: 5,
  },
  crops: {},
  items: {},
  activeEffects: {
    speedBoostUntil: 0,
  },
  level: 1,
  exp: 0,
  slots: Array(24).fill(null),
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
    return Math.floor(Math.pow(level, 1.4) * 80);
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

  // Auto-harvest logic (Diablo-style AFK feature)
  useEffect(() => {
    if (state.level < 5) return;

    const interval = setInterval(() => {
      state.slots.forEach((slot, index) => {
        if (slot?.isHarvestable) {
          harvestCrop(index);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [state.level, state.slots]);

  const buySeed = (plantId: string) => {
    const plant = PLANTS[plantId];
    if (state.level < plant.levelRequired) {
      addToast(`Requires Level ${plant.levelRequired}!`, "info");
      return false;
    }

    let success = false;
    setState((prev) => {
      if (prev.money >= plant.cost) {
        success = true;
        return {
          ...prev,
          money: prev.money - plant.cost,
          inventory: {
            ...prev.inventory,
            [plantId]: (prev.inventory[plantId] || 0) + 1,
          },
        };
      }
      return prev;
    });

    if (success) {
      addToast(`Bought ${plant.name} seed!`, "success");
    } else {
      addToast("Not enough money!", "info");
    }
    return success;
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
      // Diablo scaling: square root of cost + level bonus
      const expGain = Math.floor(Math.sqrt(plant.cost) * 2) + (plant.levelRequired * 5);
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
    let success = false;
    setState((prev) => {
      if ((prev.items[itemId] || 0) > 0) {
        success = true;
        if (itemId === "speed_potion") {
          return {
            ...prev,
            items: {
              ...prev.items,
              [itemId]: prev.items[itemId] - 1,
            },
            activeEffects: {
              ...prev.activeEffects,
              speedBoostUntil: Date.now() + 60000,
            },
          };
        }
      }
      return prev;
    });

    if (success && itemId === "speed_potion") {
      addToast("Speed Boost Activated! (60s)", "success");
    }
    return success;
  };

  const sellCrop = (plantId: string) => {
    const plant = PLANTS[plantId];
    let success = false;

    setState((prev) => {
      const currentCount = prev.crops[plantId] || 0;
      if (currentCount > 0) {
        success = true;
        return {
          ...prev,
          money: prev.money + plant.sellPrice,
          crops: {
            ...prev.crops,
            [plantId]: currentCount - 1,
          },
        };
      }
      return prev;
    });

    if (success) {
      addToast(`Sold ${plant.name} for $${plant.sellPrice}`, "success");
    }
    return success;
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
    let success = false;

    setState((prev) => {
      if (prev.money >= cost && prev.unlockedSlots < 24) {
        success = true;
        return {
          ...prev,
          money: prev.money - cost,
          unlockedSlots: prev.unlockedSlots + 1,
        };
      }
      return prev;
    });

    if (success) {
      addToast(`Unlocked slot ${state.unlockedSlots + 1}!`, "success");
    } else {
      addToast("Not enough money!", "info");
    }
    return success;
  };

  const sellSeed = (plantId: string) => {
    const plant = PLANTS[plantId];
    let success = false;
    const sellPrice = Math.floor(plant.cost * 0.5);

    setState((prev) => {
      if ((prev.inventory[plantId] || 0) > 0) {
        success = true;
        return {
          ...prev,
          money: prev.money + sellPrice,
          inventory: {
            ...prev.inventory,
            [plantId]: prev.inventory[plantId] - 1,
          },
        };
      }
      return prev;
    });

    if (success) {
      addToast(`Sold ${plant.name} seed for $${sellPrice}`, "success");
    }
    return success;
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
    sellSeed,
    sellAllCrops,
    buySlot,
    nextSlotCost: Math.floor(Math.pow(state.unlockedSlots, 2.5) * 100),
    useItem,
    isSpeedBoosted: Date.now() < state.activeEffects.speedBoostUntil,
    expToNextLevel: getExpToNextLevel(state.level),
    resetGame,
    addToast,
  };
}
