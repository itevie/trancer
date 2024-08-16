import { client } from "..";
import config from "../config";
import { HypnoMessageHandler } from "../types/messageHandler";
import { addMoneyFor } from "../util/actions/economy";
import { randomFromRange } from "../util/other";

let pastVC: string[] = [];

setInterval(async () => {
    // Compute current
    let inVCrightNow: string[] = [];
    for await (const vcChannel of config.botServer.vcChannels) {
        let channel = await client.channels.fetch(vcChannel);
        if (channel.isVoiceBased()) {
            for (const member of channel.members)
                inVCrightNow.push(member[1].id);
        }
    }

    // Award people who are still in it
    for await (const id of inVCrightNow)
        if (pastVC.includes(id))
            await addMoneyFor(id, randomFromRange(config.economy.vcPayout.min, config.economy.vcPayout.max), "vc");

    // Reset
    pastVC = inVCrightNow;
}, config.economy.vcPayout.limit);

const handler: HypnoMessageHandler = {
    name: "vc-handler",
    description: "This isn't actually a message handler",
    handler: () => { }
};

export default handler;