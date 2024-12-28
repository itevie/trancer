import { HypnoMessageHandler } from "../types/util";
import config from "../config";
import { randomFromRange } from "../util/other";
import { addMoneyFor } from "../util/actions/economy";
import ecoConfig from "../ecoConfig";

const timeouts: { [key: string]: number } = {};

const handler: HypnoMessageHandler = {
  name: "economy",
  description: "Handles message economy",
  noCommands: true,

  handler: async (message) => {
    if (message.guild.id !== config.botServer.id) return;

    if (
      ecoConfig.payouts.message.limit -
        (Date.now() - (timeouts[message.author.id] ?? 0)) <
      0
    ) {
      let money = randomFromRange(
        ecoConfig.payouts.message.min,
        ecoConfig.payouts.message.max
      );
      await addMoneyFor(message.author.id, money, "messaging");
      timeouts[message.author.id] = Date.now();
    }
  },
};

export default handler;
