import { ColorResolvable, EmbedBuilder, HexColorString } from "discord.js";
import config from "../../config.ts";

export function createEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.embed.color as HexColorString)
    .setTimestamp()
    .setColor(config.embed.color as ColorResolvable);
}
