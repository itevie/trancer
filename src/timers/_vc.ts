import { client } from "..";
import config from "../config";

export const past: {
  oneMinute: [string, string][];
  actual: [string, string][];
} = {
  oneMinute: [],
  actual: [],
} as const;

// Gets the current people in a VC
// excluding people on their own
export async function getCurrentVC() {
  // Compute current
  let inVCrightNow: [string, string][] = [];
  for await (const vcChannel of config.botServer.vcChannels) {
    let channel = await client.channels.fetch(vcChannel);
    if (channel.isVoiceBased()) {
      if (channel.members.size === 1) continue;
      for (const member of channel.members)
        inVCrightNow.push([member[1].id, channel.guild.id]);
    }
  }

  // Don't allow only one person at a time
  if (inVCrightNow.length === 1) return [];

  return inVCrightNow;
}
