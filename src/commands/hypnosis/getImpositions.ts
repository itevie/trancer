import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getImpositionFor } from "../../util/actions/imposition";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "getimpositions",
  aliases: ["getimpos", "getis", "impolist", "ilist", "gi"],
  type: "hypnosis",
  description: "Get your own or someone elses imposition actions",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let imposition = await getImpositionFor(
      args.user ? args.user.id : message.author.id
    );

    // Done
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`Impositions Registered:`)
          .setDescription(
            imposition.length === 0
              ? "*No imposition registered - will use defaults*"
              : imposition
                  .map(
                    (x) => `${x.what}${x.is_bombardable ? " (bombard)" : ""}`
                  )
                  .join("\n")
          ),
      ],
    });
  },
};

export default command;
