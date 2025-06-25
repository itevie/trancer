import "dotenv/config";
import { Client, IntentsBitField, Partials, TextChannel } from "discord.js";
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { HypnoCommand, HypnoMessageHandler, MaybePromise } from "./types/util";
import Logger from "./util/Logger";
import config from "./config";
import cliArgumentsDefinition from "./cliArgs";
import loadTs from "./util/tsLoader";
import { Init } from "./init/init";
import { createEmbed } from "./util/other";

export const args = commandLineArgs(cliArgumentsDefinition);

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

const logger = new Logger("loader");
export let errors = 0;

const initiators = loadTs(__dirname + "/init");
export const whenReadyInitiators: (() => MaybePromise<any>)[] = [];
(async () => {
  logger.log(`Running ${initiators.length} initiators`);
  for await (const init of initiators) {
    try {
      const thing = require(init).default as Init;
      if (typeof thing === "object" && thing.whenReady)
        whenReadyInitiators.push(thing.execute);
      else if (typeof thing === "function") await thing();
      else await thing.execute();
    } catch (e) {
      logger.error(`Failed to run initialiser: ${init}!`, e);
      process.exit(1);
    }
  }
})();

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
