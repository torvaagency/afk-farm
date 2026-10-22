/* -------------------------------------------------------------------------- */
/*  Dynamic Weather System                                                    */
/* -------------------------------------------------------------------------- */

export type WeatherType = "sunny" | "rain" | "thunderstorm" | "golden_hour";

export interface WeatherInfo {
  type: WeatherType;
  name: string;
  emoji: string;
  badge: string;
  description: string;
  growthMultiplier: number;
  sellMultiplier: number;
  skyColor: string;
  lightColor: string;
  lightIntensity: number;
  ambientColor: string;
  colorClass: string;
}

export const WEATHERS: Record<WeatherType, WeatherInfo> = {
  sunny: {
    type: "sunny",
    name: "Sunny",
    emoji: "☀️",
    badge: "Normal",
    description: "Standard farming conditions under clear sunny skies.",
    growthMultiplier: 1,
    sellMultiplier: 1,
    skyColor: "#050a12",
    lightColor: "#cfe0ff",
    lightIntensity: 1.9,
    ambientColor: "#a9c1ff",
    colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  rain: {
    type: "rain",
    name: "Rain Shower",
    emoji: "🌧️",
    badge: "2x Growth",
    description: "Gentle rainfall enriches the soil! 2x crop growth speed.",
    growthMultiplier: 2,
    sellMultiplier: 1,
    skyColor: "#060f1b",
    lightColor: "#89b2e8",
    lightIntensity: 1.4,
    ambientColor: "#4d6b94",
    colorClass: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  thunderstorm: {
    type: "thunderstorm",
    name: "Thunderstorm",
    emoji: "⚡",
    badge: "3x Growth",
    description: "Electrified storm surges! 3x rapid crop growth speed.",
    growthMultiplier: 3,
    sellMultiplier: 1,
    skyColor: "#0a0a16",
    lightColor: "#a3b8e0",
    lightIntensity: 1.2,
    ambientColor: "#3e4860",
    colorClass: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  golden_hour: {
    type: "golden_hour",
    name: "Golden Hour",
    emoji: "🌅",
    badge: "+50% Sell",
    description: "Warm sunset market fever! +50% sell price bonus on crops.",
    growthMultiplier: 1,
    sellMultiplier: 1.5,
    skyColor: "#170a0e",
    lightColor: "#fbbf24",
    lightIntensity: 2.2,
    ambientColor: "#b45309",
    colorClass: "text-amber-300 border-amber-500/40 bg-amber-500/15",
  },
};

export const WEATHER_DURATION = 120_000; // 2 minutes per weather cycle

/* -------------------------------------------------------------------------- */
/*  Farm Fairy / Magical Auto-Harvester                                       */
/* -------------------------------------------------------------------------- */

export interface FairyTier {
  level: number;
  name: string;
  cost: number;
  levelRequired: number;
  description: string;
  features: string[];
}

export type BotTier = FairyTier;

export const FAIRY_TIERS: FairyTier[] = [
  {
    level: 1,
    name: "Sprout Sprite",
    cost: 500,
    levelRequired: 3,
    description: "A nimble woodland fairy who flutters across your farm, harvesting ripe crops with a touch of magic.",
    features: [
      "Magically harvests ripe crops every second",
      "Gathers XP and potion blessings while AFK",
    ],
  },
  {
    level: 2,
    name: "Flora Pixie",
    cost: 5000,
    levelRequired: 8,
    description: "Attuned with botanical magic to enchant and replant seeds automatically into empty soil.",
    features: [
      "All Sprout Sprite harvesting powers",
      "Auto-replants harvested plots if seeds are in inventory",
      "Prioritizes the same seed type previously planted",
    ],
  },
  {
    level: 3,
    name: "Celestial Sylph",
    cost: 50000,
    levelRequired: 16,
    description: "A radiant celestial fairy who blesses the farm with celestial abundance and golden prosperity.",
    features: [
      "All Flora Pixie harvest and replant powers",
      "+15% bonus gold on all crop sales",
      "Maximum AFK harvesting enchantment",
    ],
  },
];

export const BOT_TIERS = FAIRY_TIERS;

/* -------------------------------------------------------------------------- */
/*  Quests & Achievements                                                     */
/* -------------------------------------------------------------------------- */

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: "harvest" | "plant" | "sell" | "earn" | "weather";
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    money: number;
    exp: number;
    item?: string;
  };
}

export const INITIAL_QUESTS: Quest[] = [
  {
    "id": "q_harvest_1",
    "title": "Green Beginnings",
    "description": "Harvest 10 crops of any kind.",
    "category": "harvest",
    "target": 10,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 150,
      "exp": 50
    }
  },
  {
    "id": "q_harvest_2",
    "title": "Bountiful Sprouts",
    "description": "Harvest 25 crops across your farm.",
    "category": "harvest",
    "target": 25,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 350,
      "exp": 120,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_harvest_3",
    "title": "Field Laborer",
    "description": "Harvest 50 crops from fertile soil.",
    "category": "harvest",
    "target": 50,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 750,
      "exp": 250
    }
  },
  {
    "id": "q_harvest_4",
    "title": "Abundant Basket",
    "description": "Harvest 100 crops in total.",
    "category": "harvest",
    "target": 100,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1600,
      "exp": 500,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_harvest_5",
    "title": "Scythe Specialist",
    "description": "Harvest 200 ripe crops.",
    "category": "harvest",
    "target": 200,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 3500,
      "exp": 1000
    }
  },
  {
    "id": "q_harvest_6",
    "title": "Granary Stocker",
    "description": "Harvest 400 crops for the farm stores.",
    "category": "harvest",
    "target": 400,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 7500,
      "exp": 2000,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_harvest_7",
    "title": "Harvest Vanguard",
    "description": "Harvest 750 healthy crops.",
    "category": "harvest",
    "target": 750,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 15000,
      "exp": 3800
    }
  },
  {
    "id": "q_harvest_8",
    "title": "Cornucopia Keeper",
    "description": "Harvest 1,250 crops of all varieties.",
    "category": "harvest",
    "target": 1250,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 28000,
      "exp": 6500,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_harvest_9",
    "title": "Agricultural Prodigy",
    "description": "Harvest 2,000 crops across your estate.",
    "category": "harvest",
    "target": 2000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 50000,
      "exp": 11000
    }
  },
  {
    "id": "q_harvest_10",
    "title": "Immortal Reaper",
    "description": "Harvest 3,500 crops to achieve farm legend status.",
    "category": "harvest",
    "target": 3500,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 100000,
      "exp": 20000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_plant_1",
    "title": "Sowing Season",
    "description": "Plant 15 seeds in your farm plots.",
    "category": "plant",
    "target": 15,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 200,
      "exp": 75,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_plant_2",
    "title": "Tender Furrows",
    "description": "Plant 35 seeds across your plots.",
    "category": "plant",
    "target": 35,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 450,
      "exp": 150
    }
  },
  {
    "id": "q_plant_3",
    "title": "Green Horizons",
    "description": "Plant 75 seeds into fertile earth.",
    "category": "plant",
    "target": 75,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1000,
      "exp": 320,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_plant_4",
    "title": "Careful Planter",
    "description": "Plant 150 seeds of any crop.",
    "category": "plant",
    "target": 150,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 2200,
      "exp": 650
    }
  },
  {
    "id": "q_plant_5",
    "title": "Botanical Expansion",
    "description": "Plant 300 seeds across your acreage.",
    "category": "plant",
    "target": 300,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 5000,
      "exp": 1300,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_plant_6",
    "title": "Master Sower",
    "description": "Plant 600 seeds across all seasons.",
    "category": "plant",
    "target": 600,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 11000,
      "exp": 2600
    }
  },
  {
    "id": "q_plant_7",
    "title": "Earth Tender",
    "description": "Plant 1,000 seeds into the ground.",
    "category": "plant",
    "target": 1000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 20000,
      "exp": 5000,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_plant_8",
    "title": "Root Cultivator",
    "description": "Plant 1,800 seeds throughout your estate.",
    "category": "plant",
    "target": 1800,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 40000,
      "exp": 9000
    }
  },
  {
    "id": "q_plant_9",
    "title": "Seed Sovereign",
    "description": "Plant 3,000 seeds into your enchanted plots.",
    "category": "plant",
    "target": 3000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 75000,
      "exp": 16000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_plant_10",
    "title": "Genesis Gardener",
    "description": "Plant 5,000 seeds in celebration of eternal life.",
    "category": "plant",
    "target": 5000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 150000,
      "exp": 30000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_sell_1",
    "title": "Market Vendor",
    "description": "Sell 20 crops to the sell station.",
    "category": "sell",
    "target": 20,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 500,
      "exp": 120
    }
  },
  {
    "id": "q_sell_2",
    "title": "Produce Peddler",
    "description": "Sell 50 crops at the trading counter.",
    "category": "sell",
    "target": 50,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1200,
      "exp": 280,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_sell_3",
    "title": "Local Merchant",
    "description": "Sell 120 harvested crops.",
    "category": "sell",
    "target": 120,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 2800,
      "exp": 600
    }
  },
  {
    "id": "q_sell_4",
    "title": "Bulk Wholesaler",
    "description": "Sell 250 crops in fresh batches.",
    "category": "sell",
    "target": 250,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 6000,
      "exp": 1200,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_sell_5",
    "title": "Trade Caravan",
    "description": "Sell 500 crops to regional vendors.",
    "category": "sell",
    "target": 500,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 13000,
      "exp": 2500
    }
  },
  {
    "id": "q_sell_6",
    "title": "Supply Master",
    "description": "Sell 900 crops to overseas traders.",
    "category": "sell",
    "target": 900,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 25000,
      "exp": 4800,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_sell_7",
    "title": "Bazaar King",
    "description": "Sell 1,500 fresh crops.",
    "category": "sell",
    "target": 1500,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 45000,
      "exp": 8500
    }
  },
  {
    "id": "q_sell_8",
    "title": "Global Exporter",
    "description": "Sell 2,500 crops to worldwide ports.",
    "category": "sell",
    "target": 2500,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 80000,
      "exp": 15000,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_sell_9",
    "title": "Commerce Baron",
    "description": "Sell 4,000 crops of high quality.",
    "category": "sell",
    "target": 4000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 140000,
      "exp": 25000
    }
  },
  {
    "id": "q_sell_10",
    "title": "Monopoly Magnate",
    "description": "Sell 6,000 crops to command the entire market.",
    "category": "sell",
    "target": 6000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 250000,
      "exp": 45000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_earn_1",
    "title": "Profitable Harvest",
    "description": "Earn ,500 total from crop sales.",
    "category": "earn",
    "target": 2500,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1000,
      "exp": 300,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_earn_2",
    "title": "Pocket Money",
    "description": "Earn ,000 total from your farm yield.",
    "category": "earn",
    "target": 8000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 2500,
      "exp": 600
    }
  },
  {
    "id": "q_earn_3",
    "title": "Gold Rush",
    "description": "Earn ,000 total from produce sales.",
    "category": "earn",
    "target": 20000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 5500,
      "exp": 1200,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_earn_4",
    "title": "Treasury Builder",
    "description": "Earn ,000 total from crops.",
    "category": "earn",
    "target": 50000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 12000,
      "exp": 2500
    }
  },
  {
    "id": "q_earn_5",
    "title": "Golden Acres",
    "description": "Earn ,000 in agricultural revenue.",
    "category": "earn",
    "target": 120000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 28000,
      "exp": 5000,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_earn_6",
    "title": "High Yield Dynasty",
    "description": "Earn ,000 from thriving fields.",
    "category": "earn",
    "target": 300000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 65000,
      "exp": 10000
    }
  },
  {
    "id": "q_earn_7",
    "title": "Millionaire Prospect",
    "description": "Earn ,000 from high-value crop sales.",
    "category": "earn",
    "target": 800000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 160000,
      "exp": 22000,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_earn_8",
    "title": "Multi-Million Empire",
    "description": "Earn ,000,000 total from your agrarian enterprise.",
    "category": "earn",
    "target": 2000000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 400000,
      "exp": 45000
    }
  },
  {
    "id": "q_earn_9",
    "title": "Billionaire Ambition",
    "description": "Earn ,000,000 across all harvests.",
    "category": "earn",
    "target": 6000000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1000000,
      "exp": 90000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_earn_10",
    "title": "Titan of Prosperity",
    "description": "Earn ,000,000 to enter farming folklore.",
    "category": "earn",
    "target": 20000000,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 3000000,
      "exp": 200000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_weather_1",
    "title": "Storm Chaser",
    "description": "Harvest 8 crops while it rains or storms.",
    "category": "weather",
    "target": 8,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 800,
      "exp": 200,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_weather_2",
    "title": "Petrichor Lover",
    "description": "Harvest 20 crops under rain showers.",
    "category": "weather",
    "target": 20,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 1800,
      "exp": 400
    }
  },
  {
    "id": "q_weather_3",
    "title": "Downpour Harvester",
    "description": "Harvest 45 crops through misty raindrops.",
    "category": "weather",
    "target": 45,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 3800,
      "exp": 800,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_weather_4",
    "title": "Thunderclap Yield",
    "description": "Harvest 90 crops amidst electrified storms.",
    "category": "weather",
    "target": 90,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 7500,
      "exp": 1500
    }
  },
  {
    "id": "q_weather_5",
    "title": "Lightning Catcher",
    "description": "Harvest 160 crops during tempestuous weather.",
    "category": "weather",
    "target": 160,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 14000,
      "exp": 2800,
      "item": "harvest_potion"
    }
  },
  {
    "id": "q_weather_6",
    "title": "Monsoon Master",
    "description": "Harvest 260 crops through stormy weather.",
    "category": "weather",
    "target": 260,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 24000,
      "exp": 4800
    }
  },
  {
    "id": "q_weather_7",
    "title": "Tempest Strider",
    "description": "Harvest 400 crops in heavy rainfall.",
    "category": "weather",
    "target": 400,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 40000,
      "exp": 8000,
      "item": "speed_potion"
    }
  },
  {
    "id": "q_weather_8",
    "title": "Cloudburst Conqueror",
    "description": "Harvest 600 crops while the skies pour.",
    "category": "weather",
    "target": 600,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 65000,
      "exp": 13000
    }
  },
  {
    "id": "q_weather_9",
    "title": "Thunder God Botanist",
    "description": "Harvest 900 crops in thunderous conditions.",
    "category": "weather",
    "target": 900,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 105000,
      "exp": 21000,
      "item": "finish_potion"
    }
  },
  {
    "id": "q_weather_10",
    "title": "Eye of the Storm",
    "description": "Harvest 1,400 crops during raging tempests.",
    "category": "weather",
    "target": 1400,
    "progress": 0,
    "completed": false,
    "claimed": false,
    "reward": {
      "money": 180000,
      "exp": 35000,
      "item": "finish_potion"
    }
  }
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  reward: {
    money: number;
    exp: number;
    item?: string;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    "id": "ach_harvest_1",
    "title": "First Fruit",
    "description": "Harvest your very first crop.",
    "icon": "🌱",
    "target": 1,
    "reward": {
      "money": 50,
      "exp": 25
    }
  },
  {
    "id": "ach_harvest_25",
    "title": "Sprout Gatherer",
    "description": "Harvest 25 total crops.",
    "icon": "🌿",
    "target": 25,
    "reward": {
      "money": 300,
      "exp": 100
    }
  },
  {
    "id": "ach_harvest_50",
    "title": "Green Thumb",
    "description": "Harvest 50 total crops.",
    "icon": "🌾",
    "target": 50,
    "reward": {
      "money": 1000,
      "exp": 250,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_harvest_150",
    "title": "Field Hand",
    "description": "Harvest 150 total crops.",
    "icon": "🧺",
    "target": 150,
    "reward": {
      "money": 3500,
      "exp": 700
    }
  },
  {
    "id": "ach_harvest_300",
    "title": "Master Harvester",
    "description": "Harvest 300 total crops.",
    "icon": "🚜",
    "target": 300,
    "reward": {
      "money": 8000,
      "exp": 1500,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_harvest_600",
    "title": "Granary King",
    "description": "Harvest 600 total crops.",
    "icon": "🏡",
    "target": 600,
    "reward": {
      "money": 18000,
      "exp": 3200
    }
  },
  {
    "id": "ach_harvest_1200",
    "title": "Bountiful Abundance",
    "description": "Harvest 1,200 total crops.",
    "icon": "🍎",
    "target": 1200,
    "reward": {
      "money": 40000,
      "exp": 7000,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_harvest_2500",
    "title": "Agricultural Legend",
    "description": "Harvest 2,500 total crops.",
    "icon": "🌻",
    "target": 2500,
    "reward": {
      "money": 90000,
      "exp": 15000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_harvest_5000",
    "title": "Reaper Supreme",
    "description": "Harvest 5,000 total crops.",
    "icon": "👑",
    "target": 5000,
    "reward": {
      "money": 200000,
      "exp": 32000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_harvest_10000",
    "title": "Infinity Harvester",
    "description": "Harvest 10,000 total crops across your dynasty.",
    "icon": "🌌",
    "target": 10000,
    "reward": {
      "money": 500000,
      "exp": 75000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_earn_500",
    "title": "First Dime",
    "description": "Earn a total of  from crops.",
    "icon": "🪙",
    "target": 500,
    "reward": {
      "money": 200,
      "exp": 50
    }
  },
  {
    "id": "ach_earn_2500",
    "title": "Pocket Change",
    "description": "Earn a total of ,500 from crops.",
    "icon": "💵",
    "target": 2500,
    "reward": {
      "money": 800,
      "exp": 180
    }
  },
  {
    "id": "ach_earn_10000",
    "title": "Five-Figure Farmer",
    "description": "Earn a total of ,000 from crops.",
    "icon": "💰",
    "target": 10000,
    "reward": {
      "money": 2500,
      "exp": 500,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_earn_35000",
    "title": "Prosperous Acres",
    "description": "Earn a total of ,000 from crops.",
    "icon": "🏦",
    "target": 35000,
    "reward": {
      "money": 8000,
      "exp": 1400
    }
  },
  {
    "id": "ach_earn_100000",
    "title": "Agri-Capitalist",
    "description": "Earn a total of ,000 from crops.",
    "icon": "💎",
    "target": 100000,
    "reward": {
      "money": 25000,
      "exp": 3500,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_earn_350000",
    "title": "Gold Reserve",
    "description": "Earn a total of ,000 from crops.",
    "icon": "🏆",
    "target": 350000,
    "reward": {
      "money": 75000,
      "exp": 8000
    }
  },
  {
    "id": "ach_earn_1000000",
    "title": "Millionaire Cultivator",
    "description": "Earn a total of ,000,000 from crops.",
    "icon": "🎩",
    "target": 1000000,
    "reward": {
      "money": 200000,
      "exp": 20000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_earn_5000000",
    "title": "Multi-Millionaire Mogul",
    "description": "Earn a total of ,000,000 from crops.",
    "icon": "🏰",
    "target": 5000000,
    "reward": {
      "money": 800000,
      "exp": 50000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_earn_25000000",
    "title": "Billion Dollar Dreamer",
    "description": "Earn a total of ,000,000 from crops.",
    "icon": "✨",
    "target": 25000000,
    "reward": {
      "money": 3500000,
      "exp": 120000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_earn_100000000",
    "title": "Croesus of the Soil",
    "description": "Earn a total of ,000,000 from crops.",
    "icon": "🪐",
    "target": 100000000,
    "reward": {
      "money": 15000000,
      "exp": 300000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_plots_2",
    "title": "Double Plot",
    "description": "Expand to 2 farm plots.",
    "icon": "🌱",
    "target": 2,
    "reward": {
      "money": 250,
      "exp": 60
    }
  },
  {
    "id": "ach_plots_4",
    "title": "Expanding Horizons",
    "description": "Unlock at least 4 farm plots.",
    "icon": "🗺️",
    "target": 4,
    "reward": {
      "money": 800,
      "exp": 200,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_plots_8",
    "title": "Land Baron",
    "description": "Unlock at least 8 farm plots.",
    "icon": "🏰",
    "target": 8,
    "reward": {
      "money": 3500,
      "exp": 700,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_plots_12",
    "title": "Estate Builder",
    "description": "Unlock at least 12 farm plots.",
    "icon": "🏡",
    "target": 12,
    "reward": {
      "money": 9000,
      "exp": 1600
    }
  },
  {
    "id": "ach_plots_16",
    "title": "Halfway Sovereign",
    "description": "Unlock at least 16 farm plots.",
    "icon": "📐",
    "target": 16,
    "reward": {
      "money": 22000,
      "exp": 3500,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_plots_20",
    "title": "Grand Domain",
    "description": "Unlock at least 20 farm plots.",
    "icon": "🏞️",
    "target": 20,
    "reward": {
      "money": 50000,
      "exp": 7500
    }
  },
  {
    "id": "ach_plots_26",
    "title": "Continental Fields",
    "description": "Unlock at least 26 farm plots.",
    "icon": "🌄",
    "target": 26,
    "reward": {
      "money": 120000,
      "exp": 16000,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_plots_32",
    "title": "Lord of the Manor",
    "description": "Unlock all 32 maximum farm plots!",
    "icon": "🏛️",
    "target": 32,
    "reward": {
      "money": 300000,
      "exp": 40000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_plant_10",
    "title": "First Sowing",
    "description": "Plant 10 seeds in your fields.",
    "icon": "🌰",
    "target": 10,
    "reward": {
      "money": 100,
      "exp": 35
    }
  },
  {
    "id": "ach_plant_50",
    "title": "Seedling Specialist",
    "description": "Plant 50 seeds across your farm.",
    "icon": "🌾",
    "target": 50,
    "reward": {
      "money": 600,
      "exp": 180
    }
  },
  {
    "id": "ach_plant_150",
    "title": "Tiller of Earth",
    "description": "Plant 150 seeds into fertile ground.",
    "icon": "🪴",
    "target": 150,
    "reward": {
      "money": 2200,
      "exp": 550,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_plant_400",
    "title": "Master of Furrows",
    "description": "Plant 400 seeds across all seasons.",
    "icon": "🌽",
    "target": 400,
    "reward": {
      "money": 7000,
      "exp": 1500
    }
  },
  {
    "id": "ach_plant_1000",
    "title": "Arboretum Architect",
    "description": "Plant 1,000 seeds into your plots.",
    "icon": "🌲",
    "target": 1000,
    "reward": {
      "money": 20000,
      "exp": 4000,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_plant_2500",
    "title": "Botanical Maestro",
    "description": "Plant 2,500 seeds across your domain.",
    "icon": "🍇",
    "target": 2500,
    "reward": {
      "money": 60000,
      "exp": 11000
    }
  },
  {
    "id": "ach_plant_5000",
    "title": "World Sower",
    "description": "Plant 5,000 seeds in perpetual cultivation.",
    "icon": "🌸",
    "target": 5000,
    "reward": {
      "money": 150000,
      "exp": 26000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_plant_10000",
    "title": "Forest of Eternity",
    "description": "Plant 10,000 seeds across the realm.",
    "icon": "🌳",
    "target": 10000,
    "reward": {
      "money": 400000,
      "exp": 60000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_storm_5",
    "title": "Puddle Jumper",
    "description": "Harvest 5 crops during rainy weather.",
    "icon": "🌦️",
    "target": 5,
    "reward": {
      "money": 300,
      "exp": 80
    }
  },
  {
    "id": "ach_storm_20",
    "title": "Electrified Fields",
    "description": "Harvest 20 crops during rain or thunderstorms.",
    "icon": "⚡",
    "target": 20,
    "reward": {
      "money": 1500,
      "exp": 350,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_storm_60",
    "title": "Downpour Devotee",
    "description": "Harvest 60 crops under soaking clouds.",
    "icon": "🌧️",
    "target": 60,
    "reward": {
      "money": 5000,
      "exp": 1200
    }
  },
  {
    "id": "ach_storm_150",
    "title": "Storm Born",
    "description": "Harvest 150 crops during stormy weather.",
    "icon": "🌩️",
    "target": 150,
    "reward": {
      "money": 15000,
      "exp": 3200,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_storm_350",
    "title": "Tempest Shepherd",
    "description": "Harvest 350 crops amidst the fiercest storms.",
    "icon": "🌪️",
    "target": 350,
    "reward": {
      "money": 40000,
      "exp": 8000
    }
  },
  {
    "id": "ach_storm_800",
    "title": "Avatar of the Storm",
    "description": "Harvest 800 crops drenched in thunderstorm magic.",
    "icon": "⚡",
    "target": 800,
    "reward": {
      "money": 120000,
      "exp": 22000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_bot_1",
    "title": "Fairy Companion",
    "description": "Befriend your first Farm Fairy (Sprout Sprite).",
    "icon": "🧚",
    "target": 1,
    "reward": {
      "money": 1500,
      "exp": 400,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_bot_2",
    "title": "Pixie Replanter",
    "description": "Awaken the Tier 2 Flora Pixie for auto-replanting.",
    "icon": "🌺",
    "target": 2,
    "reward": {
      "money": 8000,
      "exp": 1800,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_bot_3",
    "title": "Celestial Blessing",
    "description": "Awaken the Tier 3 Celestial Sylph fairy.",
    "icon": "✨",
    "target": 3,
    "reward": {
      "money": 50000,
      "exp": 6000,
      "item": "finish_potion"
    }
  },
  {
    "id": "ach_potion_1",
    "title": "First Brew",
    "description": "Use your first magical potion.",
    "icon": "🧪",
    "target": 1,
    "reward": {
      "money": 200,
      "exp": 50
    }
  },
  {
    "id": "ach_potion_5",
    "title": "Apothecary Apprentice",
    "description": "Use 5 magical potions on your farm.",
    "icon": "⚗️",
    "target": 5,
    "reward": {
      "money": 1200,
      "exp": 250,
      "item": "speed_potion"
    }
  },
  {
    "id": "ach_potion_15",
    "title": "Elixir Enthusiast",
    "description": "Use 15 magical potions to boost your harvest.",
    "icon": "🔮",
    "target": 15,
    "reward": {
      "money": 4500,
      "exp": 900,
      "item": "harvest_potion"
    }
  },
  {
    "id": "ach_potion_35",
    "title": "Alchemical Adept",
    "description": "Use 35 potions across your estate.",
    "icon": "✨",
    "target": 35,
    "reward": {
      "money": 12000,
      "exp": 2500
    }
  },
  {
    "id": "ach_potion_75",
    "title": "Grand Alchemist",
    "description": "Use 75 magical potions in total.",
    "icon": "🧙‍♂️",
    "target": 75,
    "reward": {
      "money": 35000,
      "exp": 7000,
      "item": "finish_potion"
    }
  }
];
