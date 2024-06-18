import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
    embeds: [
        createEmbed()
            .setTitle("Imposition")
            .setDescription(`The bot has a lot of features with imposition, here you can see them all (note: everything in \`this\` should be prefixed with the server prefix`)
            .addFields([
                {
                    name: "Basics",
                    value: "There is an imposition command which can be used on anyone: `impo`, using this will send a random piece of imposition "
                        + "for yourself, but if you add something after it, such as: `impo axo` it will respond to that person\n\n"
                        + "There is a default set of imposition that can be sent, but users can provide their own."
                },
                {
                    name: "Adding imposition",
                    value: "If you don't like the default set of imposition, you can add your own, when you add at least one of your own, only those will be used\n\n"
                        + "Adding: `addimpo (action)` example: `addimpo *hugs* `\n"
                        + "Removing: `removeimpo (action)` example: `removeimpo *hugs*\n"
                        + "Removing all: `removeimpo all`"
                },
                {
                    name: "Random Imposition",
                    value: "A channel can be set up to which every so often, a random phantom touch will be sent in the channel.\n"
                        + "This can however, only be set up by admins of the server.\nThe base command is: `imposet`\n\n"
                        + "Enabling: `is enable`\n"
                        + "Disabled: `is disable`\n"
                        + "\nThe defaults are that the bot willa attempt to send a touch every **10 minutes** and it will only success **70%** of the time"
                        + "\nSetting chance: `is chance (number 0-100)` example: `is chance 50`"
                        + "\nSettings every: `is every (minutes)` example: `is every 10`"
                }
            ])
    ]
};

export default message;