import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { addMoneyFor, setLastDaily } from "../../util/actions/economy";
import { createEmbed, randomFromRange } from "../../util/other";

const command: HypnoCommand = {
  name: "daily",
  description: `Get your daily reward of ${config.economy.currency}!`,
  type: "economy",

  ratelimit: 1000 * 60 * 60 * 24,

  handler: async (message) => {
    // Give money
    let money = randomFromRange(
      config.economy.daily.min,
      config.economy.daily.max
    );

    await addMoneyFor(message.author.id, money, "commands");
    await setLastDaily(message.author.id);

    // Reply
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(
            `You collected your daily box of ${config.economy.currency}`
          )
          .setDescription(`You earnt **${money}**${config.economy.currency}!`),
      ],
    });
  },
};

export default command;
