import { HypnoCommand } from "../../types/command";
import { getAllAquiredCards, getCard } from "../../util/actions/cards";
import { generateCardEmbed } from "../../util/cards";

const command: HypnoCommand<{ id: number }> = {
    name: "whohascard",
    type: "cards",
    description: "Check all the people who have a card",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args }) => {
        let card = await getCard(args.id);
        if (!card)
            return message.reply(`A card with that ID does not exist`);

        let aquired = (await getAllAquiredCards()).filter(x => x.card_id === args.id);
        let usernames: string[] = [];
        for await (const a of aquired)
            usernames.push((await message.client.users.fetch(a.user_id)).username);

        return message.reply(`The following people have **${card.name}**:\n\n${usernames.join(", ")}`);
    }
};

export default command;