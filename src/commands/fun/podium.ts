import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import { Podium } from "discord-image-generation";
import { client } from "../..";
import { getAllEconomy } from "../../util/actions/economy";
import { database } from "../../util/database";
import { accumlateSortLeaderboardData } from "../../util/createLeaderboard";

const command: HypnoCommand<{
  type: "economy" | "bumps" | "xp" | "messages" | "vc" | "rank";
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
        oneOf: ["economy", "bumps", "xp", "messages", "vc", "rank"],
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
      case "bumps":
        data = (await getAllGuildsUserData(message.guild.id)).map((x) => [
          x.user_id,
          x.bumps,
        ]) as [string, number][];
        break;
      case "xp":
        data = (await getAllGuildsUserData(message.guild.id)).map((x) => [
          x.user_id,
          x.xp,
        ]) as [string, number][];
        break;
      case "economy":
        data = (await getAllEconomy()).map((x) => [x.user_id, x.balance]) as [
          string,
          number
        ][];
        break;
      case "messages":
        data = (await getAllGuildsUserData(message.guild.id)).map((x) => [
          x.user_id,
          x.messages_sent,
        ]) as [string, number][];
        break;
      case "vc":
        data = (await getAllGuildsUserData(message.guild.id)).map((x) => [
          x.user_id,
          x.vc_time,
        ]) as [string, number][];
        break;
      case "rank":
        if (!args.rank) return message.reply("Please provide a rank name!");
        const dbResults = (await database.all(
          `SELECT * FROM votes WHERE rank_name = (?);`,
          args.rank
        )) as Vote[];
        data = accumlateSortLeaderboardData(dbResults.map((x) => x.votee));
        break;
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
      return user.displayAvatarURL({
        forceStatic: true,
        extension: "png",
      });
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
      content: `Podium for **${args.type}**`,
      files: [new AttachmentBuilder(image).setName("podium.png")],
    });
  },
};

export default command;
