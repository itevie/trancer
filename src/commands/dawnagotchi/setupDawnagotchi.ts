import { HypnoCommand } from "../../types/command";
import { getDawnagotchi, setupDawnagotchi } from "../../util/actions/dawnagotchi";

const command: HypnoCommand = {
    name: "setupdawnagotchi",
    aliases: ["setupdawn"],
    description: "Setup your new adventure with Dawn!",
    type: "dawnagotchi",

    handler: async (message) => {
        // Check if it is already setup
        let dawnagotchi = await getDawnagotchi(message.author.id);
        if (dawnagotchi)
            return message.reply(`You already have a Dawnagotchi!`);

        // Setup
        await setupDawnagotchi(message.author.id);

        return message.reply(`It has been setup!`);
    }
};

export default command;