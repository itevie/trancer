import { client } from "..";
import config from "../config";
import ecoConfig from "../ecoConfig";
import { HypnoMessageHandler } from "../types/util";
import { actions, database } from "../util/database";
import { randomFromRange } from "../util/other";

let pastVC1m: string[] = [];
let pastVCactual: string[] = [];

// Gets the current people in a VC
// excluding people on their own
async function getCurrentVC() {
  // Compute current
  let inVCrightNow: string[] = [];
  for await (const vcChannel of config.botServer.vcChannels) {
    let channel = await client.channels.fetch(vcChannel);
    if (channel.isVoiceBased()) {
      if (channel.members.size === 1) continue;
      for (const member of channel.members) inVCrightNow.push(member[1].id);
    }
  }

  // Don't allow only one person at a time
  if (inVCrightNow.length === 1) return [];

  return inVCrightNow;
}

// Interval for checking for giving money for VC time
setInterval(async () => {
  let inVCrightNow = await getCurrentVC();

  // Award people who are still in it
  for await (const id of inVCrightNow)
    if (pastVCactual.includes(id))
      await actions.eco.addMoneyFor(
        id,
        randomFromRange(ecoConfig.payouts.vc.min, ecoConfig.payouts.vc.max),
        "vc"
      );

  // Reset
  pastVCactual = inVCrightNow;
}, ecoConfig.payouts.vc.limit);

// Interval for adding the statistic to VC time
setInterval(async () => {
  let inVCrightNow = await getCurrentVC();

  // Award people who are still in it
  for await (const id of inVCrightNow)
    if (pastVC1m.includes(id))
      await database.run(
        `UPDATE user_data SET vc_time = vc_time + 1 WHERE user_id = ?`,
        id
      );

  pastVC1m = inVCrightNow;
}, 60000);

const handler: HypnoMessageHandler = {
  name: "vc-handler",
  description: "This isn't actually a message handler",
  handler: () => {},
};

export default handler;
