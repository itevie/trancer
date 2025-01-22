import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { createEmbed } from "../../util/other";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/textProducer";

// Do it here to not waste shit
let embed = createEmbed().setTitle(`Ways to get ${ecoConfig.currency}!`);
let symbol = ecoConfig.currency;

for (let i in ecoConfig.payouts) {
  if (["currency"].includes(i)) continue;
  embed.addFields([
    {
      name: `For ${ecoConfig.payouts[i].name}`,
      value:
        ecoConfig.payouts[i].min !== undefined
          ? `Min: \`${ecoConfig.payouts[i].min}\`${symbol} Max: \`${ecoConfig.payouts[i].max}\`${symbol}` +
            `${
              ecoConfig.payouts[i].limit
                ? `\nEvery: **${ecoConfig.payouts[i].limit / 60000} minutes**`
                : ""
            }` +
            `${
              ecoConfig.payouts[i].punishment
                ? `\nPunishment: ${currency(ecoConfig.payouts[i].punishment)}`
                : ""
            }`
          : "*No other details*",
    },
  ]);
}

const command: HypnoCommand = {
  name: "ecoways",
  aliases: [
    "howtogeteco",
    "spiralswhere",
    "iwantspiralsandnow",
    "iwantspirals",
  ],
  description: "Tells you how to get money",
  type: "economy",

  handler: (message) => {
    return message.reply({ embeds: [embed] });
  },
};

export default command;
