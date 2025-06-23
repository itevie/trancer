// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// I'd recommend making copies of this file
// if you intend to download updates from the repo
// as it may be overwritten on a `git pull`.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import * as path from "path";
import { units } from "./util/ms";

let config = {
  // ----- Basic -----
  owner: "395877903998648322",
  dataDirectory: __dirname + "/data",

  // ----- Database -----
  database: {
    location: path.resolve(
      // This is where the database is located
      __dirname + "/../data.db",
    ),
  },

  // ----- Details to do with the bots server -----
  botServer: {
    id: "1257416273520758814",
    invite: "https://discord.gg/zBWq29apsy",

    roles: {
      member: "1257423790212907038",
      verified: "1257423790212907038",
      canRequest: "1282301213278474241",
      french: "1366862341437653042",
    },

    channels: {
      logs: "1257417773483561031",
      quotes: "1257815880557920307",
      bumps: "1257429174637826059",
      welcomes: "1257417250395263036",
      howToVerify: "1283861103964717126",
      boosts: "1257417208024268850",
      oneWordStory: "1353393430558150777",
      oneWordStorySend: "1353393430558150777",
      suggestions: "1356294574389071970",
    },

    vcChannels: [
      "1257437016296263751",
      "1257437054283808838",
      "1273840976045019226",
      "1314000474126417920",
    ],
  },

  // ----- Dev Bot Options -----
  devBot: {
    id: "1272342864004648981", // Leave empty if you don't have a developmental bot
    ignoreMessageHandlers: false,
  },

  // Where things should ignored
  ignore: {
    channels: ["1315484267517575168"],
    handlers: ["1257417603568238684", "1336714957751844874"],
  },

  // ----- Your QOTD options -----
  qotd: {
    hour: 14,
    channel: "1257430062723108865",
    content: "<@&1257477180858962013>",
  },

  analytics: {
    enabled: true,
    location: path.resolve(
      // This is where the ANALYTICS database is located
      __dirname + "/../analytics_data.db",
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
    devColor: "#8AB5A7",
  },

  // ----- Modules -----
  modules: {
    // Enable this only if you have ollama installed
    ai: {
      enabled: false,
      devEnabled: true,
      model: "llama3.2",
      //model: "deepseek-r1:8b",
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
    //frequency: 1.8e6, // 30 minutes
    frequency: units.minute * 5, // 30 minutes
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
    creatorUsername: "hypnobella",
    serverInvite: "https://discord.gg/zBWq29apsy",
    github: "https://github.com/itevie/hypno-discord-bot",
  },
};

export default config;
