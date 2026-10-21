import { useState, useEffect } from "react";
import { PLANTS } from "./constants";
import {
  type WeatherType,
  WEATHERS,
  WEATHER_DURATION,
  type Quest,
  INITIAL_QUESTS,
  ACHIEVEMENTS,
  BOT_TIERS,
} from "./features";

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

export interface GameStats {
  totalHarvested: number;
  totalPlanted: number;
  totalEarned: number;
  rainHarvests: number;
  potionsUsed: number;
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

  // Weather System
  weather: {
    type: WeatherType;
    nextChangeAt: number;
  };

  // Auto-Harvester / Farm Bot
  autoHarvester: {
    level: number; // 0 = none, 1 = Scarecrow, 2 = Planter Drone, 3 = Quantum Agribot
    enabled: boolean;
  };

  // Quests & Achievements
  stats: GameStats;
  quests: Quest[];
  achievementsClaimed: Record<string, boolean>;
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

  weather: {
    type: "sunny",
    nextChangeAt: Date.now() + WEATHER_DURATION,
  },

  autoHarvester: {
    level: 0,
    enabled: true,
  },

  stats: {
    totalHarvested: 0,
    totalPlanted: 0,
    totalEarned: 0,
    rainHarvests: 0,
    potionsUsed: 0,
  },

