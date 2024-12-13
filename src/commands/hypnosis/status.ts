import { HypnoCommand } from "../../types/util";

const typeMap = {
  red: "🔴",
  r: "🔴",
  yellow: "🟡",
  orange: "🟡",
  y: "🟡",
  o: "🟡",
  green: "🟢",
  g: "🟢",
} as const;

const command: HypnoCommand<{ type: keyof typeof typeMap }> = {
  name: "setstatus",
  aliases: ["sethypnostatus", "hypnostatus", "settrafficlight", "trafficlight"],
  description: "Puts a hypnosis traffic light in your profile.",
  type: "hypnosis",
  ignore: true,

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "type",
        type: "string",
        oneOf: Object.keys(typeMap),
      },
    ],
  },

  handler: async (message, { args }) => {
    let currentNickname = message.member.nickname ?? message.author.displayName;

    // Check if the user already has the status
    if (currentNickname.match(/\([🔴🟢🟡]\)/)) {
      currentNickname = currentNickname.replace(/\([🔴🟢🟡]\)/, "");
    }

    // Check length
    if (currentNickname.length > 32)
      return await message.reply(
        `Oops! Your nickname is too long, and adding a status would exceed 32 characters long.`
      );

    // Check if user has permission to change it
    if (!message.guild.members.me.permissions.has("ChangeNickname"))
      return await message.reply(
        `Oops! I don't have permission to change your nickname in this server.`
      );

    await message.member.setNickname(
      currentNickname.trim() + `(${typeMap[args.type]})`
    );
  },
};

export default command;
