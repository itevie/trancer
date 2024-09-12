import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
    content: "Hello World",
    embeds: [
        createEmbed()
            .setTitle("This is a test embed")
    ]
};

export default message;