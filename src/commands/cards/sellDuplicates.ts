import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getAllAquiredCardsFor } from "../../util/actions/cards";
import { addMoneyFor } from "../../util/actions/economy";
import { computeCardPrice, convertAquiredCardsToCards } from "../../util/cards";
import { database } from "../../util/database";

const command: HypnoCommand<{ confirm?: "confirm" }> = {
    name: "sellduplicates",
    description: "Sells all of your duplicate cards",
    aliases: ["selldups"],
    type: "cards",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "confirm",
                type: "confirm",
            }
        ]
    },

    handler: async (message, { args }) => {
        // Collect all the data
        let acards = (await getAllAquiredCardsFor(message.author.id)).filter(x => x.amount > 1);
        if (acards.length === 0)
            return message.reply(`You have no dupllicate cards!`);
        let cards = await convertAquiredCardsToCards(acards);
        let worth = 0;
        let amount = 0;
        for (const acard in acards) {
            worth += computeCardPrice(cards[acard]) * (acards[acard].amount - 1);
            amount += acards[acard].amount - 1;
        }

        // Create the selling cards
        let text = acards.map((v, i) => `**${cards[i].name}** *${cards[i].rarity}* x${v.amount - 1}`).join("\n");
        text = text + `\n\n**${amount}** cards worth: **${worth} ${config.economy.currency}**`;

        // Check if confirm was added
        if (!args.confirm)
            return message.reply(`Please pass the confirm option to sell the following cards:\n\n${text}`);

        // Remove all the cards
        for await (const acard of acards) {
            await database.run(`UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?;`, acard.amount - 1, message.author.id, acard.card_id);
        }

        // Add money 
        await addMoneyFor(message.author.id, worth);

        // Done
        return message.reply(`Success! You sold the following cards:\n\n${text}`);
    }
};

export default command;