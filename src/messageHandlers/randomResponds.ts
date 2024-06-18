import { HypnoMessageHandler } from "../types/messageHandler";

const handler: HypnoMessageHandler = {
    name: "randomresponder",
    description: "Reacts to certain messages with random responses",

    handler: message => {
        if (message.content.match(/you['’]?re welcome/gi))
            message.channel.send("smiles");
    }
}

export default handler;