  quests: INITIAL_QUESTS,
  achievementsClaimed: {},
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
        if (!parsed.weather) {
          parsed.weather = {
            type: "sunny",
            nextChangeAt: Date.now() + WEATHER_DURATION,
          };
        }
        if (!parsed.autoHarvester) {
          parsed.autoHarvester = { level: 0, enabled: true };
        }
        if (!parsed.stats) {
          parsed.stats = {
            totalHarvested: 0,
            totalPlanted: 0,
            totalEarned: 0,
            rainHarvests: 0,
            potionsUsed: 0,
          };
        }
        if (!parsed.quests || parsed.quests.length === 0) {
          parsed.quests = INITIAL_QUESTS;
        }
        if (!parsed.achievementsClaimed) {
          parsed.achievementsClaimed = {};
        }
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
    }, 3200);
  };

  useEffect(() => {
    localStorage.setItem("farming_game_state", JSON.stringify(state));
  }, [state]);

  const getExpToNextLevel = (level: number) => {
    return Math.floor(Math.pow(level, 1.4) * 80);
  };

  // Main game tick (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      setState((prev) => {
        let changed = false;

        // 1. Weather Update Check
        let currentWeather = prev.weather;
        if (now >= prev.weather.nextChangeAt) {
          const weatherKeys: WeatherType[] = ["sunny", "rain", "thunderstorm", "golden_hour"];
          const available = weatherKeys.filter((w) => w !== prev.weather.type);
          const nextType = available[Math.floor(Math.random() * available.length)];
          currentWeather = {
            type: nextType,
            nextChangeAt: now + WEATHER_DURATION,
          };
          changed = true;
          const info = WEATHERS[nextType];
          setTimeout(() => {
            addToast(`${info.emoji} Weather is now ${info.name}! (${info.badge})`, "info");
          }, 50);
        }

        // 2. Growth Calculation
        const isSpeedBoosted = now < prev.activeEffects.speedBoostUntil;
        const weatherMultiplier = WEATHERS[currentWeather.type]?.growthMultiplier || 1;
        const speedMultiplier = (isSpeedBoosted ? 2 : 1) * weatherMultiplier;

        let newSlots = [...prev.slots];
        let hasGrown = false;

        for (let i = 0; i < newSlots.length; i++) {
          const slot = newSlots[i];
          if (!slot || slot.isHarvestable) continue;
          const plant = PLANTS[slot.plantId];
          if (!plant) continue;
          const elapsed = (now - slot.plantedAt) / 1000;
          if (elapsed * speedMultiplier >= plant.growTime) {
            newSlots[i] = { ...slot, isHarvestable: true };
            hasGrown = true;
          }
        }

        if (hasGrown) changed = true;

        // 3. Auto-Harvester / Farm Bot Check
        let newCrops = { ...prev.crops };
        let newInventory = { ...prev.inventory };
        let newItems = { ...prev.items };
        let newExp = prev.exp;
        let newLevel = prev.level;
        let newStats = { ...prev.stats };
        let newQuests = [...prev.quests];

        const botActive = prev.autoHarvester.enabled && prev.autoHarvester.level > 0;
        let botHarvestCount = 0;

        if (botActive) {
          for (let i = 0; i < prev.unlockedSlots; i++) {
            const slot = newSlots[i];
            if (slot && slot.isHarvestable) {
              const plant = PLANTS[slot.plantId];
              if (!plant) continue;

              botHarvestCount++;
              newCrops[slot.plantId] = (newCrops[slot.plantId] || 0) + 1;
              const expGain = Math.floor(Math.sqrt(plant.cost) * 2) + (plant.levelRequired * 5);
              newExp += expGain;

              newStats.totalHarvested += 1;
              if (currentWeather.type === "rain" || currentWeather.type === "thunderstorm") {
                newStats.rainHarvests += 1;
              }

              // Potion drop chance
              if (Math.random() < 0.05) newItems["speed_potion"] = (newItems["speed_potion"] || 0) + 1;
              if (Math.random() < 0.03) newItems["harvest_potion"] = (newItems["harvest_potion"] || 0) + 1;
              if (Math.random() < 0.02) newItems["finish_potion"] = (newItems["finish_potion"] || 0) + 1;

              // Bot Level >= 2: Auto-replant if seeds exist in inventory!
              if (prev.autoHarvester.level >= 2 && (newInventory[slot.plantId] || 0) > 0) {
                newInventory[slot.plantId] -= 1;
                newSlots[i] = {
                  plantId: slot.plantId,
                  plantedAt: now,
                  isHarvestable: false,
                };
                newStats.totalPlanted += 1;
              } else {
                newSlots[i] = null;
              }

              changed = true;
            }
          }

          if (botHarvestCount > 0) {
            // Level up check
            while (newExp >= getExpToNextLevel(newLevel)) {
              newExp -= getExpToNextLevel(newLevel);
              newLevel++;
              setTimeout(() => {
                addToast(`LEVEL UP! You are now level ${newLevel}!`, "success");
              }, 100);
            }

            // Update harvest & weather quests
            newQuests = newQuests.map((q) => {
              if (q.category === "harvest") {
                const nextProg = Math.min(q.target, q.progress + botHarvestCount);
                return { ...q, progress: nextProg, completed: nextProg >= q.target };
              }
              if (q.category === "weather" && (currentWeather.type === "rain" || currentWeather.type === "thunderstorm")) {
                const nextProg = Math.min(q.target, q.progress + botHarvestCount);
                return { ...q, progress: nextProg, completed: nextProg >= q.target };
              }
              return q;
            });
          }
        }

        if (!changed) return prev;

        return {
          ...prev,
          weather: currentWeather,
          slots: newSlots,
          crops: newCrops,
          inventory: newInventory,
          items: newItems,
          exp: newExp,
          level: newLevel,
          stats: newStats,
          quests: newQuests,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ------------------------------ Buy Seed ------------------------------- */
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

  /* ------------------------------ Plant Seed ------------------------------ */
  const plantSeed = (slotIndex: number, plantId: string) => {
    if (state.slots[slotIndex] === null && (state.inventory[plantId] || 0) > 0) {
      setState((prev) => {
        const newSlots = [...prev.slots];
        newSlots[slotIndex] = {
          plantId,
          plantedAt: Date.now(),
          isHarvestable: false,
        };

        const newQuests = prev.quests.map((q) => {
          if (q.category === "plant") {
            const nextProg = Math.min(q.target, q.progress + 1);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          return q;
        });

        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            [plantId]: prev.inventory[plantId] - 1,
          },
          slots: newSlots,
          stats: {
            ...prev.stats,
            totalPlanted: prev.stats.totalPlanted + 1,
          },
          quests: newQuests,
        };
      });
      return true;
    }
    return false;
  };

  /* ----------------------------- Harvest Crop ----------------------------- */
  const harvestCrop = (slotIndex: number) => {
    const slot = state.slots[slotIndex];
    if (slot && slot.isHarvestable) {
      const plant = PLANTS[slot.plantId];
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
        foundFinishPotion = Math.random() < 0.02;
        let newItems = { ...prev.items };

        if (foundSpeedPotion) newItems["speed_potion"] = (newItems["speed_potion"] || 0) + 1;
        if (foundHarvestPotion) newItems["harvest_potion"] = (newItems["harvest_potion"] || 0) + 1;
        if (foundFinishPotion) newItems["finish_potion"] = (newItems["finish_potion"] || 0) + 1;

        const isStormy = prev.weather.type === "rain" || prev.weather.type === "thunderstorm";
        const newStats = {
          ...prev.stats,
          totalHarvested: prev.stats.totalHarvested + 1,
          rainHarvests: prev.stats.rainHarvests + (isStormy ? 1 : 0),
        };

        const newQuests = prev.quests.map((q) => {
          if (q.category === "harvest") {
            const nextProg = Math.min(q.target, q.progress + 1);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          if (q.category === "weather" && isStormy) {
            const nextProg = Math.min(q.target, q.progress + 1);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          return q;
        });

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
          stats: newStats,
          quests: newQuests,
        };
      });

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

  /* ------------------------------- Use Item ------------------------------- */
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

            if (Math.random() < 0.05) newItems["speed_potion"] = (newItems["speed_potion"] || 0) + 1;
            if (Math.random() < 0.03) newItems["harvest_potion"] = (newItems["harvest_potion"] || 0) + 1;
            if (Math.random() < 0.02) newItems["finish_potion"] = (newItems["finish_potion"] || 0) + 1;
          });

          let newExp = prev.exp + totalExpGain;
          let newLevel = prev.level;
          while (newExp >= getExpToNextLevel(newLevel)) {
            newExp -= getExpToNextLevel(newLevel);
            newLevel++;
          }
          finalLevel = newLevel;

          newItems[itemId] = (newItems[itemId] || 0) - 1;

          const isStormy = prev.weather.type === "rain" || prev.weather.type === "thunderstorm";
          const newStats = {
            ...prev.stats,
            totalHarvested: prev.stats.totalHarvested + harvestableIndices.length,
            rainHarvests: prev.stats.rainHarvests + (isStormy ? harvestableIndices.length : 0),
            potionsUsed: prev.stats.potionsUsed + 1,
          };

          return {
            ...prev,
            slots: newSlots,
            crops: newCrops,
            items: newItems,
            level: newLevel,
            exp: newExp,
            stats: newStats,
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
            stats: {
              ...prev.stats,
              potionsUsed: prev.stats.potionsUsed + 1,
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

  /* ----------------------------- Instant Finish ---------------------------- */
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
          stats: {
            ...prev.stats,
            potionsUsed: prev.stats.potionsUsed + 1,
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

  /* ------------------------------- Sell Crop ------------------------------- */
  const calculateSellPrice = (basePrice: number) => {
    let multiplier = 1;
    if (state.weather.type === "golden_hour") multiplier *= 1.5;
    if (state.autoHarvester.level >= 3) multiplier *= 1.15;
    return Math.floor(basePrice * multiplier);
  };

  const sellCrop = (plantId: string) => {
    const plant = PLANTS[plantId];
    let success = false;
    let earned = 0;

    setState((prev) => {
      const currentCount = prev.crops[plantId] || 0;
      if (currentCount > 0) {
        success = true;
        const price = calculateSellPrice(plant.sellPrice);
        earned = price;

        const newQuests = prev.quests.map((q) => {
          if (q.category === "sell") {
            const nextProg = Math.min(q.target, q.progress + 1);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          if (q.category === "earn") {
            const nextProg = Math.min(q.target, q.progress + price);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          return q;
        });

        return {
          ...prev,
          money: prev.money + price,
          crops: {
            ...prev.crops,
            [plantId]: currentCount - 1,
          },
          stats: {
            ...prev.stats,
            totalEarned: prev.stats.totalEarned + price,
          },
          quests: newQuests,
        };
      }
      return prev;
    });

    if (success) {
      const bonusText = state.weather.type === "golden_hour" ? " (Golden Hour 1.5x!)" : "";
      addToast(`Sold ${plant.name} for $${earned.toLocaleString()}${bonusText}`, "success");
    }
    return success;
  };

  const sellAllCrops = () => {
    let totalGain = 0;
    let totalCropCount = 0;
    Object.entries(state.crops).forEach(([id, count]) => {
      const price = calculateSellPrice(PLANTS[id]?.sellPrice || 0);
      totalGain += count * price;
      totalCropCount += count;
    });

    if (totalGain > 0) {
      setState((prev) => {
        const newQuests = prev.quests.map((q) => {
          if (q.category === "sell") {
            const nextProg = Math.min(q.target, q.progress + totalCropCount);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          if (q.category === "earn") {
            const nextProg = Math.min(q.target, q.progress + totalGain);
            return { ...q, progress: nextProg, completed: nextProg >= q.target };
          }
          return q;
        });

        return {
          ...prev,
          money: prev.money + totalGain,
          crops: {},
          stats: {
            ...prev.stats,
            totalEarned: prev.stats.totalEarned + totalGain,
          },
          quests: newQuests,
        };
      });

      const bonusText = state.weather.type === "golden_hour" ? " (with 1.5x Golden Hour bonus!)" : "";
      addToast(`Sold all crops for $${totalGain.toLocaleString()}${bonusText}`, "success");
    }
  };

  /* ------------------------------- Plot Mgmt ------------------------------- */
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
      newSlots.splice(slotIndex, 1);
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

  /* ----------------------- Farm Fairy Controls ----------------------- */
  const toggleBot = () => {
    setState((prev) => ({
      ...prev,
      autoHarvester: {
        ...prev.autoHarvester,
        enabled: !prev.autoHarvester.enabled,
      },
    }));
    addToast(state.autoHarvester.enabled ? "Farm Fairy resting." : "Farm Fairy fluttered into action!", "info");
  };

  const upgradeBot = () => {
    const nextTier = BOT_TIERS[state.autoHarvester.level];
    if (!nextTier) return;

    if (state.level < nextTier.levelRequired) {
      addToast(`Requires Farm Level ${nextTier.levelRequired}!`, "info");
      return;
    }
    if (state.money < nextTier.cost) {
      addToast(`Not enough gold! Needs $${nextTier.cost.toLocaleString()}`, "info");
      return;
    }

    setState((prev) => ({
      ...prev,
      money: prev.money - nextTier.cost,
      autoHarvester: {
        ...prev.autoHarvester,
        level: prev.autoHarvester.level + 1,
        enabled: true,
      },
    }));

    addToast(`Attuned Farm Fairy to ${nextTier.name}!`, "success");
  };

  /* ------------------- Quests & Achievements Claims ------------------- */
  const claimQuest = (questId: string) => {
    setState((prev) => {
      const quest = prev.quests.find((q) => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;

      let newItems = { ...prev.items };
      if (quest.reward.item) {
        newItems[quest.reward.item] = (newItems[quest.reward.item] || 0) + 1;
      }

      let newExp = prev.exp + quest.reward.exp;
      let newLevel = prev.level;
      while (newExp >= getExpToNextLevel(newLevel)) {
        newExp -= getExpToNextLevel(newLevel);
        newLevel++;
      }

      // Roll into the next tier of this quest!
      const nextQuests = prev.quests.map((q) => {
        if (q.id === questId) {
          const nextTarget = Math.floor(q.target * 1.8);
          const nextMoney = Math.floor(q.reward.money * 1.6);
          const nextExpReward = Math.floor(q.reward.exp * 1.5);
          return {
            ...q,
            target: nextTarget,
            progress: 0,
            completed: false,
            claimed: false,
            reward: {
              money: nextMoney,
              exp: nextExpReward,
              item: q.reward.item,
            },
          };
        }
        return q;
      });

      addToast(`Claimed quest: +$${quest.reward.money} & +${quest.reward.exp} XP!`, "success");

      return {
        ...prev,
        money: prev.money + quest.reward.money,
        items: newItems,
        exp: newExp,
        level: newLevel,
        quests: nextQuests,
      };
    });
  };

  const claimAchievement = (achId: string) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach || state.achievementsClaimed[achId]) return;

    // Check completion condition
    let currentVal = 0;
    if (ach.id.startsWith("ach_harvest_")) currentVal = state.stats.totalHarvested;
    else if (ach.id.startsWith("ach_plots_")) currentVal = state.unlockedSlots;
    else if (ach.id.startsWith("ach_earn_")) currentVal = state.stats.totalEarned;
    else if (ach.id.startsWith("ach_storm_")) currentVal = state.stats.rainHarvests;
    else if (ach.id.startsWith("ach_bot_")) currentVal = state.autoHarvester.level;

    if (currentVal < ach.target) {
      addToast("Achievement milestone not yet reached!", "info");
      return;
    }

    setState((prev) => {
      let newItems = { ...prev.items };
      if (ach.reward.item) {
        newItems[ach.reward.item] = (newItems[ach.reward.item] || 0) + 1;
      }

      let newExp = prev.exp + ach.reward.exp;
      let newLevel = prev.level;
      while (newExp >= getExpToNextLevel(newLevel)) {
        newExp -= getExpToNextLevel(newLevel);
        newLevel++;
      }

      return {
        ...prev,
        money: prev.money + ach.reward.money,
        items: newItems,
        exp: newExp,
        level: newLevel,
        achievementsClaimed: {
          ...prev.achievementsClaimed,
          [achId]: true,
        },
      };
    });

    addToast(`Achievement Unlocked: "${ach.title}"!`, "success");
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
    lastSlotSellPrice:
      state.unlockedSlots > 1 ? Math.floor(Math.floor(Math.pow(state.unlockedSlots - 1, 2.5) * 100) * 0.5) : 0,
    useItem,
    isSpeedBoosted: Date.now() < state.activeEffects.speedBoostUntil,
    expToNextLevel: getExpToNextLevel(state.level),
    resetGame,
    addToast,
    // Features additions:
    toggleBot,
    upgradeBot,
    claimQuest,
    claimAchievement,
    calculateSellPrice,
  };
}
