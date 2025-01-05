import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemMap } from "../../util/db-parts/items";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "mine",
  description:
    "Mine for minerals, requires a pickaxe. Uses your most expensive pickaxe.",
  type: "economy",

  ratelimit: ecoConfig.payouts.mine.limit,

  preHandler: async (message, { serverSettings }) => {
    // Resolve user's most expensive pickaxe
    const pickaxe = (
      await actions.items.aquired.resolveFrom(
        await actions.items.aquired.getAllFor(message.author.id)
      )
    )
      .filter((item) => item.tag === "pickaxe")
      .sort((a, b) => b.price - a.price)[0];

    if (!pickaxe) {
      await message.reply(
        `:warning: You do not have a pickaxe! Check the crafting recipes with \`${serverSettings.prefix}recipes\`.`
      );
      return false;
    }
    return true;
  },

  handler: async (message) => {
    // Generate minerals and fallback rock
    const minerals = await actions.items.getByTag("mineral");
    const rock = itemMap[ecoConfig.mining.defaultSpace];
    const generateMineral = () =>
      minerals.find((mineral) => Math.random() < mineral.weight) || rock;

    // Create a 5x5 mining map
    const map = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, generateMineral)
    );

    const rowMarker = [":one:", ":two:", ":three:", ":four:", ":five:"];

    // Prepare embed and buttons
    const embed = createEmbed()
      .setTitle("Select where to mine")
      .setDescription(
        `${ecoConfig.mining.unknownSpace.repeat(5)}\n`.repeat(5) +
          rowMarker.join("")
      );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      [1, 2, 3, 4, 5].map((num) =>
        new ButtonBuilder()
          .setLabel(num.toString())
          .setCustomId(num.toString())
          .setStyle(ButtonStyle.Primary)
      )
    );

    // Send message with buttons
    const msg = await message.reply({
      embeds: [embed],
      // @ts-ignore
      components: [actionRow],
    });

    // Await user selection
    const result = await msg.awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id,
    });
    await result.deferUpdate();

    const selected = parseInt(result.customId) - 1;
    rowMarker[selected] = ":arrow_double_up:";

    // Award minerals to user
    for (const row of map) {
      await actions.items.aquired.addFor(message.author.id, row[selected].id);
    }

    // Update message with mined results
    await msg.edit({
      embeds: [
        createEmbed()
          .setTitle("You yearned for the mines")
          .setDescription(
            map
              .map((row) => row.map((item) => item.emoji).join(""))
              .join("\n") +
              "\n" +
              rowMarker.join("")
          ),
      ],
    });
  },
};

export default command;
