import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "reloadcache",
  aliases: ["lcache", "loadcache", "cache", "rcache"],
  description: "Reloads the cache for your server",
  type: "help",

  handler: async (message, { args }) => {
    const members = await message.guild.members.fetch();
    return message.reply(
      `🧑 Loaded **${members.size}** members!\nℹ️ Other commands should now show the latest information.`,
    );
  },
};

export default command;
