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
/*  Farm Bot / Auto-Harvester                                                 */
/* -------------------------------------------------------------------------- */

export interface BotTier {
  level: number;
  name: string;
  cost: number;
  levelRequired: number;
  description: string;
  features: string[];
}

export const BOT_TIERS: BotTier[] = [
  {
    level: 1,
    name: "Scarecrow Harvester",
    cost: 500,
    levelRequired: 3,
    description: "Automated scout that harvests crops as soon as they ripen.",
    features: [
      "Automatically harvests ripe crops every second",
      "Gathers XP and potion drop bonuses while AFK",
    ],
  },
  {
    level: 2,
    name: "Planter Drone",
    cost: 5000,
    levelRequired: 8,
    description: "Equipped with seed dispersion nozzles to automatically replant plots.",
    features: [
      "All Level 1 harvesting capabilities",
      "Auto-replants harvested plots if seeds are in inventory",
      "Prioritizes the same seed type previously planted",
    ],
  },
  {
    level: 3,
    name: "Quantum Agribot",
    cost: 50000,
    levelRequired: 16,
    description: "High-tech farm AI with precision optics and yield optimizer.",
    features: [
      "All Level 2 auto-harvest and auto-replant capabilities",
      "+15% bonus gold on all crop sales",
      "Overclocked AI for maximum AFK production",
    ],
  },
];

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
    id: "q_first_harvest",
    title: "Green Beginnings",
    description: "Harvest 10 crops of any kind.",
    category: "harvest",
    target: 10,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { money: 150, exp: 50 },
  },
  {
    id: "q_plant_sprouts",
    title: "Sowing Season",
    description: "Plant 15 seeds in your farm plots.",
    category: "plant",
    target: 15,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { money: 200, exp: 75, item: "speed_potion" },
  },
  {
    id: "q_crop_sales",
    title: "Market Vendor",
    description: "Sell 20 crops to the sell station.",
    category: "sell",
    target: 20,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { money: 500, exp: 120 },
  },
  {
    id: "q_rain_growth",
    title: "Storm Chaser",
    description: "Harvest 8 crops while it's raining or storming.",
    category: "weather",
    target: 8,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { money: 800, exp: 200, item: "harvest_potion" },
  },
  {
    id: "q_big_earner",
    title: "Profitable Harvest",
    description: "Earn $2,500 total from crop sales.",
    category: "earn",
    target: 2500,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { money: 1000, exp: 300, item: "finish_potion" },
  },
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
    id: "ach_harvest_1",
    title: "First Fruit",
    description: "Harvest your very first crop.",
    icon: "🌱",
    target: 1,
    reward: { money: 50, exp: 25 },
  },
  {
    id: "ach_harvest_50",
    title: "Green Thumb",
    description: "Harvest 50 total crops.",
    icon: "🌾",
    target: 50,
    reward: { money: 1000, exp: 250, item: "speed_potion" },
  },
  {
    id: "ach_harvest_250",
    title: "Master Harvester",
    description: "Harvest 250 total crops.",
    icon: "🚜",
    target: 250,
    reward: { money: 10000, exp: 1500, item: "harvest_potion" },
  },
  {
    id: "ach_plots_4",
    title: "Expanding Horizons",
    description: "Unlock at least 4 farm plots.",
    icon: "🗺️",
    target: 4,
    reward: { money: 800, exp: 200 },
  },
  {
    id: "ach_plots_8",
    title: "Land Baron",
    description: "Unlock at least 8 farm plots.",
    icon: "🏰",
    target: 8,
    reward: { money: 5000, exp: 800, item: "finish_potion" },
  },
  {
    id: "ach_earn_10k",
    title: "Five-Figure Farmer",
    description: "Earn a total of $10,000 from crops.",
    icon: "💰",
    target: 10000,
    reward: { money: 2500, exp: 500 },
  },
  {
    id: "ach_earn_100k",
    title: "Agri-Capitalist",
    description: "Earn a total of $100,000 from crops.",
    icon: "💎",
    target: 100000,
    reward: { money: 25000, exp: 3000, item: "finish_potion" },
  },
  {
    id: "ach_storm_20",
    title: "Electrified Fields",
    description: "Harvest 20 crops during rain or thunderstorms.",
    icon: "⚡",
    target: 20,
    reward: { money: 3000, exp: 600 },
  },
  {
    id: "ach_bot_unlocked",
    title: "Automation Age",
    description: "Deploy your first Farm Bot assistant.",
    icon: "🤖",
    target: 1,
    reward: { money: 1500, exp: 400 },
  },
  {
    id: "ach_bot_max",
    title: "Singularity Farm",
    description: "Upgrade your Farm Bot to Level 3 Quantum Agribot.",
    icon: "🛸",
    target: 3,
    reward: { money: 50000, exp: 5000, item: "finish_potion" },
  },
];
