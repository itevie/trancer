import "dotenv/config";
import { Client, IntentsBitField, Partials, TextChannel } from "discord.js";
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { HypnoCommand, HypnoMessageHandler } from "./types/util";
import { connect } from "./util/database";
import getAllFiles, { createBackup, createEmbed } from "./util/other";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Logger from "./util/Logger";
import config from "./config";
import { connectAnalytic } from "./util/analytics";
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

let args = commandLineArgs(cliArgsDefinitio);

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
import { initStatusChanger } from "./util/statusChanger";
import { loadSlashCommands } from "./util/slashCommands";
import initAllManagers from "./managers/loadAll";
import { ALL } from "dns";

const logger = new Logger("loader");
export let errors = 0;

// Load critical stuff
(async () => {
  await connect();
  await connectAnalytic();
})();

// Load commands
const commandFiles: string[] = (
  args["load-cmd"] && args["load-cmd"].length > 0
    ? args["load-cmd"].map((x: string) => `${__dirname}/commands/${x}`)
    : getAllFiles(__dirname + "/commands")
)
  .filter((x: string) => !x.match(/_[a-zA-Z_]+\.[tj]s/))
  .filter((x: string) => x.match(/(\.[tj]s)$/));

const commandFileCache: Map<string, string> = new Map();

for (const commandFile of commandFiles) {
  const commandImport = require(commandFile).default as HypnoCommand;
  if (commandImport.ignore) continue;

  if (commands[commandImport.name]) {
    logger.warn(
      `Command ${commandImport.name} already exists and will be overwritten (${commandFileCache.get(commandImport.name)} => ${commandFile})`,
    );
  }

  commands[commandImport.name] = commandImport;
  commandFileCache.set(commandImport.name, commandFile);
  uniqueCommands[commandImport.name] = commandImport;
  for (const alias of commandImport.aliases || []) {
    if (commands[alias]) {
      logger.warn(
        `Command ${alias} already exists and will be overwritten (${commandFileCache.get(alias)} => ${commandFile})`,
      );
    }

    if (commandImport.eachAliasIsItsOwnCommand) {
      commands[alias] = {
        ...commandImport,
        name: alias,
      };
    } else {
      commands[alias] = commandImport;
    }
    commandFileCache.set(alias, commandFile);
  }
  logger.log(`Loaded command: ${commandImport.name}`);
}

// Load events
const eventFiles = getAllFiles(__dirname + "/events");
for (const eventFile of eventFiles) {
  require(eventFile);
  logger.log(`Loaded event: ${eventFile}`);
}

client.on("ready", async () => {
  loadAllSources();
  initStatusChanger();
  loadSlashCommands();

  /*const quotes = (await actions.quotes.getForServer("1257416273520758814"))
    .map((x) => x.content)
    .join("\n");
  writeFileSync("./test.txt", quotes);
*/

  // let quotes = (
  //   await actions.quotes.getForServer("1257416273520758814")
  // ).filter((x) => !!x.channel_id);
  // for (const i of quotes)
  //   try {
  //     actions.wordUsage.addMessage(
  //       {
  //         content: i.content,
  //         author: { id: i.author_id },
  //         guild: {
  //           id: i.server_id,
  //         },
  //         channel: { id: i.channel_id },
  //       },
  //       new Date(i.created_at),
  //     );
  //   } catch {}

  if (
    !args["no-handlers"] &&
    !(
      client.user.id === config.devBot.id && config.devBot.ignoreMessageHandlers
    )
  ) {
    // Load handlers
    const handleFiles = getAllFiles(__dirname + "/messageHandlers");

    for (const handleFile of handleFiles) {
      const handleImport = require(handleFile).default as HypnoMessageHandler;
      if (handleImport.disabled) continue;
      handlers.push(handleImport);
      logger.log(`Loaded handler: ${handleImport.name}`);
    }
  }

  initAllManagers();

  logger.log(`${client.user?.username} successfully logged in!`);

  await (await client.guilds.fetch(config.botServer.id)).members.fetch();

  if (true || config.website.enabled) {
    initServer();
  }

  const guilds = await client.guilds.fetch();
  for await (const [_, guild] of guilds) {
    const g = await guild.fetch();
    await g.members.fetch();
    logger.log(`Loaded server: ${g.name} (${g.id}) owned by ${g.ownerId}`);
  }
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
