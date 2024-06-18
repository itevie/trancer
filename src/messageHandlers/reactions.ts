import { HypnoMessageHandler } from "../types/messageHandler";
import { getRandomImposition } from "../util/other";

const handler: HypnoMessageHandler = {
    name: "reactor",
    description: "Reacts to random messages when they match a certain criteria",
    examples: [
        "Responds whenever someone says \"I'm immune\"",
        "Responds to madelief whenever they say \"immune\""
    ],

    handler: async message => {
        const saysImImmune = message.content.match(/((i[’‘']?m?)|(ik)) ?(am|ben)? (fucking|very|really)? ?((imm?une?)|(imm?uu?[mn]?))/gi);
        const saysImmune = message.content.match(/i[mn]*u[mn]e?/gi);
        if (saysImImmune || (saysImmune && message.author.id === "517317886260281344")) {
            await message.react("👀");
            await message.react("🙄");

            message.reply(
                await getRandomImposition(message.author.id)
                + `${Math.random() > 0.6
                    ? "https://media.discordapp.net/attachments/1190056349476868249/1251288463693840404/Lets_See_Who_This_Really_Is_7244.jpg?=&format=webp&width=420&height=556"
                    : ""}
                    `);
        }
    }
}

export default handler;