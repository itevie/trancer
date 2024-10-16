import { Client, IntentsBitField, Partials } from "discord.js";
import type { HypnoCommand, HypnoMessageHandler } from "./src/types/util.d.ts";
import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import Logger from "./src/util/Logger.ts";

// Globals
export const commands: { [key: string]: HypnoCommand } = {};
export const handlers: HypnoMessageHandler[] = [];

// Setup the client
export const client = new Client({
  intents: [
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildInvites,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const logger = new Logger("loader");

// Base events
client.on("ready", async () => {
  // Load all events
  for await (const eventFile of walk("./src/events")) {
    if (eventFile.isDirectory) continue;

    await import(`./${eventFile.path}`);
    logger.log(`Loaded event: ${eventFile.name}`);
  }

  // Load all commands
  for await (const commandFile of walk("./src/commands")) {
    if (commandFile.isDirectory) continue;
    const commandImport = (await import(`./${commandFile.path}`))
      .default as HypnoCommand;
    commands[commandImport.name] = commandImport;

    for (const alias of commandImport.aliases || []) {
      commands[alias] = commandImport;
    }

    logger.log(`Loaded command: ${commandImport.name}`);
  }
});

// Login
client.login(
  Deno.readTextFileSync("./token.txt"),
);
