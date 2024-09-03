import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
    embeds: [
        createEmbed()
            .setTitle("Imposition")
            .setDescription(`The bot has a lot of features with imposition, here you can see them all.`)
            .addFields([
                {
                    name: "Basics",
                    value: "There is an imposition command which can be used on anyone: `$prefiximpo`, using this will send a random piece of imposition "
                        + "for yourself, but if you add something after it, such as: `$prefiximpo axo` it will respond to that person\n\n"
                        + "There is a default set of imposition that can be sent, but users can provide their own."
                },
                {
                    name: "Adding imposition",
                    value: "If you don't like the default set of imposition, you can add your own, when you add at least one of your own, only those will be used\n\n"
                        + "Adding: `$prefixaddimpo (action)` example: `$prefixaddimpo *hugs* `\n"
                        + "Removing: `$prefixremoveimpo (action)` example: `$prefixremoveimpo *hugs*\n"
                        + "Removing all: `$prefixremoveimpo all`"
                },
                {
                    name: "Random Imposition",
                    value: "A channel can be set up to which every so often, a random phantom touch will be sent in the channel.\n"
                        + "This can however, only be set up by admins of the server.\nThe base command is: `$prefiximposet`\n\n"
                        + "Enabling: `$prefixis enable`\n"
                        + "Disabled: `$prefixis disable`\n"
                        + "\nThe defaults are that the bot willa attempt to send a touch every **10 minutes** and it will only success **70%** of the time"
                        + "\nSetting chance: `$prefixis chance (number 0-100)` example: `is chance 50`"
                        + "\nSettings every: `$prefixis every (minutes)` example: `is every 10`"
                }
            ])
    ]
};

export default message;