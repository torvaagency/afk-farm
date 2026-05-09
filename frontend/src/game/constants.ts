export interface PlantType {
  id: string;
  name: string;
  emoji: string;
  seedEmoji: string;
  cost: number;
  sellPrice: number;
  growTime: number; // in seconds
  stages: string[]; // Emojis for different growth stages
  levelRequired: number;
}

export const PLANTS: Record<string, PlantType> = {
  wheat: {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    seedEmoji: "🌱",
    cost: 15,
    sellPrice: 30,
    growTime: 30, // 30s
    stages: ["🌱", "🌿", "🌾"],
    levelRequired: 1,
  },
  carrot: {
    id: "carrot",
    name: "Carrot",
    emoji: "🥕",
    seedEmoji: "🥕",
    cost: 50,
    sellPrice: 110,
    growTime: 60, // 1m
    stages: ["🌱", "🌿", "🥕"],
    levelRequired: 2,
  },
  corn: {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    seedEmoji: "🌽",
    cost: 120,
    sellPrice: 280,
    growTime: 120, // 2m
    stages: ["🌱", "🌿", "🌽"],
    levelRequired: 3,
  },
  mushroom: {
    id: "mushroom",
    name: "Mushroom",
    emoji: "🍄",
    seedEmoji: "🍄",
    cost: 250,
    sellPrice: 650,
    growTime: 240, // 4m
    stages: ["🍄", "🍄", "🍄"],
    levelRequired: 5,
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    seedEmoji: "🍅",
    cost: 600,
    sellPrice: 2200,
    growTime: 300, // 5m (was 8m)
    stages: ["🌱", "🌿", "🍅"],
    levelRequired: 7,
  },
  potato: {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    seedEmoji: "🥔",
    cost: 1500,
    sellPrice: 6500,
    growTime: 600, // 10m (was 15m)
    stages: ["🌱", "🌿", "🥔"],
    levelRequired: 10,
  },
  pine: {
    id: "pine",
    name: "Pine Tree",
    emoji: "🌲",
    seedEmoji: "🌲",
    cost: 4000,
    sellPrice: 20000,
    growTime: 1200, // 20m (was 30m)
    stages: ["🌱", "🌲", "🌲"],
    levelRequired: 14,
  },
  oak: {
    id: "oak",
    name: "Oak Tree",
    emoji: "🌳",
    seedEmoji: "🌳",
    cost: 10000,
    sellPrice: 55000,
    growTime: 2400, // 40m (was 1h)
    stages: ["🌱", "🌳", "🌳"],
    levelRequired: 18,
  },
  strawberry: {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    seedEmoji: "🍓",
    cost: 25000,
    sellPrice: 150000,
    growTime: 3600, // 1h (was 2h)
    stages: ["🌱", "🌿", "🍓"],
    levelRequired: 22,
  },
  grapes: {
    id: "grapes",
    name: "Grapes",
    emoji: "🍇",
    seedEmoji: "🍇",
    cost: 60000,
    sellPrice: 450000,
    growTime: 7200, // 2h (was 3h)
    stages: ["🌱", "🌿", "🍇"],
    levelRequired: 28,
  },
  mana_blossom: {
    id: "mana_blossom",
    name: "Mana Blossom",
    emoji: "🌸",
    seedEmoji: "✨",
    cost: 150000,
    sellPrice: 1200000,
    growTime: 14400, // 4h (was 6h)
    stages: ["✨", "💠", "🌸"],
    levelRequired: 35,
  },
  dragon_pepper: {
    id: "dragon_pepper",
    name: "Dragon Pepper",
    emoji: "🌶️",
    seedEmoji: "🔥",
    cost: 400000,
    sellPrice: 3500000,
    growTime: 28800, // 8h (was 12h)
    stages: ["🔥", "🌋", "🌶️"],
    levelRequired: 42,
  },
  starfruit: {
    id: "starfruit",
    name: "Starfruit",
    emoji: "⭐",
    seedEmoji: "🌠",
    cost: 1000000,
    sellPrice: 12000000,
    growTime: 43200, // 12h (was 24h)
    stages: ["🌠", "✨", "⭐"],
    levelRequired: 50,
  },
  moonflower: {
    id: "moonflower",
    name: "Moonflower",
    emoji: "🌙",
    seedEmoji: "🌑",
    cost: 2500000,
    sellPrice: 35000000,
    growTime: 86400, // 24h (was 48h)
    stages: ["🌑", "🌒", "🌙"],
    levelRequired: 60,
  },
  solar_lily: {
    id: "solar_lily",
    name: "Solar Lily",
    emoji: "☀️",
    seedEmoji: "🔥",
    cost: 10000000,
    sellPrice: 180000000,
    growTime: 28800, // 8h
    stages: ["🔥", "💥", "☀️"],
    levelRequired: 70,
  },
  crystal_fruit: {
    id: "crystal_fruit",
    name: "Crystal Fruit",
    emoji: "💎",
    seedEmoji: "🔮",
    cost: 50000000,
    sellPrice: 1000000000,
    growTime: 43200, // 12h
    stages: ["🔮", "✨", "💎"],
    levelRequired: 80,
  },
  golden_apple: {
    id: "golden_apple",
    name: "Golden Apple",
    emoji: "🍎",
    seedEmoji: "🪙",
    cost: 250000000,
    sellPrice: 8000000000,
    growTime: 64800, // 18h
    stages: ["🌱", "🌳", "🍎"],
    levelRequired: 90,
  },
  eternity_seed: {
    id: "eternity_seed",
    name: "Eternity Seed",
    emoji: "♾️",
    seedEmoji: "🌀",
    cost: 1000000000,
    sellPrice: 50000000000,
    growTime: 86400, // 24h
    stages: ["🌀", "🌌", "♾️"],
    levelRequired: 100,
  },
};
