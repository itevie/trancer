import { TextChannel, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { messageDeletes } from "../../events/messageDelete";
import { createMessageRefEmbed, sendProxyMessage } from "../../util/proxy";

const command: HypnoCommand<{ user: User }> = {
  name: "snipe",
  description: "Snipe a user's deleted message",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message) => {
    const _message = messageDeletes.get(
      `${message.author.id}-${message.channel.id}`,
    );
    if (!_message) return message.reply(`Nothing to snipe!`);

    await sendProxyMessage(message.channel as TextChannel, {
      content: _message.content,
      username:
        _message.member.displayName ||
        _message.author.displayName ||
        _message.author.username,
      avatarURL: _message.author.displayAvatarURL(),
      files: _message.attachments.map((x) => x.proxyURL),
      embeds: _message.reference
        ? [createMessageRefEmbed(await _message.fetchReference())]
        : [],
    });
  },
};

export default command;
