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
  slots: Array(32).fill(null),
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
          if (!plant) return null;
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
      let finalLevel = state.level;
      let foundSpeedPotion = false;
      let foundHarvestPotion = false;
      let foundFinishPotion = false;

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

        foundSpeedPotion = Math.random() < 0.05;
        foundHarvestPotion = Math.random() < 0.03;
        foundFinishPotion = Math.random() < 0.02; // Rare drop
        let newItems = { ...prev.items };

        if (foundSpeedPotion) {
          newItems["speed_potion"] = (newItems["speed_potion"] || 0) + 1;
        }
        if (foundHarvestPotion) {
          newItems["harvest_potion"] = (newItems["harvest_potion"] || 0) + 1;
        }
        if (foundFinishPotion) {
          newItems["finish_potion"] = (newItems["finish_potion"] || 0) + 1;
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
      if (foundSpeedPotion) {
        addToast("Found a Speed Potion!", "item");
      } else if (foundHarvestPotion) {
        addToast("Found a Harvest Potion!", "item");
      } else if (foundFinishPotion) {
        addToast("Found an Instant Finish Potion!", "item");
      }

      return true;
    }
    return false;
  };

  const useItem = (itemId: string) => {
    let success = false;

    if (itemId === "harvest_potion") {
      const harvestableIndices = state.slots
        .map((slot, i) => (slot?.isHarvestable ? i : -1))
        .filter((i) => i !== -1);

      if (harvestableIndices.length > 0) {
        let totalExpGain = 0;
        let finalLevel = state.level;

        setState((prev) => {
          const newSlots = [...prev.slots];
          const newCrops = { ...prev.crops };
          const newItems = { ...prev.items };

          harvestableIndices.forEach((idx) => {
            const slot = prev.slots[idx]!;
            const plant = PLANTS[slot.plantId];
            const exp = Math.floor(Math.sqrt(plant.cost) * 2) + (plant.levelRequired * 5);
            
            totalExpGain += exp;
            newCrops[slot.plantId] = (newCrops[slot.plantId] || 0) + 1;
            newSlots[idx] = null;

            // Optional: Still allow potion drops from mass harvest
            if (Math.random() < 0.05) newItems["speed_potion"] = (newItems["speed_potion"] || 0) + 1;
            if (Math.random() < 0.03) newItems["harvest_potion"] = (newItems["harvest_potion"] || 0) + 1;
            if (Math.random() < 0.02) newItems["finish_potion"] = (newItems["finish_potion"] || 0) + 1;
          });

          // Handle Level Ups
          let newExp = prev.exp + totalExpGain;
          let newLevel = prev.level;
          while (newExp >= getExpToNextLevel(newLevel)) {
            newExp -= getExpToNextLevel(newLevel);
            newLevel++;
          }
          finalLevel = newLevel;

          // Consume Potion
          newItems[itemId] = (newItems[itemId] || 0) - 1;

          return {
            ...prev,
            slots: newSlots,
            crops: newCrops,
            items: newItems,
            level: newLevel,
            exp: newExp,
          };
        });

        addToast(`Gale Harvested ${harvestableIndices.length} crops! +${totalExpGain} XP`, "success");
        if (finalLevel > state.level) {
          addToast(`LEVEL UP! You are now level ${finalLevel}!`, "success");
        }
        return true;
      } else {
        addToast("No crops ready for harvest!", "info");
        return false;
      }
    }

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

  const instantFinish = (slotIndex: number) => {
    let success = false;
    setState((prev) => {
      const slot = prev.slots[slotIndex];
      if (slot && !slot.isHarvestable && (prev.items["finish_potion"] || 0) > 0) {
        success = true;
        const newSlots = [...prev.slots];
        newSlots[slotIndex] = { ...slot, isHarvestable: true };
        return {
          ...prev,
          slots: newSlots,
          items: {
            ...prev.items,
            finish_potion: prev.items["finish_potion"] - 1,
          },
        };
      }
      return prev;
    });

    if (success) {
      addToast("Chrono-Essence used! Crop is ready.", "success");
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
      if (prev.money >= cost && prev.unlockedSlots < 32) {
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

  const sellSlot = (slotIndex: number) => {
    if (state.unlockedSlots <= 1) {
      addToast("Cannot sell the starting patch!", "info");
      return false;
    }

    if (state.slots[slotIndex] !== null) {
      addToast("Cannot sell a patch with a growing crop!", "info");
      return false;
    }

    const purchasePrice = Math.floor(Math.pow(state.unlockedSlots - 1, 2.5) * 100);
    const sellPrice = Math.floor(purchasePrice * 0.5);

    setState((prev) => {
      const newSlots = [...prev.slots];
      // Remove the slot at slotIndex and shift others left
      newSlots.splice(slotIndex, 1);
      // Maintain array size of 32
      newSlots.push(null);

      return {
        ...prev,
        money: prev.money + sellPrice,
        unlockedSlots: prev.unlockedSlots - 1,
        slots: newSlots,
      };
    });

    addToast(`Sold patch for $${sellPrice.toLocaleString()}`, "success");
    return true;
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
    instantFinish,
    sellAllCrops,
    buySlot,
    sellSlot,
    nextSlotCost: Math.floor(Math.pow(state.unlockedSlots, 2.5) * 100),
    lastSlotSellPrice: state.unlockedSlots > 1 ? Math.floor(Math.floor(Math.pow(state.unlockedSlots - 1, 2.5) * 100) * 0.5) : 0,
    useItem,
    isSpeedBoosted: Date.now() < state.activeEffects.speedBoostUntil,
    expToNextLevel: getExpToNextLevel(state.level),
    resetGame,
    addToast,
  };
}
