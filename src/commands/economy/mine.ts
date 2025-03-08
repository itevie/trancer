import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";
import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemMap } from "../../util/db-parts/items";
import { createEmbed, englishifyList } from "../../util/other";
import { currency, itemText } from "../../util/textProducer";

const gambleCost = 60;

const command: HypnoCommand = {
  name: "mine",
  aliases: ["gamblemine"],
  eachAliasIsItsOwnCommand: true,
  description: `Mine for minerals, requires a pickaxe. Uses your most expensive pickaxe.\nGamble mining costs ${currency(
    gambleCost
  )}`,
  type: "economy",

  ratelimit: async (_, { command }) => {
    if (command === "gamblemine") return null;
    else return ecoConfig.payouts.mine.limit;
  },

  preHandler: async (message, { serverSettings, command }) => {
    // Check if it is a gamble mine
    if (command === "gamblemine") {
      if ((await actions.eco.getFor(message.author.id)).balance < gambleCost) {
        await message.reply(
          `:warning: You do not have ${currency(gambleCost)}!`
        );
        return false;
      } else {
        await actions.eco.removeMoneyFor(message.author.id, gambleCost);
        return true;
      }
    }

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
    // Resolve user's most expensive pickaxe
    const pickaxe = (
      await actions.items.aquired.resolveFrom(
        await actions.items.aquired.getAllFor(message.author.id)
      )
    )
      .filter((item) => item.tag === "pickaxe")
      .sort((a, b) => b.price - a.price)[0];
    const luckMultiplier = pickaxe.name === "emerald-pickaxe" ? 0.1 : 0;

    // Generate minerals and fallback rock
    const minerals = (await actions.items.getByTag("mineral")).filter(
      (x) => x.name !== "rock"
    );
    const rock = itemMap[ecoConfig.mining.defaultSpace];
    const generateMineral = () =>
      minerals.find(
        (mineral) => Math.random() - luckMultiplier < mineral.weight
      ) || rock;

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
      )
      .setFooter({
        text: `Luck multiplier: ${luckMultiplier * 100}%`,
      });

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

    const items: { [key: number]: { item: Item; amount: number } } = {};

    // Award minerals to user
    for (const row of map) {
      if (!items[row[selected].id])
        items[row[selected].id] = { item: row[selected], amount: 0 };
      items[row[selected].id].amount++;
      await actions.items.aquired.addFor(message.author.id, row[selected].id);
    }

    // Update message with mined results
    await msg.edit({
      components: [],
      embeds: [
        createEmbed()
          .setTitle("You yearned for the mines")
          .setDescription(
            `${englishifyList(
              Object.entries(items).map((x) =>
                itemText(x[1].item, x[1].amount, true)
              )
            )} worth ${currency(
              Object.entries(items).reduce(
                (p, c) => p + c[1].item.price * c[1].amount,
                0
              )
            )}\n${
              map
                .map((row) => row.map((item) => item.emoji).join(""))
                .join("\n") +
              "\n" +
              rowMarker.join("")
            }`
          )
          .setFooter({
            text: `Luck multiplier: ${luckMultiplier * 100}%`,
          }),
      ],
    });
  },
};

export default command;
