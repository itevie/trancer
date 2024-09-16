import { Client, IntentsBitField, Partials, } from "discord.js";
import { HypnoCommand, HypnoMessageHandler } from "./types/util";
import { connect } from "./util/database";
import getAllFiles, { createBackup, createEmbed } from "./util/other";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { checkBadges } from "./util/badges";
import Logger from "./util/Logger";
import config from "./config";
import { connectAnalytic } from "./util/analytics";
import path from "path";
import initServer from "./website";
import { spawn } from "child_process";

export const commands: { [key: string]: HypnoCommand } = {};
export const handlers: HypnoMessageHandler[] = [];
export let localhostRunUrl: string | null = null;

// Setup client shit
export const client = new Client({
    intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildInvites
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

import { initInviteCache } from "./events/guildMemberAdd";

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
    initInviteCache();
    await connect();
    await connectAnalytic();

    checkBadges();
    setTimeout(() => {
        checkBadges();
    }, 60000);

    logger.log(`${client.user?.username} successfully logged in!`);

    await (await client.guilds.fetch(config.botServer.id)).members.fetch();

    if (config.website.enabled) {
        initServer();

        if (client.user.id !== config.devBot) {
            const child = spawn("ssh", ["-R", "80:localhost:8080", "nokey@localhost.run"]);

            child.stdout.on('data', (data: string) => {
                let url = data.toString().match(/[a-z0-9]+\.lhr\.life/)?.[0];
                if (url) {
                    logger.log(`localhost.run URL: ${url}`);
                    localhostRunUrl = `http://${url}`;
                }
            });
        }
    }
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