import { HypnoCommand } from "../../types/util";
import { createVoiceManager } from "./_util";

const command: HypnoCommand = {
  name: "join",
  type: "voice",
  description: "Make the bot join your voice call",

  handler: (message) => {
    if (!message.member.voice.channel)
      return message.reply("You are not in a voice channel");

    const manager = createVoiceManager(message.member.voice.channel);
    manager.join();
    message.react(`👍`);
  },
};

export default command;
