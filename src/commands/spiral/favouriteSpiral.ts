import { HypnoCommand } from "../../types/util";
import { addFavouriteSpiral, getUserFavouriteSpirals } from "../../util/actions/userFavouriteSpirals";
import { sentSpirals } from "./spiral";

const command: HypnoCommand = {
    name: "addfavouritespiral",
    aliases: ["afspiral", "afs"],
    description: "Add a spiral to your favourites",
    type: "spirals",

    handler: async (message) => {
        // Check for reference
        if (!message.reference)
            return message.reply(`Please reply to a message where the bot sent a spiral!`);

        // Check if it is valid
        if (!sentSpirals[message.reference.messageId])
            return message.reply(`Sorry! I can't get the spiral from that.`);

        let spiral = sentSpirals[message.reference.messageId];

        // Check if in favourites
        let spirals = await getUserFavouriteSpirals(message.author.id);
        if (spirals.find(x => x.id === spiral.id))
            return message.reply(`You have already favourited that spiral!`);

        // Add spiral
        await addFavouriteSpiral(message.author.id, spiral.id);
        return message.reply(`The spiral with ID **${spiral.id}** has been added to your favourites!`);
    }
};

export default command;