import { HypnoMessageHandler } from "../types/messageHandler";
import { addMessageSent } from "../util/actions/userData";
import config from "../config";

const handler: HypnoMessageHandler = {
    name: "message-sent",
    description: "Adds 1 to your total sent messages",

    handler: (message) => {
        if (config.modules.statistics.enabled && !config.modules.statistics.ignoreChannels.includes(message.channel.id)) {
            addMessageSent(message.author.id, message.guild.id);
        }
    }
};

export default handler;