import { Client, IntentsBitField, } from "discord.js";
import { HypnoCommand } from "./types/command";
import getAllFiles from "./util/getAllFiles";
import config from "./config.json";
import { connect } from "./util/database";
import { createEmbed } from "./util/other";
import { readFileSync } from "fs";
import { HypnoMessageHandler } from "./types/messageHandler";
import "./backend/index";
import { checkBadges } from "./util/badges";

export const commands: { [key: string]: HypnoCommand } = {};
export const handlers: HypnoMessageHandler[] = [];

// Setup client shit
export const client = new Client({
    intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
    ],
});

client.on("ready", async () => {
    console.log(`${client.user?.username} successfully logged in!`);

    // Load events
    const eventFiles = getAllFiles(__dirname + "/events");
    for (const eventFile of eventFiles) {
        require(eventFile);
        console.log(`Loaded event ${eventFile}`);
    }

    // Load commands
    const commandFiles = getAllFiles(__dirname + "/commands");

    for (const commandFile of commandFiles) {
        const commandImport = require(commandFile).default as HypnoCommand;
        commands[commandImport.name] = commandImport;
        for (const alias of commandImport.aliases || [])
            commands[alias] = commandImport;
        console.log(`Loaded command: ${commandImport.name}`);
    }

    // Load handlers
    const handleFiles = getAllFiles(__dirname + "/messageHandlers");

    for (const handleFile of handleFiles) {
        const handleImport = require(handleFile).default as HypnoMessageHandler;
        handlers.push(handleImport);
        console.log(`Loaded handler: ${handleImport.name}`);
    }
    await connect();

    checkBadges();
    setTimeout(() => {
        checkBadges();
    }, 60000);
});

client.login(
    readFileSync(__dirname + "/../token.txt", "utf-8").trim()
);

process.on("uncaughtException", async (err) => {
    console.log(err);
    try {
        let channel = await client.channels.fetch(config.botServer.channels.logs);
        if (channel.isTextBased()) {
            channel.send({
                embeds: [
                    createEmbed()
                        .setTitle(`Oops! I died :(`)
                        .setDescription(err.message)
                        .setThumbnail(null)
                        .addFields([
                            {
                                name: `Stacktrace`,
                                value: "```" + (err.stack ? err.stack.slice(0, 1000) : "*No Stack*") + "```"
                            }
                        ])
                ]
            })
        }
    } catch (err) {
        console.log(err);
        process.exit(0);
    }
});
