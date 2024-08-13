// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// I'd recommend making copies of this file
// if you intend to download updates from the repo
// as it may be overwritten on a `git pull`.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import * as path from "path";

const config = {
    // ----- Bot & Creator details -----
    owner: "395877903998648322",
    devBot: "1272342864004648981", // Leave empty if you don't have a developmental bot,

    // ----- Database -----
    database: {
        location: path.resolve(
            // This is where the database is located
            __dirname + "/../data.db"
        )
    },

    // ----- Exceptions to the command guard checks -----
    exceptions: [
        "395877903998648322"
    ],

    // ----- Details to do with the bots server -----
    botServer: {
        id: "1257416273520758814",
        invite: "https://discord.gg/zBWq29apsy",

        roles: {
            member: "1257423790212907038"
        },

        channels: {
            logs: "1257417773483561031",
            quotes: "1257815880557920307",
            bumps: "1257429174637826059",
            welcomes: "1257417250395263036"
        }
    },

    // ----- Embed Defaults -----
    embed: {
        color: "#402C49",
    },

    // ----- Modules -----
    modules: {
        // Enable this only if you have ollama installed
        ai: {
            enabled: true,
            model: "llama3:8b"
        },

        // Used for logging how many messages people have sent
        statistics: {
            enabled: true,

            // The channels to NOT add messages to (like #spam)
            ignoreChannels: [
                "1257420480953057321",
                "1257426818479161394"
            ]
        }
    },

    // ----- Card Stuff -----
    cards: {
        pullItemID: 1, // Create this using .+item (item name) (price),
        weights: {
            common: 0.5,
            uncommon: 0.3,
            rare: 0.25,
            epic: 0.15,
            mythic: 0.05
        }
    },

    // ----- Item drop settings -----
    itemDrops: {
        enabled: true,
        frequency: 1.8e+6, // 30 minutes
        channelExclusions: [
            "1257417603568238684"
        ]
    },

    // ----- Economy Settings -----
    economy: {
        currency: "🌀",

        // The following are methods of getting currenct
        messagePayout: {
            name: "messaging",
            min: 0,
            max: 3,
            limit: 60000 // 1 minute
        },

        bump: {
            name: "bumping",
            min: 20,
            max: 30
        },

        fish: {
            name: "fishing",
            min: 10,
            max: 20,
            limit: 1800000 // 30 seconds
        },

        spirals: {
            name: "providing spirals",
            min: 10,
            max: 10
        },

        daily: {
            name: "collecting .daily",
            min: 20,
            max: 55,
        },

        coinflip: {
            name: "flipping a rigged coin (.rcf)"
        }
    },

    // ----- Credits: do not remove this -----
    credits: {
        creatorId: "395877903998648322",
        creatorUsername: "dawndownonyou",
        serverInvite: "https://discord.gg/zBWq29apsy",
        github: "https://github.com/itevie/hypno-discord-bot",
    }
};

export default config;