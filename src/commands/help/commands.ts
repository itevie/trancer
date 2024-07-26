import { HypnoCommand } from "../../types/command";
import { commands } from "../..";
import { PermissionsBitField } from "discord.js";
import { getServerSettings } from "../../util/actions/settings";
import config from "../../config.json";

const comamnd: HypnoCommand = {
    name: "commands",
    aliases: ["cmds"],
    type: "help",
    description: "Get a list of commands",

    handler: async (message, args) => {
        let msg = "List of commands:\n";
        let adminOnly = "";

        const commandNames: string[] = [];
        for (const command in commands) {
            // Get command
            const cmd = commands[command];

            // Check if already done
            if (commandNames.includes(cmd.name)) continue;
            commandNames.push(cmd.name);

            // Do text
            const text = `\`$prefix${cmd.name}\`: ${cmd.description ?? "*No Description*"}\n`;

            if (cmd.adminOnly) {
                if (cmd.botServerOnly) {
                    if (message.guild.id === config.botServer.id)
                        adminOnly += text;
                } else adminOnly += text;
            }
            else msg += text;
        }

        // Check admin
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) && adminOnly)
            msg += `\nAdmin Commands:\n${adminOnly}`;

        return message.reply(msg.replace(/\$prefix/g, (await getServerSettings(message.guild.id)).prefix));
    }
}

export default comamnd;