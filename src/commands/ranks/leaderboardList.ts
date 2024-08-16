import { HypnoCommand } from "../../types/command";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "leaderboardlist",
    aliases: ["lbl"],
    type: "ranks",
    description: "Get a list of active leaderboards",

    handler: async (message) => {
        const leaderboards = (await database.all(`SELECT rank_name FROM ranks;`)).map(x => x.rank_name);
        return message.reply(`Here are the leaderboards you can vote on: ${leaderboards.map(x => `**${x}**`).join(", ")}`);
    }
}

export default command;