import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { database } from "../../util/database";
import { calculateRequirementFromDate } from "../../util/dawnagotchi";

const command: HypnoCommand = {
    name: "feed2",
    type: "dawnagotchi",
    description: "Feed your Dawn",

    handler: async (message) => {
        // Check if they have a Dawn
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You don't have a Dawn!`);

        // Check if allowed to feed
        let requirement = calculateRequirementFromDate(dawn.next_feed);
        if (requirement <= 100)
            return message.reply(`Your Dawn is not hungry!`);

        // Add the stuff
        await database.run(
            `UPDATE dawnagotchi SET next_feed = ? WHERE owner_id = ?`,
            Date.now() + config.dawnagotchi.actions.feed.timeAdd,
            message.author.id
        );

    }
};

export default command;