import { client } from "..";
import { HypnoMessageHandler } from "../types/messageHandler";
import { getServerSettings } from "../util/actions/settings";

const mentionRegex = `(<@${client.user.id}>)|(hypno ?helper)`;
const howAreYou = `(h(ow)? ?a?re? ?y?ou?) ?(feeling|doing)?`;

const howAreYouResponds = {
    good: [
        "I'm doing great! :cyclone:",
        "I'm good! And you? :)",
        "I'm alright, how's your day going?"
    ],
    bad: [
        "Not good...",
        "Bad... what about you...?",
        "I dunno...",
        "I'm very lonley... what about you?"
    ],
    excellent: [
        "I'm amazing, thank you very much! :)",
        "Omg... I'm doing so good.. thanks for asking",
        "Great!!! What about you???"
    ]
}

let commandsUsed: number[] = [];
let thresholds = {
    good: 5,
    excellent: 15,
};

const handler: HypnoMessageHandler = {
    name: "conversational",
    description: "Bot will talk back when spoken to, i.e., asking the bot \"How are you\"",

    handler: async message => {
        // Check to add to commandsUsed
        const settings = await getServerSettings(message.guild.id);
        if (message.content.startsWith(settings.prefix)) commandsUsed.push(Date.now());

        let isTalkingToBot = false;

        // Calculate whether or not the user is talking to the bot
        if (message.content.match(new RegExp(`^(${mentionRegex})`, "i")))
            isTalkingToBot = true;
        else if (message.reference && (await message.fetchReference()).author.id === client.user.id)
            isTalkingToBot = true;
        if (!isTalkingToBot) return;

        commandsUsed = commandsUsed.filter(x => (1000 * 60 * 60) - (Date.now() - x) > 0);

        // Check for "how are you"'s
        if (message.content.match(new RegExp(howAreYou, "gi"))) {
            let result: "good" | "excellent" | "bad" = "bad";
            if (commandsUsed.length >= thresholds.good)
                result = "good";
            if (commandsUsed.length >= thresholds.excellent)
                result = "excellent";

            return message.reply(
                howAreYouResponds[result][Math.floor(Math.random() * howAreYouResponds[result].length)]
            );
        }
    }
}

export default handler;
