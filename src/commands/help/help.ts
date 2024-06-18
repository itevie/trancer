import { commands } from "../..";
import { HypnoCommand } from "../../types/command";
import { getServerSettings } from "../../util/actions/settings";
import { createEmbed } from "../../util/other";
import { messages } from "../hideout/sendMessage";

const command: HypnoCommand = {
    name: "help",
    aliases: ["h"],
    type: "help",
    description: `Get help on how to use the bot`,

    handler: async (message, args) => {
        const categories: { [key: string]: string[] } = {};

        for (const i in commands) {
            const cat = commands[i].type ?? "uncategorised";
            if (!categories[cat]) categories[cat] = [];
            if (!categories[cat].includes(commands[i].name))
                categories[cat].push(commands[i].name);
        }

        let text = "";

        for (const cat in categories) {
            text += `**${cat}**\n${categories[cat].map(x => `\`${x}\``).join(", ")}\n\n`;
        }

        const serverSettings = await getServerSettings(message.guild.id);

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