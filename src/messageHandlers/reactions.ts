import { HypnoMessageHandler } from "../types/messageHandler";
import { getRandomImposition } from "../util/other";

const handler: HypnoMessageHandler = {
    handler: async message => {
        const saysImImmune = message.content.match(/((i[’‘']?m?)|(ik)) ?(am|ben)? (fucking|very|really)? ?((imm?une?)|(imm?uu?[mn]?))/gi);
        const saysImmune = message.content.match(/imm?une?/gi);
        if (saysImImmune || (saysImmune && message.author.id === "517317886260281344")) {
            await message.react("👀");
            await message.react("🙄");

            message.reply(getRandomImposition(message.author.id));
        }
    }
}

export default handler;