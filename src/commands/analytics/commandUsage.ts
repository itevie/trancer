import { HypnoCommand } from "../../types/util";
import { getAllCommandUsage } from "../../util/analytics";
import createLeaderboardFromData from "../../util/createLeaderboard";

const command: HypnoCommand = {
    name: "commandusage",
    aliases: ["cmdusage", "cmdu"],
    description: `Get the most used commands`,
    type: "analytics",

    handler: async (message) => {
        let usages = (await getAllCommandUsage()).map(x => [x.command_name, x.used]) as [string, number][];

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(usages, "What commands have been used the most", "times", true))
                    .setTitle("Command Usage")
            ]
        })
    }
};

export default command;