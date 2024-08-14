import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { getAllAquiredCardsFor, getCardById } from "../../util/actions/cards";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
    name: "cards",
    type: "cards",
    description: "Get yours or another persons cards",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        // Get details
        let user = args.user ? args.user : message.author;
        let cards = await getAllAquiredCardsFor(user.id);

        // Create embed
        let embed = createEmbed()
            .setTitle(`${user.username}'s cards`);

        // Check if they had any
        if (cards.length === 0)
            embed.setDescription("*No cards :(*");
        else {
            let text: string[] = [];
            for await (const card of cards) {
                let actualCard = await getCardById(card.card_id);
                text.push(`**${actualCard.name}** *${actualCard.rarity}*: ${card.amount}`);
            }
            embed.setDescription(text.join("\n"));
        }

        return message.reply({
            embeds: [
                embed
            ]
        });
    }
};

export default command;