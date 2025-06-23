import "dotenv/config";
import { Client, IntentsBitField, Partials, TextChannel } from "discord.js";
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { HypnoCommand, HypnoMessageHandler, MaybePromise } from "./types/util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Logger from "./util/Logger";
import config from "./config";
import path from "path";
import initServer from "./website";

const cliArgsDefinitio: OptionDefinition[] = [
  {
    name: "load-cmd",
    defaultValue: [],
    alias: "c",
    multiple: true,
    type: String,
  },
  { name: "no-handlers", defaultValue: false, type: Boolean },
] as const;

export const args = commandLineArgs(cliArgsDefinitio);

export const commands: { [key: string]: HypnoCommand } = {};
export const uniqueCommands: { [key: string]: HypnoCommand } = {};
export const handlers: HypnoMessageHandler[] = [];

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
    IntentsBitField.Flags.GuildInvites,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

import { loadAllSources } from "./commands/file-directory/_util";
import { loadSlashCommands } from "./util/slashCommands";
import initAllManagers from "./managers/loadAll";
import loadTs from "./util/tsLoader";
import { Init } from "./init/init";
import { createEmbed } from "./util/other";

const logger = new Logger("loader");
export let errors = 0;

const initiators = loadTs(__dirname + "/init");
const whenReady: (() => MaybePromise<any>)[] = [];
for (const init of initiators) {
  const thing = require(init).default as Init;
  if (typeof thing === "object" && thing.whenReady)
    whenReady.push(thing.execute);
  else if (typeof thing === "function") thing();
  else thing.execute();
}

client.on("ready", async () => {
  initAllManagers();

  logger.log(`${client.user?.username} successfully logged in!`);

  await (await client.guilds.fetch(config.botServer.id)).members.fetch();

  if (true || config.website.enabled) {
    initServer();
  }

  logger.log(`Executing when readies...`);
  for await (const part of whenReady) await part();
});

client.login(process.env.BOT_TOKEN);

process.on("uncaughtException", async (err: any) => {
  console.log(err);
  errors++;
  try {
    let channel = (await client.channels.fetch(
      config.botServer.channels.logs,
    )) as TextChannel;
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
                value:
                  "```" +
                  (err.stack ? err.stack.slice(0, 1000) : "*No Stack*") +
                  "```",
              },
              {
                name: `Msg Data`,
                value: `${err.msg?.content}: ${err.msg?.guild?.name}`,
              },
              {
                name: "Command Details",
                value: `**Command**: \`${err.command?.content}\`\n**Parsed**: \`${JSON.stringify(err.command?.args)}\``,
              },
            ])
            .toJSON(),
        ],
      });
    }
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
});

// Backup
let lastBackup = 0;
let loc = path.normalize(path.resolve(__dirname, "../last_backup.txt"));
if (!existsSync(loc)) writeFileSync(loc, "0");
lastBackup = new Date(readFileSync(loc, "utf-8")).getTime();

if (8.64e7 - (Date.now() - lastBackup) < 0) {
  createBackup();
  logger.log(`Created backup!`);
  writeFileSync(loc, Date.now().toString());
}
