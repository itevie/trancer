import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createRating } from "./rate";

const command: HypnoCommand<{ name: string }> = {
  name: "pinrating",
  aliases: ["unpinrating"],
  eachAliasIsItsOwnCommand: true,
  description: "Pins a rating to your profile",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "name",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if it already exists
    if (
      await database.get(
        "SELECT 1 FROM pinned_ratings WHERE user_id = ? AND rating = ?;",
        message.author.id,
        args.name
      )
    ) {
      await database.run(
        "DELETE FROM pinned_ratings WHERE user_id = ? AND rating = ?;",
        message.author.id,
        args.name
      );
      return await message.reply(
        `Deleted the **${args.name}** rating from your profile!`
      );
    }

    await database.run(
      "INSERT INTO pinned_ratings (user_id, rating) VALUES (?, ?)",
      message.author.id,
      args.name
    );
    return await message.reply(
      `Pinned rating **${args.name}** to your profile (**${createRating(
        message.author.username,
        args.name
      ).toFixed(0)}**%)`
    );
  },
};

export default command;
