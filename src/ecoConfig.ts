const ecoConfig = {
  currency: "🌀",

  items: {
    cardPull: "card-pull",
    hairDye: "hair-dye",
    powerFood: "hair",
    powerDrink: "juicebox",
    powerPlay: "pendulum",
    fishingRod: "fishing-rod",
  },

  mining: {
    defaultSpace: "rock",
    unknownSpace: ":question:",
  },

  lottery: {
    enabled: true,
    length: 1000 * 60 * 60 * 24 * 7,
    basePool: 250,
    entryPrice: 250,
    maxEntries: 5,
    announcementChannel: "1257417208024268850",
  },

  counting: {
    unban: 3000,
  },

  payouts: {
    message: {
      name: "messaging",
      min: 0,
      max: 3,
      limit: 1000 * 60,
    },

    itemDrops: {
      name: "catching drops",
      min: 30,
      max: 70,
    },

    boosts: {
      name: "boosting",
      min: 2500,
      max: 2500,
    },

    vc: {
      name: "voicechatting",
      min: 5,
      max: 15,
      limit: 1000 * 60 * 5,
    },

    bump: {
      name: "bumping",
      min: 50,
      max: 200,
    },

    dawn: {
      name: "caring for your Dawn",
      min: 20,
      max: 40,
      limit: 1000 * 60 * 30,
      punishment: 350,
    },

    dawn100: {
      name: "getting all of your Dawn's needs to 100%",
      min: 50,
      max: 100,
      limit: 1000 * 60 * 60 * 12, // 12 hours
    },

    inviting: {
      name: "inviting people",
      min: 150,
      max: 150,
    },

    fish: {
      name: "fishing",
      limit: 1000 * 60 * 30,
    },

    mine: {
      name: "mining",
      limit: 1000 * 60 * 30,
    },

    work: {
      name: "working",
      min: 20,
      max: 40,
      limit: 1000 * 60 * 15,
    },

    daily: {
      name: "collecting .daily",
      min: 75,
      max: 150,
    },

    spirals: {
      name: "adding spirals",
      min: 100,
      max: 100,
    },

    guessNumber: {
      name: "guessing a number with .guessnumber",
      min: 10,
      max: 15,
      punishment: 15,
    },

    letterMaker: {
      name: "playing Letter Maker",
      min: 5,
      max: 7,
    },
  },
} as const;

export default ecoConfig;
