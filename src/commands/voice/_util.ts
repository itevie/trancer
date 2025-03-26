import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import { REST, VoiceBasedChannel } from "discord.js";
import { Readable } from "stream";

export const voiceManagers: Map<string, VoiceManager> = new Map();
export class VoiceManager {
  private connection: VoiceConnection;
  constructor(public channel: VoiceBasedChannel) {}

  public join() {
    this.connection = joinVoiceChannel({
      channelId: this.channel.id,
      guildId: this.channel.guild.id,
      // @ts-ignore
      adapterCreator: this.channel.guild.voiceAdapterCreator,
    });
  }

  public leave() {
    if (!this.connection)
      throw new Error("Tried to leave a voice channel that the bot is not in!");
    this.connection.destroy();
  }

  public play(stream: Readable) {
    const resource = createAudioResource(stream);
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    player.play(resource);
    this.connection.subscribe(player);
  }
}

export function createVoiceManager(channel: VoiceBasedChannel): VoiceManager {
  if (voiceManagers.get(channel.id)) return voiceManagers.get(channel.id);

  const manager = new VoiceManager(channel);
  voiceManagers.set(channel.id, manager);
  return manager;
}
