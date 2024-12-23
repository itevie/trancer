import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "removestatus",
  aliases: ["removehypnostatus"],
  description: "Remove the hypno status from your nickname",
  type: "hypnosis",

  handler: async (message) => {
    if (!message.member.nickname.match(/\([🔴🟢🟡]\)/)) {
      await message.member.setNickname(
        message.member.nickname.replace(/\([🔴🟢🟡]\)/g, "").trim()
      );
      await message.reply(`Removed!`);
    } else {
      await message.reply(
        `It seems you don't have a hypnosis status in your nickname...`
      );
    }
  },
};

export default command;
