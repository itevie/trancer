import { HypnoMessageHandler } from "../types/messageHandler";

const handler: HypnoMessageHandler = {
    handler: message => {
        if (message.content.match(/you['’]?re welcome/gi))
            message.channel.send("smiles");
    }
}

export default handler;