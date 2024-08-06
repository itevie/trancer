import { HypnoCommand } from "../../types/command";
import { commands } from "../..";
import { createEmbed } from "../../util/other";
import { getServerSettings } from "../../util/actions/settings";

const command: HypnoCommand = {
    name: "command",
    aliases: ["cmd"],
    description: `Get details on a command`,
    type: "help",

    handler: async (message, args) => {
        // Check if command
        if (!commands[args[0]])
            return message.reply(`That command does not exist`);

        // Get command
        const command = commands[args[0]];
        const serverDetails = await getServerSettings(message.guild.id);

        // Get list of restrictions
        let restrictions = [];
        if (command.adminOnly)
            restrictions.push(`Admin Only ${command.except ? `(has exceptions)` : ""}`);
        if (command.botServerOnly)
            restrictions.push("Bot Server Only");
        if (restrictions.length === 0)
            restrictions.push("*None*");

        // Create embed
        const embed = createEmbed()
            .setTitle(`Command ${command.name}`)
            .setDescription(command.description ?? "*No Description*")
            .addFields([
                {
                    name: "Other Usage",
                    value: !command.usage
                        ? "*None Other*"
                        : (command.usage.map(x => `\`$prefix${x[0].replace("$cmd", command.name)}\` - ${x[1]}`).join("\n"))
                            .replace(/\$prefix/g, serverDetails.prefix)
                },
                {
                    name: "Examples",
                    value: !command.examples
                        ? "*No Examples*"
                        : (command.examples.map(x => `\`$prefix${x[0].replace("$cmd", command.name)}\` - ${x[1]}`).join("\n"))
                            .replace(/\$prefix/g, serverDetails.prefix)
                },
                {
                    name: "Aliases",
                    value: !command.aliases ? "*No Aliases*" : command.aliases.map(x => `\`${x}\``).join(", ")
                },
                {
                    name: "Restrictions",
                    value: restrictions.join(", ")
                }
            ]);

        return message.reply({
            embeds: [embed]
        });
    }
}

export default command;