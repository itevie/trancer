import config from "../../config";
import { HypnoCommand } from "../../types/command";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { database } from "../../util/database";
import { awardMoneyForCaringForDawn, calculateRequirementFromDate, generateDawnagotchiEmbed } from "../../util/dawnagotchi";

const command: HypnoCommand = {
    name: "play",
    type: "dawnagotchi",
    description: "Play with your Dawn",

    handler: async (message) => {
        // Check if they have a Dawn
        let dawn = await getDawnagotchi(message.author.id);
        if (!dawn) return message.reply(`You don't have a Dawn!`);

        // Check if allowed to feed
        let requirement = calculateRequirementFromDate(dawn.next_play);

        if (requirement >= 100)
            return message.reply(`Your Dawn does not require your attention right now >:(`);

        // Add the stuff
        await database.run(
            `UPDATE dawnagotchi SET next_play = next_play + ? WHERE owner_id = ?`,
            config.dawnagotchi.actions.play.timeAdd,
            message.author.id
        );;

        let money = await awardMoneyForCaringForDawn(dawn);

        // Done
        return message.reply({
            content: money ? `You got **${money}${config.economy.spirals}** ` : "",
            embeds: [
                generateDawnagotchiEmbed(await getDawnagotchi(message.author.id))
            ]
        })

    }
};

export default command;