import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ id: number }> = {
  name: "deleteconfession",
  description: "Delete a confession you wrote",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "id",
        type: "wholepositivenumber",
        description: "The ID of the confession",
      },
    ],
  },

  handler: async (message, { args }) => {
    const confession = await actions.confessions.get(args.id);
    if (
      confession.user_id !== message.author.id &&
      !message.member.permissions.has("ModerateMembers")
    ) {
      return message.reply(
        `You did not write this confession, and you do not have the moderate members permission`,
      );
    }

    try {
      const channel = (await message.client.channels.fetch(
        confession.channel_id,
      )) as TextChannel;

      if (channel.guild.id !== message.guild.id)
        return message.reply(`That confession was not sent in this server!`);

      try {
        await actions.confessions.delete(confession.id);
        const msg = await channel.messages.fetch(confession.message_id);
        await msg.delete();
        return message.reply(`Deleted the confession!`);
      } catch (e) {
        console.log(e);
        return message.reply(
          `I failed to delete the message containing the confession, but it has been deleted from the database!`,
        );
      }
    } catch (e) {
      console.log(e);
      return message.reply(`Failed to delete confession`);
    }
  },
};

export default command;
