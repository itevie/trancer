import { HypnoCommand } from "../../types/command";
import createLeaderboardFromData from "../../util/createLeaderboard";
import config from "../../config.json";
import { getAllEconomy } from "../../util/actions/economy";
import * as fs from "fs";

const command: HypnoCommand = {
    name: `moneyleaderboard`,
    aliases: ["moneylb", "ecolb", "elb"],
    description: `See who has the most ${config.economy.currency}`,
    usage: [
        ["$cmd dd-mm-yyyy", "See who gained the most currency since that date (if there is a snapshot for that date)"]
    ],
    type: "economy",

    handler: async (message, args, options) => {
        let data = await getAllEconomy();
        let organised = data.map(x => [x.user_id, x.balance]) as [string, number][];
        let description = `Who has the most ${config.economy.currency}?`;

        if (args[0]) {
            // Check if correct format
            if (!args[0].match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/))
                return message.reply(`Please provide a date in dd-mm-yyyy format.`);

            // Check if exists
            let path = __dirname + `/../../data/ecosnapshots/${args[0]}.json`
            if (!fs.existsSync(path))
                return message.reply(`A snapshot at that date does not exist :(`);

            // Load it
            let oldData = JSON.parse(fs.readFileSync(path, "utf-8")) as { data: Economy[] };
            organised = organised.map(
                x => [
                    x[0],
                    x[1] - (
                        oldData.data.find(
                            y => y.user_id == x[0]
                        )?.balance ?? 0
                    )
                ]
            );

            description = `Who gained the most ${config.economy.currency} since ${args[0]}?`;
        }

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(organised, description, config.economy.currency))
                    .setTitle(`Economy Leaderboard`)
                    .setFooter({ text: `Check ${options.serverSettings.prefix}howtogeteco on how to get more!` })
            ]
        })
    }
};

export default command;