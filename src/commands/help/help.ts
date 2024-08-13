import { MessageCreateOptions } from "discord.js";
import { commands } from "../..";
import { HypnoCommand } from "../../types/command";
import { getServerSettings } from "../../util/actions/settings";
import getAllFiles from "../../util/getAllFiles";
import { createEmbed } from "../../util/other";

const messageFiles = getAllFiles(__dirname + "/../../messages");
export const messages: { [key: string]: MessageCreateOptions } = {};
for (const messageFile of messageFiles) {
    const name = messageFile.match(/[a-z\-_]+\.ts/)[0].replace(".ts", "");
    const messageImport = require(messageFile).default as MessageCreateOptions;
    messages[name] = messageImport;
}
const types = Object.keys(messages).map(x => `\`${x}\``).join(", ");

const categoryEmojis: { [key: string]: string } = {
    "ai": "🤖",
    "uncategorised": "❓",
    "badges": "🥇",
    "help": "📖",
    "admin": "🛠️",
    "fun": "🎮",
    "counting": "🔢",
    "economy": "🌀",
    "imposition": "👉",
    "leaderboards": "📈",
    "messages": "💬",
    "quotes": "🗨️",
    "spirals": "😵‍💫",
    "cards": "🎴"
};

const command: HypnoCommand = {
    name: "help",
    aliases: ["h", "commands", "cmds"],
    type: "help",
    description: `Get help on how to use the bot`,

    handler: async (message, { serverSettings }) => {
        const categories: { [key: string]: string[] } = {};

        for (const i in commands) {
            const cat = commands[i].type ?? "uncategorised";
            if (!categories[cat]) categories[cat] = [];
            if (!categories[cat].includes(commands[i].name))
                categories[cat].push(commands[i].name);
        }

        let text = "";

        for (const cat in categories) {
            text += `**${categoryEmojis[cat] || ""} ${cat}**\n${categories[cat].map(x => `\`${x}\``).join(", ")}\n\n`;
        }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle("Help")
                    .setDescription(
                        `Hello! This is a small bot based around hypnosis, it has a few features, look through them below\n`
                        + `*Use \`${serverSettings.prefix}command <commandname>\` to get details on a command*`
                        + `\n\n${text}`
                    )
                    .addFields([
                        {
                            name: "Topics",
                            value: `Use \`${serverSettings.prefix}topic <topic>\` to learn more about it!\n\n`
                                + Object.keys(messages)
                                    .filter(x => x.startsWith("help-"))
                                    .map(x => x.replace("help-", ""))
                                    .join(", ")
                        }
                    ])
            ]
        });
    }
}

export default command;