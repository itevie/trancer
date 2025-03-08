import { HypnoMessageHandler } from "../types/util";
import config from "../config";
import { randomFromRange } from "../util/other";
import ecoConfig from "../ecoConfig";
import { actions } from "../util/database";

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
      await actions.eco.addMoneyFor(message.author.id, money, "messaging");
      timeouts[message.author.id] = Date.now();
    }
  },
};

export default handler;
