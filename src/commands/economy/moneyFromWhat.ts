import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getEconomyFor } from "../../util/actions/economy";
import { createEmbed } from "../../util/other";
import ecoConfig from "../../ecoConfig";

const command: HypnoCommand<{ user?: User }> = {
  name: "moneyfromwhat",
  aliases: ["mfw"],
  description: "Check where you got your money from",
  type: "economy",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        mustHaveEco: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user ? args.user : message.author;
    let eco = await getEconomyFor(user.id);

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`How ${user.username} got ${ecoConfig.currency}`)
          .setDescription(
            [
              ["Commands", eco.from_commands],
              ["Gambling", eco.from_gambling],
              ["Gambling Lost", eco.from_gambling_lost],
              ["Messaging", eco.from_messaging],
              ["VC", eco.from_vc],
              ["Helping", eco.from_helping],
            ]
              .map((x) => `**${x[0]}**: ${x[1]}${ecoConfig.currency}`)
              .join("\n")
          ),
      ],
    });
  },
};

export default command;
