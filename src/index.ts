import { Client, IntentsBitField, PermissionsBitField } from "discord.js";
import { HypnoCommand } from "./types/command";
import getAllFiles from "./util/getAllFiles";
import config from "./config.json";
import { connect } from "./util/database";
import { getImposition } from "./util/actions/imposition";
import { getRandomImposition } from "./util/other";
import { getServerSettings, setupSettingsFor } from "./util/actions/settings";
import { readFileSync } from "fs";

// Load commands
export const commands: { [key: string]: HypnoCommand } = {};
const commandFiles = getAllFiles(__dirname + "/commands");

for (const commandFile of commandFiles) {
    const commandImport = require(commandFile).default as HypnoCommand;
    commands[commandImport.name] = commandImport;
    for (const alias of commandImport.aliases || [])
        commands[alias] = commandImport;
    console.log(`Loaded command: ${commandImport.name}`);
}

// Setup client shit
const client = new Client({
    intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages
    ]
});

client.on("ready", () => {
    connect();
    console.log(`${client.user?.username} successfully logged in!`);
});

const randomImposition: { [key: string]: number } = {};

client.on("messageCreate", async message => {
    // Disallow bots
    if (message.author.bot) return;

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
                await message.channel.send(getRandomImposition());
            }
        }

        randomImposition[message.channel.id] = Date.now();
    }

    if (!message.content.startsWith(settings.prefix)) return;

    // Extract command
    const content = message.content.substring(settings.prefix.length, message.content.length);
    const fullArgs = content.split(" ");
    const command = fullArgs.shift().toLowerCase();

    // Check command
    if (commands[command]) {
        const cmd = commands[command];

        const execute = () => cmd.handler(message, fullArgs);
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