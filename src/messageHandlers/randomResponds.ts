import { HypnoMessageHandler } from "../types/util";

const handler: HypnoMessageHandler = {
    name: "random-responder",
    description: "Reacts to certain messages with random responses",

    handler: message => {
        if (message.content.match(/(kys)|(kill ?y?o?urself)|(fu?ck ?y?o?u)/i))
            return message.reply(`Hey, that's not very nice! *patpatpat*`);
    }
}

export default handler;