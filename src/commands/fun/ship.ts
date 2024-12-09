import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomNumberFromString } from "./rate";

const command: HypnoCommand<{ user1: User; user2: User }> = {
  name: "ship",
  description: "Ship two people together",
  type: "fun",

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
    ],
  },

  handler: (message, { args }) => {
    let user1 =
      parseInt(args.user1.id) > parseInt(args.user2.id)
        ? args.user1
        : args.user2;
    let user2 =
      parseInt(args.user1.id) < parseInt(args.user2.id)
        ? args.user1
        : args.user2;

    let shipage = randomNumberFromString(
      `${user1.username}-${user2.username}`,
      0,
      100
    );
    let syllable1 = user1.username.match(/^([^aeiou]*[aeiou]+[^aeiou]*)/)[0];
    let syllable2 = user2.username.match(/^([^aeiou]*[aeiou]+[^aeiou]*)/)[0];
    let name = `${syllable1}${user2.username.slice(syllable2.length)}`;

    return message.reply(
      `The ship between **${user1.username}** and **${
        user2.username
      }** is... **${shipage.toFixed(
        0
      )}% strong**\n\nTheir ship name would be: **${name}**`
    );
  },
};

export default command;
