import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "collectionbook",
  description: "View all the items you have owned at some point",
  type: "economy",

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
    const user = args.user ? args.user : message.author;
    const aquired = await actions.items.aquired.resolveFrom(
      await actions.items.aquired.getAllFor(user.id)
    );
    const items = (await actions.items.getAll()).filter(
      (x) => !aquired.some((y) => y.id === x.id)
    );

    const fields: { name: string; value: string }[] = [];
    const tags: { [key: string]: string } = aquired.reduce((p, c) => {
      return {
        ...p,
        [c.tag || "No Tag"]: `${p[c.tag || "No Tag"] || ""}${
          c.emoji || ":question:"
        }`,
      };
    }, {});

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`${user.username}'s Collection Book`)
          .addFields(
            Object.entries(tags).map((x) => {
              return { name: x[0], value: x[1] };
            })
          )
          .addFields([
            {
              name: "Not Obtained",
              value: items.map((x) => x.emoji || ":question:").join(""),
            },
          ]),
      ],
    });
  },
};

export default command;
