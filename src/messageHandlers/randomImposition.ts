import { HypnoMessageHandler } from "../types/messageHandler";
import { getImposition } from "../util/actions/imposition";
import { getRandomImpositionFromFile } from "../util/other";

const randomImposition: { [key: string]: number } = {};

const handler: HypnoMessageHandler = {
    name: "random-imposition-sender",
    description: "Sends random imposition in the current channel every so often",
    handler: async (message) => {
        // Check random impo
        const imposition = await getImposition(message.channel.id);
        if (imposition?.is_enabled) {
            // Check if not set
            if (!randomImposition[message.channel.id])
                randomImposition[message.channel.id] = 0;

            // Check if should try send
            if (randomImposition[message.channel.id] - (Date.now() - imposition.every * (1000 * 60)) < 0) {
                if (Math.random() < (imposition.chance / 100)) {
                    await message.channel.send(getRandomImpositionFromFile());
                }
            }

            randomImposition[message.channel.id] = Date.now();
        }
    }
}

export default handler;