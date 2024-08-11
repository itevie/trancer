import { HypnoCommand } from "../../types/command";
import { getImpositionFor } from "../../util/actions/imposition";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
    name: "getimpositions",
    aliases: ["getimpos", "getis"],
    type: "imposition",
    description: "Get your own or someone elses imposition actions",

    handler: async (message, { oldArgs: args }) => {
        let imposition = await getImpositionFor(message.author.id);

        // Check if another user was provided
        if (args[0]) {
            const userId = args[0].replace(/[<@>]/g, "");
            if (!userId.match(/^([0-9]+)/))
                return message.reply(`Please provide a valid mention of a user`);
            imposition = await getImpositionFor(userId);
        }

        // Done
        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Impositions Registered:`)
                    .setDescription(
                        imposition.length === 0
                            ? "*No imposition registered - will use defaults*"
                            : imposition.map(x => `${x.what}${x.is_bombardable ? " (bombard)" : ""}`).join("\n")
                    )
            ]
        })
    }
}

export default command;