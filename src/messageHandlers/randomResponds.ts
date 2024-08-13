import { HypnoMessageHandler } from "../types/messageHandler";

const handler: HypnoMessageHandler = {
    name: "random-responder",
    description: "Reacts to certain messages with random responses",

    handler: message => {
        if (message.content.match(/you['’]?re welcome/gi))
            message.channel.send("smiles");
        else if (message.content.match(/(kys)|(kill ?y?o?urself)/))
            return message.reply(`Hey, that's not very nice!`);
    }
}

export default handler;