import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
    content: "Test",
    embeds: [
        createEmbed()
    ]
};

export default message;