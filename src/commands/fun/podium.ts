import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { Podium } from "discord-image-generation";
import { client } from "../..";
import { getAllEconomy } from "../../util/actions/economy";
import { actions, database } from "../../util/database";
import { accumlateSortLeaderboardData } from "../../util/createLeaderboard";
import { lbTypes, lbUserDataMap } from "../leaderboards/lb";
import { rankExists } from "../../util/actions/ranks";
import path from "path";
import { readFileSync } from "fs";

const command: HypnoCommand<{
  type: (typeof lbTypes)[number];
  rank?: string;
}> = {
  name: "podium",
  type: "fun",
  description: "Generates a podium image",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "type",
        type: "string",
        oneOf: [...lbTypes],
      },
      {
        name: "rank",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    let data: [string, number][];
    switch (args.type) {
      case "economy":
        data = (await getAllEconomy()).map((x) => [x.user_id, x.balance]) as [
          string,
          number
        ][];
        break;
      case "bumps":
      case "xp":
      case "messages":
      case "vc":
      case "ttt_loses":
      case "ttt_ties":
      case "ttt_wins":
      case "c4_loses":
      case "c4_ties":
      case "c4_wins":
      case "count_ruined":
        data = (await actions.userData.getForServer(message.guild.id)).map(
          (x) => [x.user_id, x[lbUserDataMap[args.type]]]
        ) as [string, number][];
        break;
      case "rank":
        if (!args.rank) return message.reply("Please provide a rank name!");
        if (!(await rankExists(args.rank)))
          return message.reply("That rank does not exist!");
        const dbResults = (await database.all(
          `SELECT * FROM votes WHERE rank_name = (?);`,
          args.rank
        )) as Vote[];
        data = accumlateSortLeaderboardData(dbResults.map((x) => x.votee));
        break;
      default:
        return await message.reply(`This type has not been setup.`);
    }

    let newData = data
      .filter((x) => x[1] !== 0)
      .sort((a, b) => b[1] - a[1])
      .map((x) => x[0]);
    if (newData.length < 3)
      return message.reply(`There was not 3 people in that leaderboard :(`);

    let user1 = await client.users.fetch(newData[0]);
    let user2 = await client.users.fetch(newData[1]);
    let user3 = await client.users.fetch(newData[2]);

    let getAvatar = (user: User) => {
      return (
        user?.displayAvatarURL({
          forceStatic: true,
          extension: "png",
        }) ||
        (readFileSync(
          path.resolve(__dirname, "../../data/no_pfp.png")
        ) as unknown as string)
      );
    };

    let image = await new Podium().getImage(
      getAvatar(user1),
      getAvatar(user2),
      getAvatar(user3),
      user1.username,
      user2.username,
      user3.username
    );
    return message.reply({
      content: `Podium for **${args.type}${
        args.type === "rank" ? ` ${args.rank}` : ""
      }**`,
      files: [new AttachmentBuilder(image).setName("podium.png")],
    });
  },
};

export default command;
