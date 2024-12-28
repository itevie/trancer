// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// I'd recommend making copies of this file
// if you intend to download updates from the repo
// as it may be overwritten on a `git pull`.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import * as path from "path";

const config = {
  // ----- Bot & Creator details -----
  owner: "395877903998648322",

  // ----- Details to do with the bots server -----
  botServer: {
    id: "1257416273520758814",
    invite: "https://discord.gg/zBWq29apsy",

    roles: {
      member: "1257423790212907038",
      verified: "1257423790212907038",
      canRequest: "1282301213278474241",
    },

    channels: {
      logs: "1257417773483561031",
      quotes: "1257815880557920307",
      bumps: "1257429174637826059",
      welcomes: "1257417250395263036",
      howToVerify: "1283861103964717126",
    },

    vcChannels: [
      "1257437016296263751",
      "1257437054283808838",
      "1273840976045019226",
    ],
  },

  // ----- Channels all messages should be ignores -----
  ignoreChannels: ["1315484267517575168"],
  ignoreHandlersIn: ["1257417603568238684"],

  // ----- Dev Toggles -----
  devBot: {
    id: "1272342864004648981", // Leave empty if you don't have a developmental bot
    ignoreMessageHandlers: true,
  },

  // ----- Database -----
  database: {
    location: path.resolve(
      // This is where the database is located
      __dirname + "/../data.db"
    ),
  },

  analytics: {
    enabled: true,
    location: path.resolve(
      // This is where the ANALYTICS database is located
      __dirname + "/../analytics_data.db"
    ),
  },

  // ----- Exceptions to the command guard checks -----
  exceptions: ["395877903998648322"],

  // ----- Website -----
  website: {
    enabled: true,
    port: 8080,
  },

  // ----- Embed Defaults -----
  embed: {
    color: "#774b77",
  },

  // ----- Modules -----
  modules: {
    // Enable this only if you have ollama installed
    ai: {
      enabled: true,
      model: "llama3:8b",
    },

    // Used for logging how many messages people have sent
    statistics: {
      enabled: true,

      // The channels to NOT add messages to (like #spam)
      ignoreChannels: ["1257420480953057321", "1257426818479161394"],
    },
  },

  // ----- Dawnagotchi -----
  dawnagotchi: {
    actions: {
      feed: {
        timeAdd: 3.6e6 * 8,
      },
      water: {
        timeAdd: 3.6e6 * 6,
      },
      play: {
        timeAdd: 3.6e6 * 4,
      },
    },
  },

  // ----- Card Stuff -----
  cards: {
    weights: {
      common: 0.5,
      uncommon: 0.3,
      rare: 0.25,
      epic: 0.15,
      mythic: 0.05,
    },
  },

  // ----- Item drop settings -----
  itemDrops: {
    enabled: true,
    frequency: 1.8e6, // 30 minutes
    includeChannels: [
      "1257416274280054967",
      "1271324224077824051",
      "1257417475621130351",
    ],
    channelExclusions: ["1257417603568238684"],
  },

  // ----- Credits: do not remove this -----
  credits: {
    creatorId: "395877903998648322",
    creatorUsername: "dawndownonyou",
    serverInvite: "https://discord.gg/zBWq29apsy",
    github: "https://github.com/itevie/hypno-discord-bot",
  },
};

export default config;
