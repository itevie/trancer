import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { itemMap } from "../../util/db-parts/items";
import { currency, list } from "../../util/language";
import { createEmbed } from "../../util/other";
import { jobs } from "./_jobs";

const command: HypnoCommand = {
  name: "jobs",
  description: "Get a list of jobs and their rewards",
  type: "economy",

  handler: async (message, { args }) => {
    return paginate({
      message,
      embed: createEmbed().setTitle("The list of jobs"),
      type: "field",
      data: Object.entries(jobs).map((x) => ({
        name: x[0],
        value:
          x[1].description +
          "\n" +
          list([
            ["Level Required", x[1].levelRequired],
            [
              "Payout",
              typeof x[1].rewards.currency === "number"
                ? currency(x[1].rewards.currency)
                : `min: ${currency(x[1].rewards.currency.min)} max: ${currency(x[1].rewards.currency.max)}`,
            ],
            [
              "Potential Items",
              Object.entries(x[1].rewards.items.pool)
                .map((x) => itemMap[x[0]]?.emoji)
                .join(""),
            ],
            [
              "Potential Item Count",
              `min: **${x[1].rewards.items.count.min}** max: **${x[1].rewards.items.count.max}**`,
            ],
          ]),
      })),
    });
  },
};

export default command;
