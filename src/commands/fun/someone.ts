import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "someone",
  description: "@someone",
  type: "fun",

  handler: async (message) => {
    let members = Array.from(message.guild.members.cache);
    return message.reply(
      members[Math.floor(Math.random() * members.length)][1].user.username,
    );
  },
};

export default command;
