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
        ),
    },

    analytics: {
        enabled: true,
        location: path.resolve(
            // This is where the ANALYTICS database is located
            __dirname + "/../analytics_data.db",
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
        },

        vcChannels: [
            "1257437016296263751",
            "1257437054283808838",
            "1273840976045019226"
        ]
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

    // ----- Dawnagotchi -----
    dawnagotchi: {
        hairDyeItemID: 2,
        powerFoodItemID: 3,
        actions: {
            feed: {
                timeAdd: 3.6e+6 * 8
            },
            water: {
                timeAdd: 3.6e+6 * 6
            },
            play: {
                timeAdd: 3.6e+6 * 4
            }
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

        vcPayout: {
            name: "voicechatting",
            min: 5,
            max: 15,
            limit: 60000 * 5 // 5 minutes
        },

        bump: {
            name: "bumping",
            min: 40,
            max: 60
        },

        dawn: {
            name: "caring for your Dawn",
            min: 20,
            max: 40,
            limit: 60000 * 30,
        },

        inviting: {
            name: "inviting people",
            min: 150,
            max: 150,
        },

        fish: {
            name: "fishing",
            min: 10,
            max: 20,
            limit: 1800000 // 30 minutes
        },

        spirals: {
            name: "providing spirals",
            min: 10,
            max: 10
        },

        daily: {
            name: "collecting .daily",
            min: 75,
            max: 150,
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