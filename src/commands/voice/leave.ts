import { HypnoCommand } from "../../types/util";
import { createVoiceManager, voiceManagers } from "./_util";

const command: HypnoCommand = {
  name: "leave",
  type: "voice",
  description: "Make the bot leave your voice call",

  handler: (message) => {
    if (!message.member.voice.channel)
      return message.reply("You are not in a voice channel");

    const manager = voiceManagers.get(message.member.voice.channel.id);
    if (!manager) return message.reply("I am not in your voice channel!");

    manager.leave();
    message.react(`👍`);
  },
};

export default command;
