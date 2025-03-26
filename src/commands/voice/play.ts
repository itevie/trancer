import { HypnoCommand } from "../../types/util";
import { createVoiceManager, voiceManagers } from "./_util";
import ytdl from "ytdl-core";

const command: HypnoCommand<{ url: string }> = {
  name: "playyt",
  type: "voice",
  description: "Make the bot leave your voice call",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "url",
        type: "string",
        description: "The YouTube URL to play",
      },
    ],
  },

  handler: (message, { args }) => {
    return message.reply(`This does not work atm`);
    if (!message.member.voice.channel)
      return message.reply("You are not in a voice channel");

    const manager = voiceManagers.get(message.member.voice.channel.id);
    if (!manager) return message.reply("I am not in your voice channel!");

    const stream = ytdl(args.url, { filter: "audioonly" });
    manager.play(stream);
    message.react(`👍`);
  },
};

export default command;
