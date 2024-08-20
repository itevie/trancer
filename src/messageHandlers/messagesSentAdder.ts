import { HypnoMessageHandler } from "../types/messageHandler";
import { addMessageSent } from "../util/actions/userData";
import config from "../config";
import { analyticDatabase } from "../util/analytics";
import { ISqlite } from "sqlite";

const handler: HypnoMessageHandler = {
    name: "message-sent",
    description: "Adds 1 to your total sent messages",

    handler: async (message) => {
        if (config.modules.statistics.enabled && !config.modules.statistics.ignoreChannels.includes(message.channel.id)) {
            addMessageSent(message.author.id, message.guild.id);

            /*// Get words
            let words = message.content.toLowerCase().split(" ").map(x => x.replace(/[^0-9a-z]/g, ""));
            let amounts: { [key: string]: number } = {};
            for (const word of words) {
                if (!amounts[word]) amounts[word] = 0;
                amounts[word]++;
            }

            if (Object.keys(amounts).length !== 0) {
                let queries: [ISqlite.SqlType, any[]][] = [];

                for (const i in amounts) {
                    queries.push(``)
                }
                await analyticDatabase.run()
            }*/
        }
    }
};

export default handler;