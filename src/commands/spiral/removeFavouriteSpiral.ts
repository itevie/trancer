import { HypnoCommand } from "../../types/command";
import { removeFavouriteSpiral } from "../../util/actions/userFavouriteSpirals";

const command: HypnoCommand<{ id: number }> = {
    name: "removefavouritespiral",
    aliases: ["rfs"],
    type: "spirals",
    description: "Remove a favourite spiral",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "id",
                type: "number"
            }
        ]
    },

    handler: async (message, options) => {
        await removeFavouriteSpiral(message.author.id, options.args.id);
        return message.reply(`Removed the spiral from your favourites!`);
    }
};

export default command;