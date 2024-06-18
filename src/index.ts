import { Client, IntentsBitField, PermissionsBitField } from "discord.js";
import { HypnoCommand, HypnoCommandDetails } from "./types/command";
import getAllFiles from "./util/getAllFiles";
import config from "./config.json";
import { connect, database } from "./util/database";
import { getImposition } from "./util/actions/imposition";
import { createEmbed, getRandomImpositionFromFile } from "./util/other";
import { getServerSettings, setupSettingsFor } from "./util/actions/settings";
import { readFileSync } from "fs";
import { HypnoMessageHandler } from "./types/messageHandler";
import "./backend/index";

export const commands: { [key: string]: HypnoCommand } = {};
export const handlers: HypnoMessageHandler[] = [];

// Setup client shit
export const client = new Client({
    intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages
    ]
});

client.on("ready", () => {
    console.log(`${client.user?.username} successfully logged in!`);

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

    connect();
});

const randomImposition: { [key: string]: number } = {};

client.on("messageCreate", async message => {
    // German commas go away
    message.content = message.content.replace(/[’]/g, "'");

    // Disallow bots
    if (message.author.bot) return;
    if (!database) return;

    // Setup settings
    await setupSettingsFor(message.guild.id);
    const settings = await getServerSettings(message.guild.id);

    if (message.content.trim() == `<@${client.user.id}>`)
        return message.reply(`Hey! My prefix is: \`${settings.prefix}\`\nUse \`${settings.prefix}commands\` to view my commands! :cyclone:`);

    // Check random impo
    const imposition = await getImposition(message.channel.id);
    if (imposition?.is_enabled) {
        // Check if not set
        if (!randomImposition[message.channel.id])
            randomImposition[message.channel.id] = 0;

        // Check if should try send
        if (randomImposition[message.channel.id] - (Date.now() - imposition.every * (1000 * 60)) < 0) {
            if (Math.random() < (imposition.chance / 100)) {
                await message.channel.send(getRandomImpositionFromFile());
            }
        }

        randomImposition[message.channel.id] = Date.now();
    }

    // Check handlers
    for (const i in handlers) handlers[i].handler(message);

    if (!message.content.startsWith(settings.prefix)) return;

    // Extract command
    const content = message.content.substring(settings.prefix.length, message.content.length);
    const fullArgs = content.split(" ");
    const command = fullArgs.shift().toLowerCase();

    // Check command
    if (commands[command]) {
        const cmd = commands[command];
        const details: HypnoCommandDetails = {
            serverSettings: settings
        };

        const execute = () => cmd.handler(message, fullArgs, details);
        const except = () => { if (cmd.except) return cmd.except(message, fullArgs); else return false; };

        if (cmd.allowExceptions && config.exceptions.includes(message.author.id))
            return execute();

        // Guards
        if (cmd.adminOnly)
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !except())
                return message.reply(`You are not administrator :cyclone:`);
        if (cmd.hideoutOnly && message.guild.id !== config.hideout)
            return message.reply(`This command can only be used in Hypno Hideout :cyclone:`);

        // Execute
        execute();
    }
});

client.login(
    readFileSync(__dirname + "/../token.txt", "utf-8")
);

process.on("uncaughtException", async (err) => {
    console.log(err);
    try {
        let channel = await client.channels.fetch("1250573622284910714");
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
    }
});