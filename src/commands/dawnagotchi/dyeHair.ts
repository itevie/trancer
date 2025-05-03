import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { generateDawnagotchiEmbed } from "./_util";

const command: HypnoCommand<{ hex: string }> = {
  name: "dyehair",
  aliases: ["dye"],
  description: `Dye your Dawn's hair!`,
  type: "dawnagotchi",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "hex",
        type: "string",
        description: `Hex color for the Dawn's hair`,
      },
    ],
  },

  handler: async (message, args) => {
    // Check if they have any hair dye
    let item = await actions.items.aquired.getFor(
      message.author.id,
      await actions.items.getId(ecoConfig.items.hairDye),
    );
    let shopItem = await actions.items.getByName(ecoConfig.items.hairDye);
    if (item.amount === 0)
      return message.reply(`You do not have the **${shopItem.name}** item!`);

    // Check if they have a Dawn
    let dawn = await actions.dawnagotchi.getFor(message.author.id);
    if (!dawn) return message.reply(`You do not have a Dawn!`);

    if (!args.args.hex.match(/^((random)|(#[0-9a-fA-F]{6}))$/))
      return message.reply(
        `You need to provide a hex (#xxxxxx) color, or "random".`,
      );

    // Change hair color & remove item
    await database.run(
      `UPDATE dawnagotchi SET hair_color_hex = ? WHERE owner_id = ?`,
      args.args.hex,
      message.author.id,
    );
    await actions.items.aquired.removeFor(message.author.id, item.item_id);

    const { embed, attachment } = await generateDawnagotchiEmbed(
      await actions.dawnagotchi.getFor(message.author.id),
    );

    return message.reply({
      content: `Your Dawn's hair has been dyed **${args.args.hex}**!`,
      embeds: [embed],
      files: [attachment],
    });
  },
};

export default command;
