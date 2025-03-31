import { HypnoMessageHandler } from "../types/util";
import config from "../config";
import { addToMemberCount, analyticDatabase } from "../util/analytics";
import { actions } from "../util/database";

let memberCountCache: MemberCount;
const handler: HypnoMessageHandler = {
  name: "message-sent",
  description: "Adds 1 message to the message author's profile (analytical)",

  handler: async (message) => {
    if (config.analytics.enabled) {
      if (!memberCountCache)
        memberCountCache = await analyticDatabase.get<MemberCount>(
          `SELECT * FROM member_count WHERE server_id = ? ORDER BY id DESC LIMIT 1;`,
          message.guild.id,
        );
      if (
        !memberCountCache ||
        memberCountCache.amount !== message.guild.memberCount
      ) {
        await addToMemberCount(message.guild.id, message.guild.memberCount);
        memberCountCache = await analyticDatabase.get<MemberCount>(
          `SELECT * FROM member_count WHERE server_id = ? ORDER BY id DESC LIMIT 1;`,
          message.guild.id,
        );
      }
    }
    if (
      config.modules.statistics.enabled &&
      !config.modules.statistics.ignoreChannels.includes(message.channel.id)
    ) {
      await actions.userData.incrementFor(
        message.author.id,
        message.guild.id,
        "messages_sent",
      );
    }
  },
};

export default handler;
