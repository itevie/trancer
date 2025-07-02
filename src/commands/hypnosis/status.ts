import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import statusThemes from "./_util";

const typeMap = {
  red: "red",
  r: "red",
  yellow: "orange",
  orange: "orange",
  y: "orange",
  o: "orange",
  green: "green",
  g: "green",
} as const;

const dbMap = {
  red: "red",
  r: "red",
  yellow: "yellow",
  orange: "yellow",
  y: "yellow",
  o: "yellow",
  green: "green",
  g: "green",
} as const;

const command: HypnoCommand<{
  type: keyof typeof typeMap;
  noNickname?: boolean;
}> = {
  name: "setstatus",
  aliases: ["sethypnostatus", "hypnostatus", "settrafficlight", "trafficlight"],
  description: "Puts a hypnosis traffic light in your profile.",
  type: "hypnosis",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "type",
        type: "string",
        oneOf: Object.keys(typeMap),
      },
      {
        name: "noNickname",
        type: "boolean",
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const emojis = statusThemes[serverSettings.status_theme];

    await database.run(
      `UPDATE user_data SET hypno_status = ? WHERE user_id = ?;`,
      dbMap[args.type],
      message.author.id,
    );

    if (!args.noNickname) {
      let currentNickname =
        message.member.nickname ?? message.author.displayName;

      // Check if the user already has the status
      if (currentNickname.match(/\(\p{Emoji}\)/u)) {
        currentNickname = currentNickname.replace(/\(\p{Emoji}\)/u, "");
      }

      let nickname =
        currentNickname.trim() + ` (${emojis[typeMap[args.type]]})`;
      // Check length
      if (nickname.length >= 32)
        return await message.reply(
          `Oops! Your nickname is too long, and adding a status would exceed 32 characters long.`,
        );

      // Check if user has permission to change it
      if (!message.guild.members.me.permissions.has("ChangeNickname"))
        return await message.reply(
          `Oops! I don't have permission to change your nickname in this server.`,
        );

      if (
        message.member.roles.highest.position >
        message.guild.members.me.roles.highest.position
      )
        return {
          content:
            "I couldn't change your nickname as your role is higher than mine!",
        };

      if (message.member.user.id === message.guild.ownerId)
        return {
          content: `Due to Discord limitations, I can't change your nickname as you are the owner of the server.`,
        };

      try {
        await message.member.setNickname(nickname);
      } catch (e) {
        return await message.reply(
          `Oops! I couldn't change your nickname: ${e.message}`,
        );
      }
    }

    return await message.reply(
      `Updated your status to **${typeMap[args.type]}**`,
    );
  },
};

export default command;
