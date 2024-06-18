import { HypnoCommand } from "../../types/command";
import { getServerSettings } from "../../util/actions/settings";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "removeimposition",
    aliases: ["remi", "removeimpo", "removei"],
    type: "imposition",
    description: "Remove one of the imposition's the bot uses on you",
    usage: [
        ["$cmd all", "Delete all your imposition"]
    ],

    handler: async (message, args) => {
        const what = args.join(" ");

        // Check if user wants to remove it all
        if (args[0] === "all") {
            const serverSettings = await getServerSettings(message.guild.id);

            // Get confirm
            if (args[1] !== "confirm")
                return message.reply(`Dangerous action! This will delete ***ALL*** your imposition, type \`${serverSettings.prefix}removeimposition all confirm\` to do it.`)

            // Delete them
            await database.run(`DELETE FROM user_imposition WHERE user_id = (?);`, message.author.id);
            return message.reply(`Deleted all! :cyclone:`);
        }

        // Check if user has it
        if (!await database.get(`SELECT * FROM user_imposition WHERE user_id = (?) AND what = (?)`, message.author.id, what))
            return message.reply(`You do not have that imposition registered!`);

        // Delete it
        await database.run(`DELETE FROM user_imposition WHERE user_id = (?) AND what = (?);`, message.author.id, what);
        return message.reply(`Deleted! :cyclone:`);
    }
}

export default command;