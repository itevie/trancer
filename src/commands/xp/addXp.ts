import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ user: User; amount: number }> = {
  name: "addxp",
  aliases: ["+xp"],
  type: "admin",
  description: "Give a user XP",
  guards: ["bot-owner"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "amount",
        type: "number",
      },
    ],
  },

  handler: async (message, { args }) => {
    await database.run(
      `UPDATE user_data SET xp = xp + ? WHERE user_id = ? AND guild_id = ?`,
      args.amount,
      args.user.id,
      message.guild.id
    );
    return await message.reply(`Updated!`);
  },
};

export default command;
