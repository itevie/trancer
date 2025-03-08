import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";
import { marriageEmojis, relationshipArrayToEmojiArray } from "./_util";

const command: HypnoCommand<{ user: User; type?: RelationshipType }> = {
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
      {
        name: "type",
        type: "string",
        oneOf: Object.keys(marriageEmojis),
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

    if (args.type) {
      if (
        !relationship.some((x) => x.type === args.type) &&
        !relationship2.some((x) => x.type === args.type)
      )
        return message.reply(
          `You do not have that type of relationship with them!`
        );

      ConfirmAction({
        message,
        embed: createEmbed()
          .setTitle("Are you sure?")
          .setDescription(
            `Are you sure you want to remove that type of connection?`
          ),
        async callback() {
          await actions.relationships.deleteType(
            message.author.id,
            args.user.id,
            args.type
          );
          return {
            embeds: [
              createEmbed()
                .setTitle("Connection removed!")
                .setDescription("That type of connection has been removed!"),
            ],
          };
        },
      });

      return;
    }

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Remove relationship`)
        .setDescription(
          `Are you sure you want to remove your relationship?\n\nYou :arrow_right: them: ${
            relationship
              ? `${relationshipArrayToEmojiArray(relationship).join("")}`
              : ":x:"
          }\nThem :arrow_right: you: ${
            relationship2
              ? `${relationshipArrayToEmojiArray(relationship2).join("")}`
              : ":x:"
          }`
        ),
      async callback() {
        await actions.relationships.deleteFor(message.author.id, args.user.id);

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
