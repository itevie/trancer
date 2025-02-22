import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "removerelationship",
  aliases: ["rmrelationship", "rmr", "remover"],
  description: "Deletes a relationship (two way)",
  type: "marriage",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const relationship = await actions.relationships.current(
      message.author.id,
      args.user.id
    );
    const relationship2 = await actions.relationships.current(
      args.user.id,
      message.author.id
    );

    if (!relationship && !relationship2)
      return message.reply(`You two do not have any sort of relationship.`);

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Remove relationship`)
        .setDescription(
          `Are you sure you want to remove your relationship?\n\nYou :arrow_right: them: ${
            relationship ? `${relationship.type}` : ":x:"
          }\nThem :arrow_right: you: ${
            relationship2 ? `${relationship2.type}` : ":x:"
          }`
        ),
      async callback() {
        if (relationship)
          await actions.relationships.delete(
            relationship.user1,
            relationship.user2
          );
        if (relationship2)
          await actions.relationships.delete(
            relationship2.user1,
            relationship2.user2
          );

        return {
          embeds: [
            createEmbed()
              .setTitle("Done!")
              .setDescription(`The relationships have been removed`),
          ],
        };
      },
    });
  },
};

export default command;
