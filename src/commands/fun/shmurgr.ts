import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "shmurgr",
  description: "Give yourself the Shmurgr ping role",
  type: "fun",

  handler: async (message) => {
    await message.member.roles.add("1367572061962240000");
    return message.reply(`You have been given the Shmurgr ping role!`);
  },
};

export default command;
