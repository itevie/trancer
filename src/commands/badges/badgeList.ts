import { HypnoCommand } from "../../types/command";
import badges, { formatBadges } from "../../util/badges";

const command: HypnoCommand = {
    name: "badgelist",
    aliases: ["badgel", "bl"],
    description: "Get a list of badges",
    type: "badges",

    handler: (message, args) => {
        let badgeText = formatBadges(badges);

        return message.reply(`Here are the badges:\n\n${badgeText.join("\n")}`)
    }
};

export default command;