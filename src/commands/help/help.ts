import { MessageCreateOptions, PermissionFlagsBits } from "discord.js";
import { commands } from "../..";
import { HypnoCommand, HypnoCommandType } from "../../types/util";
import getAllFiles, { createEmbed } from "../../util/other";
import config from "../../config";

const messageFiles = getAllFiles(__dirname + "/../../topics");
export const messages: { [key: string]: MessageCreateOptions } = {};
for (const messageFile of messageFiles) {
  const name = messageFile.match(/[a-z\-_]+\.[tj]s/)[0].replace(/\.[tj]s/, "");
  const messageImport = require(messageFile).default as MessageCreateOptions;
  messages[name] = messageImport;
}

const categoryEmojis: Record<HypnoCommandType, string> = {
  ai: "🤖",
  actions: "👊",
  uncategorised: "❓",
  badges: "🥇",
  help: "📖",
  admin: "🛠️",
  fun: "🎮",
  counting: "🔢",
  economy: "🌀",
  hypnosis: "😵‍💫",
  leaderboards: "🏆",
  messages: "💬",
  quotes: "🗨️",
  spirals: "😵‍💫",
  cards: "🎴",
  ranks: "🌭",
  analytics: "📈",
  dawnagotchi: "🏳‍🌈",
  games: "🎮️",
  qotd: "❓",
};

const command: HypnoCommand<{ ignoreGuards: boolean }> = {
  name: "help",
  aliases: ["h", "commands", "cmds"],
  type: "help",
  description: `Get help on how to use the bot`,

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "ignoreGuards",
        type: "boolean",
        description: `Whether or not to forcefully show admin commands`,
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { serverSettings, args }) => {
    const categories: { [key: string]: string[] } = {};

    for (const i in commands) {
      const cat = commands[i].type ?? "uncategorised";
      let cmd = commands[i];

      const add = () => {
        if (!categories[cat]) categories[cat] = [];
        if (!categories[cat].includes(cmd.name)) {
          categories[cat].push(cmd.name);
        }
      };

      // Check guards
      if (args.ignoreGuards)
        if (args.ignoreGuards) {
          add();
          continue;
        }
      if (cmd.guards) {
        if (
          cmd.guards.includes("bot-owner") &&
          message.author.id !== config.owner
        )
          continue;
        if (
          cmd.guards.includes("bot-server") &&
          message.guild.id !== config.botServer.id
        )
          continue;
        if (
          cmd.guards.includes("admin") &&
          !message.member.permissions.has(PermissionFlagsBits.Administrator)
        )
          continue;
      }
      add();
    }

    let text = "";

    for (const cat in categories) {
      if (cat === "actions") {
        text += `**${categoryEmojis[cat] || ""} ${cat}**\nSee \`${
          serverSettings.prefix
        }action\` to view actions you can play!\n\n`;
      } else {
        text += `**${categoryEmojis[cat] || ""} ${cat}**\n${categories[cat]
          .map((x) => `\`${x}\``)
          .join(", ")}\n\n`;
      }
    }

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle("Help")
          .setDescription(
            `Hello! This is a small bot based around hypnosis, it has a few features, look through them below\n` +
              `*Use \`${serverSettings.prefix}command <commandname>\` to get details on a command*` +
              `\n\n${text}`
          )
          .addFields([
            {
              name: "Topics",
              value:
                `Below are the list of topics you can read about, use \`${serverSettings.prefix}topic <topic>\` to learn more about it!\n\n` +
                Object.keys(messages)
                  .filter((x) => x.startsWith("help-"))
                  .map((x) => x.replace("help-", ""))
                  .join(", "),
            },
          ]),
      ],
    });
  },
};

export default command;
