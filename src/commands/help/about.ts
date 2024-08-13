import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { createEmbed } from "../../util/other";
import config from "../../config";

const command: HypnoCommand = {
    name: "about",
    description: "Get details about the bot",
    type: "help",

    handler: async (message, { serverSettings }) => {
        // Try fetch creators username
        let username: string = config.credits.creatorUsername;
        try {
            username = (await message.client.users.fetch(config.credits.creatorId)).username;
        } catch { }

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`About ${message.client.user.username}!`)
                    .setDescription(`I am a hypnosis-oriented discord bot which many features! Check out: \`${serverSettings.prefix}help\`!`)
                    .addFields([
                        {
                            name: "Details",
                            value: [
                                ["Server Count", `${message.client.guilds.cache.size}`],
                            ].map(x => `**${x[0]}**: ${x[1]}`).join("\n")
                        },
                        {
                            name: "Credits",
                            value: `**Created by**: ${username}\n**Server invite link**: ${config.credits.serverInvite}\n**GitHub**: ${config.credits.github}`
                        }
                    ])
            ]
        });
    }
};

export default command;