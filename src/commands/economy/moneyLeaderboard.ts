import { HypnoCommand } from "../../types/command";
import createLeaderboardFromData from "../../util/createLeaderboard";
import config from "../../config";
import { getAllEconomy } from "../../util/actions/economy";
import * as fs from "fs";
import { checkBadges } from "../../util/badges";

const command: HypnoCommand<{ date?: string }> = {
    name: `moneyleaderboard`,
    aliases: ["moneylb", "ecolb", "elb"],
    description: `See who has the most ${config.economy.currency}`,
    usage: [
        ["$cmd dd-mm-yyyy", "See who gained the most currency since that date (if there is a snapshot for that date)"]
    ],
    type: "economy",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "date",
                type: "string",
                description: `The date of a snapshot to compare against`
            }
        ]
    },

    handler: async (message, { args, serverSettings }) => {
        let data = await getAllEconomy();
        let organised = data.map(x => [x.user_id, x.balance]) as [string, number][];
        let description = `Who has the most ${config.economy.currency}?`;

        checkBadges();

        if (args.date) {
            // Check if correct format
            if (!args.date.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/))
                return message.reply(`Please provide a date in dd-mm-yyyy format.`);

            // Check if exists
            let path = __dirname + `/../../data/ecosnapshots/${args.date}.json`
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

            description = `Who gained the most ${config.economy.currency} since ${args.date}?`;
        }

        return message.reply({
            embeds: [
                (await createLeaderboardFromData(organised, description, config.economy.currency))
                    .setTitle(`Economy Leaderboard`)
                    .setFooter({ text: `Check ${serverSettings.prefix}howtogeteco on how to get more!` })
            ]
        })
    }
};

export default command;