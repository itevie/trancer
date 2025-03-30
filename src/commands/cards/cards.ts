import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";

const command: HypnoCommand<{ user?: User; sort: "rarity" | "id" }> = {
  name: "cards",
  type: "cards",
  description: "Get yours or another persons cards",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
      {
        name: "sort",
        type: "string",
        oneOf: ["rarity", "id"],
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    // Get details
    let user = args.user ? args.user : message.author;
    let cards = (await actions.cards.aquired.getAllFor(user.id))
      .filter((x) => x.amount > 0)
      .sort((a, b) => a.card_id - b.card_id);
    let actualCards: { [key: string]: Card } = {};
    if (args.sort === "rarity") {
      for await (const card of cards) {
        actualCards[card.card_id] = await actions.cards.getById(card.card_id);
      }
    }

    if (args.sort === "id") {
      cards = cards.sort((a, b) => a.card_id - b.card_id);
    } else if (args.sort === "rarity") {
      let cardsA: { [key: string]: AquiredCard[] } = {
        mythic: [],
        epic: [],
        rare: [],
        uncommon: [],
        common: [],
      };
      for (const card of cards) {
        cardsA[actualCards[card.card_id].rarity].push(card);
      }
      cards = [];
      for (const i in cardsA) {
        cards.push(...cardsA[i]);
      }
    }

    let data: string[] = [];
    for await (const card of cards) {
      let actualCard = await actions.cards.getById(card.card_id);
      data.push(
        `**${actualCard.name}** *${actualCard.rarity} [${actualCard.id}]*: ${card.amount}`,
      );
    }

    return paginate({
      message: message,
      embed: createEmbed()
        .setTitle(`${user.username}'s cards`)
        .setTimestamp(null),
      type: "description",
      data: data,
      pageLength: 20,
    });
  },
};

export default command;
