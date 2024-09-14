import { HypnoMessageHandler } from "../types/util";
import { getRandomImposition } from "../util/other";

const msgs = [
    "blub",
    "blub blub blub",
    "you're a fish",
    "fish fr",
    "pfft \"not a fish\""
];

let image = "https://cdn.discordapp.com/attachments/1257417750444507147/1284493453111197847/YOURE_NOT_IMMUNE_YOURE_A_FISHY_FISH.png?ex=66e6d53f&is=66e583bf&hm=a8e96d17218935f895a2ab878ce78b1bd107fb5c8daccf5e0c0c045e0a3b75d8&";

const handler: HypnoMessageHandler = {
    name: "random-responder",
    description: "Reacts to certain messages with random responses",

    handler: async message => {
        if (message.content.match(/(i'?m)? ?(not?) a? ?fishy?/gi)) {
            message.reply(`${msgs[Math.floor(Math.random() * msgs.length)]} ${await getRandomImposition(message.author.id)}`)
        }
        if (message.content.match(/(kys)|(kill ?y?o?urself)|(fu?ck ?y?o?u)/i))
            return message.reply(`Hey, that's not very nice! *patpatpat*`);
        if (message.content.match(/i'?m im?mune/)) {
            let impo = await getRandomImposition(message.author.id);
            return message.reply(`${impo} ${Math.random() > 0.5 ? image : ""}`);
        }
    }
}

export default handler;