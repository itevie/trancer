import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, keyedCache } from "../../util/database";
import { createEmbed, makePercentageASCII } from "../../util/other";
import { msToHowLong } from "../../util/ms";
import { b, currency, list, tick } from "../../util/language";
import ecoConfig from "../../ecoConfig";
import { calculateFishingRatelimit, getUsersBestPickaxe } from "./_util";
import { itemIDMap, itemMap } from "../../util/db-parts/items";
import { computeCardPrice } from "../cards/_util";
import { calculateLevel, getXPForLevel } from "../../messageHandlers/xp";
import { fakeRun } from "../../events/messageCreate";
import { Mission, missions } from "./_missions";

const command: HypnoCommand<{ user: User }> = {
  name: "economy",
  description: "View all of your economy details",
  type: "economy",
  aliases: ["eco", "ecodetails", "mfw", "moneyfromwhat"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const economy = await actions.eco.getFor(args.user.id);

    const dailyRatelimit =
      1000 * 60 * 60 * 24 -
      (Date.now() -
        (await actions.ratelimits.get(args.user.id, "daily")).getTime());
    const fishRatelimit =
      (await calculateFishingRatelimit(args.user)) -
      (Date.now() -
        (await actions.ratelimits.get(args.user.id, "fish")).getTime());
    const mineRatelimit =
      ecoConfig.payouts.mine.limit -
      (Date.now() -
        (await actions.ratelimits.get(args.user.id, "mine")).getTime());
    const workRatelimit =
      ecoConfig.payouts.work.limit -
      (Date.now() -
        (await actions.ratelimits.get(args.user.id, "work")).getTime());

    const aquiredItems = await actions.items.aquired.getAllFor(
      args.user.id,
      true,
    );
    const itemPrice = aquiredItems.reduce(
      (p, c) => p + itemIDMap[c.item_id]?.price * c.amount,
      0,
    );
    const itemAmount = aquiredItems.reduce((p, c) => p + c.amount, 0);

    const aquiredCards = await actions.cards.aquired.getAllFor(args.user.id);
    const cards = await actions.cards.getAll();
    const cardPrice = aquiredCards.reduce(
      (p, c) =>
        p + computeCardPrice(cards.find((x) => x.id === c.card_id)) * c.amount,
      0,
    );
    const cardAmount = aquiredCards.reduce((p, c) => p + c.amount, 0);

    const mineLevel = calculateLevel(economy.mine_xp);
    const fishLevel = calculateLevel(economy.fish_xp);
    const workLevel = calculateLevel(economy.work_xp);

    let missionText = [];
    let userMissions = await actions.missions.fetchTodayFor(economy.user_id);

    for await (const m of userMissions) {
      missionText.push(
        `> ${b(missions[m.name].description)}: ${await (missions[m.name] as Mission).check(m)}%`,
      );
    }

    const msg = await message.reply({
      embeds: [
        createEmbed()
          .setTitle(`Economy for ${args.user.username}`)
          .addFields([
            {
              name: "ℹ️ Basic",
              value: list([
                ["Balance", currency(economy.balance, true)],
                [
                  "Worth",
                  currency(economy.balance + cardAmount + itemPrice, true),
                ],
              ]),
              inline: true,
            },
            {
              name: "🏢 Working",
              value:
                `${economy.work_xp} XP (level ${workLevel})` +
                "\n" +
                list([
                  [
                    "Current Job",
                    economy.job
                      ? `${economy.job}`
                      : `Use \`${serverSettings.prefix}job\``,
                  ],
                ]),
              inline: true,
            },
            {
              name: "⛏️ Mining",
              value:
                `${economy.mine_xp} XP (level ${mineLevel})` +
                "\n" +
                list([
                  [
                    "Best Pickaxe",
                    (await getUsersBestPickaxe(args.user)).emoji ??
                      "*No Pickaxe*",
                  ],
                ]),
              inline: true,
            },
            {
              name: "🎣 Fishing",
              value:
                `${economy.fish_xp} XP (level ${fishLevel})` +
                "\n" +
                list([
                  [
                    "Owned Fishes",
                    aquiredItems
                      .filter((x) => itemIDMap[x.item_id].tag === "fish")
                      .reduce((p, c) => p + c.amount, 0),
                  ],
                  [
                    "Unique Fishes",
                    aquiredItems.filter(
                      (x) => itemIDMap[x.item_id].tag === "fish",
                    ).length,
                  ],
                ]),
              inline: true,
            },
            {
              name: "♠️ Missions",
              inline: true,
              value:
                list([["Mission Tokens", economy.mission_tokens.toString()]]) +
                "\n" +
                missionText.join("\n") +
                `${serverSettings.prefix}mission`,
            },
            {
              name: "⏳ Timers",
              value: list([
                ["Daily", tick(msToHowLong(dailyRatelimit, 1))],
                ["Fish", tick(msToHowLong(fishRatelimit, 1))],
                ["Mine", tick(msToHowLong(mineRatelimit, 1))],
                ["Work", tick(msToHowLong(workRatelimit, 1))],
              ]),
              inline: true,
            },
            {
              name: "🌟 Items",
              value: list([
                ["Owned Items", itemAmount],
                ["Unique Items", aquiredItems.length],
                ["Item Worth", currency(itemPrice, true)],
                [
                  "Lottery 🎫",
                  aquiredItems.find(
                    (x) => x.item_id === itemMap["lottery-ticket"].id,
                  )?.amount || `See \`${serverSettings.prefix}lottery\``,
                ],
              ]),
              inline: true,
            },
            {
              name: "♦️ Cards",
              value: list([
                ["Owned Cards", cardAmount],
                ["Unique Cards", aquiredCards.length],
                ["Card Worth", currency(cardPrice, true)],
              ]),
              inline: true,
            },
            {
              name: "❔ Money From",
              value: list([
                ["Commands", currency(economy.from_commands, true)],
                ["Messaging", currency(economy.from_messaging, true)],
                ["VC", currency(economy.from_vc, true)],
                ["Helping", currency(economy.from_helping, true)],
                ["Gambling", currency(economy.from_gambling, true)],
                ["Gambling (lost)", currency(economy.from_gambling_lost, true)],
              ]),
              inline: true,
            },
          ]),
      ],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`inventory`)
            .setLabel("Inventory"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`collectionbook`)
            .setLabel("Collection Book"),
        ),
      ],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 1000 * 60,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      switch (i.customId) {
        case "inventory":
          fakeRun(message, `${serverSettings.prefix}inventory ${args.user.id}`);
          break;
        case "collectionbook":
          fakeRun(
            message,
            `${serverSettings.prefix}collectionbook ${args.user.id}`,
          );
          break;
      }
    });

    collector.on("end", async () => {
      await msg.edit({ components: [] });
    });
    ``;
  },
};

export default command;
