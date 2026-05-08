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
    sellPrice: 1800,
    growTime: 480, // 8m
    stages: ["🌱", "🌿", "🍅"],
    levelRequired: 7,
  },
  potato: {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    seedEmoji: "🥔",
    cost: 1500,
    sellPrice: 5000,
    growTime: 900, // 15m
    stages: ["🌱", "🌿", "🥔"],
    levelRequired: 10,
  },
  pine: {
    id: "pine",
    name: "Pine Tree",
    emoji: "🌲",
    seedEmoji: "🌲",
    cost: 4000,
    sellPrice: 15000,
    growTime: 1800, // 30m
    stages: ["🌱", "🌲", "🌲"],
    levelRequired: 14,
  },
  oak: {
    id: "oak",
    name: "Oak Tree",
    emoji: "🌳",
    seedEmoji: "🌳",
    cost: 10000,
    sellPrice: 42000,
    growTime: 3600, // 1h
    stages: ["🌱", "🌳", "🌳"],
    levelRequired: 18,
  },
  strawberry: {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    seedEmoji: "🍓",
    cost: 25000,
    sellPrice: 120000,
    growTime: 7200, // 2h
    stages: ["🌱", "🌿", "🍓"],
    levelRequired: 22,
  },
  grapes: {
    id: "grapes",
    name: "Grapes",
    emoji: "🍇",
    seedEmoji: "🍇",
    cost: 60000,
    sellPrice: 320000,
    growTime: 10800, // 3h
    stages: ["🌱", "🌿", "🍇"],
    levelRequired: 28,
  },
  mana_blossom: {
    id: "mana_blossom",
    name: "Mana Blossom",
    emoji: "🌸",
    seedEmoji: "✨",
    cost: 150000,
    sellPrice: 900000,
    growTime: 21600, // 6h
    stages: ["✨", "💠", "🌸"],
    levelRequired: 35,
  },
  dragon_pepper: {
    id: "dragon_pepper",
    name: "Dragon Pepper",
    emoji: "🌶️",
    seedEmoji: "🔥",
    cost: 400000,
    sellPrice: 2800000,
    growTime: 43200, // 12h
    stages: ["🔥", "🌋", "🌶️"],
    levelRequired: 42,
  },
  starfruit: {
    id: "starfruit",
    name: "Starfruit",
    emoji: "⭐",
    seedEmoji: "🌠",
    cost: 1000000,
    sellPrice: 8500000,
    growTime: 86400, // 24h
    stages: ["🌠", "✨", "⭐"],
    levelRequired: 50,
  },
  moonflower: {
    id: "moonflower",
    name: "Moonflower",
    emoji: "🌙",
    seedEmoji: "🌑",
    cost: 2500000,
    sellPrice: 25000000,
    growTime: 172800, // 2 days
    stages: ["🌑", "🌒", "🌙"],
    levelRequired: 60,
  },
  solar_lily: {
    id: "solar_lily",
    name: "Solar Lily",
    emoji: "☀️",
    seedEmoji: "🔥",
    cost: 10000000,
    sellPrice: 120000000,
    growTime: 345600, // 4 days
    stages: ["🔥", "💥", "☀️"],
    levelRequired: 70,
  },
  crystal_fruit: {
    id: "crystal_fruit",
    name: "Crystal Fruit",
    emoji: "💎",
    seedEmoji: "🔮",
    cost: 50000000,
    sellPrice: 750000000,
    growTime: 604800, // 1 week
    stages: ["🔮", "✨", "💎"],
    levelRequired: 80,
  },
  golden_apple: {
    id: "golden_apple",
    name: "Golden Apple",
    emoji: "🍎",
    seedEmoji: "🪙",
    cost: 250000000,
    sellPrice: 5000000000,
    growTime: 1209600, // 2 weeks
    stages: ["🌱", "🌳", "🍎"],
    levelRequired: 90,
  },
  eternity_seed: {
    id: "eternity_seed",
    name: "Eternity Seed",
    emoji: "♾️",
    seedEmoji: "🌀",
    cost: 1000000000,
    sellPrice: 30000000000,
    growTime: 2592000, // 30 days
    stages: ["🌀", "🌌", "♾️"],
    levelRequired: 100,
  },
};
