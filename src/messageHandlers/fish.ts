import { HypnoMessageHandler } from "../types/messageHandler";
import { getRandomImposition } from "../util/other";

const msgs = [
    "blub",
    "blub blub blub",
    "you're a fish",
    "fish fr",
    "pfft \"not a fish\""
];

const handler: HypnoMessageHandler = {
    name: "fish",
    description: "Calls people a fish when they say they are not a fish",

    handler: async message => {
        if (message.content.match(/(i'?m)? ?(not?) a? ?fishy?/gi)) {
            message.reply(`${msgs[Math.floor(Math.random() * msgs.length)]} ${await getRandomImposition(message.author.id)}`)
        }
    }
}

export default handler;