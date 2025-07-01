import config from "../config";
import ecoConfig from "../ecoConfig";
import { actions } from "../util/database";
import { randomFromRange } from "../util/other";
import { getCurrentVC, past } from "./_vc";
import { Timer } from "./timer";

const timer: Timer = {
  name: "vc-payout",
  every: ecoConfig.payouts.vc.limit,
  async execute() {
    let inVCrightNow = await getCurrentVC();

    // Award people who are still in it
    for await (const id of inVCrightNow)
      if (id[1] === config.botServer.id)
        if (past.actual.some((x) => x[0] === id[0]))
          await actions.eco.addMoneyFor(
            id[0],
            randomFromRange(ecoConfig.payouts.vc.min, ecoConfig.payouts.vc.max),
            "vc",
          );

    // Reset
    past.actual = inVCrightNow;
  },
};

export default timer;
