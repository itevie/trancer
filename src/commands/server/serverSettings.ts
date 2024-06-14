import { HypnoCommand } from "../../types/command";
import { setServerPrefix } from "../../util/actions/settings";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const settings = {
    prefix: "string",
    subrole: "id",
    tistrole: "id",
    switchrole: "id",
};

const settingsToSql = {
    prefix: "prefix",
    subrole: "sub_role_id",
    tistrole: "tist_role_id",
    switchrole: "switch_role_id"
};

const command: HypnoCommand = {
    name: "settings",
    aliases: ["server", "serversettings", "sset"],
    description: "Modify settings for your server",
    type: "admin",
    usage: [
        ["$cmd prefix <prefix>", "Sets the prefix for the bot"],
        ["$cmd subrole <id>", "Sets the subject role for this server"],
        ["$cmd tistrole <id>", "Sets the hypnotist role for this server"],
        ["$cmd switchrole <id>", "Sets the switch role for this server"],
    ],
    adminOnly: true,

    handler: async (message, args) => {
        const currentSettings = await database.get(`SELECT * FROM server_settings WHERE server_id = (?)`, message.guild.id);

        // If there are no settings present, show user the current ones
        if (!args[0]) {
            // Add the currents
            let current = "";
            for (const i in currentSettings) {
                // Convert sql key to nice key
                let key = i;
                for (const x in settingsToSql) if (settingsToSql[x] === key) {
                    key = x;
                    break;
                }
                current += `**${key}**: ${currentSettings[i]}\n`;
            }

            // Send
            return message.reply({
                embeds: [
                    createEmbed()
                        .setTitle("Please provide an option to change")
                        .setDescription(`Current settings:\n\n${current}`)
                        .addFields([
                            {
                                name: "Options",
                                value: Object.keys(settings).map(x => `\`${x}\``).join(", ")
                            }
                        ])
                ]
            });
        }

        // Check if the option is invalid
        if (!settings[args[0]])
            return message.reply(`Invalid option, pick one of: ${Object.keys(settings).join(", ")}`);

        // Guard - Check for arg 1 presence
        if (!args[1])
            return message.reply(`**${args[0]}** is currently set to: **${currentSettings[settingsToSql[args[0]]]}**`);

        // Check if it is the custom ID type
        if (settings[args[0]] === "id" && !args[1].match(/^((<&)?[0-9]+>?)$/))
            return message.reply(`Invalid ID, please provide an ID, or a mention of the ID`);
        if (settings[args[0]] !== "id" && typeof args[1] !== settings[args[0]])
            return message.reply(`You provided an invalid input! Please provide an ${settings[args[0]]}`)

        // Get content
        const value = settings[args[0]] === "id"
            ? args[1].replace(/[<>&]/g, "")
            : args[1];

        // Do it
        await database.run(`UPDATE server_settings SET ${settingsToSql[args[0]]} = (?) WHERE server_id = (?)`, value, message.guild.id);
        return message.reply(`Property **${args[0]}** updated to **${value}**!`)
    }
}

export default command;