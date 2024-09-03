import { Client, IntentsBitField, } from "discord.js";
import { HypnoCommand } from "./types/command";
import { connect } from "./util/database";
import getAllFiles, { createBackup, createEmbed } from "./util/other";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { HypnoMessageHandler } from "./types/messageHandler";
import { checkBadges } from "./util/badges";
import Logger from "./util/Logger";
import config from "./config";
import { connectAnalytic } from "./util/analytics";
import path from "path";

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
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildModeration
    ],
});

const logger = new Logger("loader");
export let errors = 0;

client.on("ready", async () => {
    // Load events
    const eventFiles = getAllFiles(__dirname + "/events");
    for (const eventFile of eventFiles) {
        require(eventFile);
        logger.log(`Loaded event: ${eventFile}`);
    }

    // Load commands
    const commandFiles = getAllFiles(__dirname + "/commands");

    for (const commandFile of commandFiles) {
        const commandImport = require(commandFile).default as HypnoCommand;
        commands[commandImport.name] = commandImport;
        for (const alias of commandImport.aliases || [])
            commands[alias] = commandImport;
        logger.log(`Loaded command: ${commandImport.name}`);
    }

    // Load handlers
    const handleFiles = getAllFiles(__dirname + "/messageHandlers");

    for (const handleFile of handleFiles) {
        const handleImport = require(handleFile).default as HypnoMessageHandler;
        handlers.push(handleImport);
        logger.log(`Loaded handler: ${handleImport.name}`);
    }
    await connect();
    await connectAnalytic();

    checkBadges();
    setTimeout(() => {
        checkBadges();
    }, 60000);

    logger.log(`${client.user?.username} successfully logged in!`);
});

client.login(
    readFileSync(__dirname + "/../token.txt", "utf-8").trim()
);

process.on("uncaughtException", async (err) => {
    console.log(err);
    errors++;
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

// Backup
let lastBackup = 0;
let loc = path.normalize(path.resolve(__dirname, "../last_backup.txt"));
if (!existsSync(loc))
    writeFileSync(loc, "0");
lastBackup = new Date(readFileSync(loc, "utf-8")).getTime();

if (8.64e+7 - (Date.now() - lastBackup) < 0) {
    createBackup();
    logger.log(`Created backup!`);
    writeFileSync(loc, Date.now().toString());
}