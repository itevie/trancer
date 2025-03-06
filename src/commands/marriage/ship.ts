import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomNumberFromString } from "../fun/rate";

const command: HypnoCommand<{
  user1: User;
  user2: User;
}> = {
  name: "ship",
  description: "Ship two people together",
  type: "marriage",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user1",
        type: "user",
      },
      {
        name: "user2",
        type: "user",
      },
      {
        name: "user3",
        type: "user",
      },
      {
        name: "user4",
        type: "user",
      },
      {
        name: "user5",
        type: "user",
      },
      {
        name: "user6",
        type: "user",
      },
      {
        name: "user7",
        type: "user",
      },
      {
        name: "user8",
        type: "user",
      },
      {
        name: "user9",
        type: "user",
      },
      {
        name: "user10",
        type: "user",
      },
    ],
  },

  handler: (message, { args }) => {
    let users = Object.entries(args)
      .map((x) => x[1])
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    let shipage = randomNumberFromString(
      users.map((x) => x.username).join("-"),
      0,
      100
    );
    let name = "";
    for (const user of users.slice(0, -1)) {
      let syllable = user.username.match(/^([^aeiou]*[aeiou]+[^aeiou]*)/)[0];
      name += syllable;
    }

    let syllable = users[users.length - 1].username.match(
      /^([^aeiou]*[aeiou]+[^aeiou]*)/
    )[0];
    name += users[users.length - 1].username.slice(syllable.length);

    return message.reply(
      `The ship between ${users
        .map((x) => `**${x.username}**`)
        .join(" and ")} is... **${shipage.toFixed(
        0
      )}% strong**\n\nTheir ship name would be: **${name}**`
    );
  },
};

export default command;
