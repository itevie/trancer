import { HypnoMessageHandler } from "../types/util";
import config from "../config";
import { randomFromRange } from "../util/other";
import { addMoneyFor } from "../util/actions/economy";
import { addToMemberCount, analyticDatabase } from "../util/analytics";

const timeouts: { [key: string]: number } = {};
let memberCountCache: MemberCount;

const handler: HypnoMessageHandler = {
    name: "economy",
    description: "Handles message economy",
    noCommands: true,

    handler: async (message) => {
        if (config.analytics.enabled) {
            if (!memberCountCache)
                memberCountCache = await analyticDatabase.get<MemberCount>(`SELECT * FROM member_count WHERE server_id = ? ORDER BY id DESC LIMIT 1;`, message.guild.id);
            if (!memberCountCache || memberCountCache.amount !== message.guild.memberCount) {
                await addToMemberCount(message.guild.id, message.guild.memberCount);
                memberCountCache = await analyticDatabase.get<MemberCount>(`SELECT * FROM member_count WHERE server_id = ? ORDER BY id DESC LIMIT 1;`, message.guild.id);
            }
        }

        if (message.guild.id !== config.botServer.id) return;

        if (config.economy.messagePayout.limit - (Date.now() - (timeouts[message.author.id] ?? 0)) < 0) {
            let money = randomFromRange(config.economy.messagePayout.min, config.economy.messagePayout.max);
            await addMoneyFor(message.author.id, money, "messaging");
            timeouts[message.author.id] = Date.now();
        }
    }
};

export default handler;