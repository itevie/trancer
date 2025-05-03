import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Interaction,
  Message,
} from "discord.js";
import { units } from "../ms";

interface ButtonedButton {
  label: string;
  callback: (i: ButtonInteraction) => Promise<void>;
  type?: ButtonStyle;
}

interface ButtonedOptions {
  message: Message<true>;
  options: Parameters<Message<true>["reply"]>[0];
  buttons: { [key: string]: ButtonedButton };
}

export default async function Buttoned(
  options: ButtonedOptions,
): Promise<Message<true>> {
  if (typeof options.options === "string")
    options.options = { content: options.options };
  const msg = await options.message.reply({
    ...(options.options as any),
    components: [
      ...(options.message.components || []),
      // @ts-ignore
      new ActionRowBuilder().addComponents(
        ...Object.entries(options.buttons).map((x) =>
          new ButtonBuilder()
            .setCustomId(x[0])
            .setStyle(x[1].type || ButtonStyle.Primary)
            .setLabel(x[1].label),
        ),
      ),
    ],
  });

  const collector = msg.createMessageComponentCollector({
    filter: (i) => i.user.id === options.message.author.id,
    time: units.minute,
  });

  collector.on("collect", async (i) => {
    await options.buttons[i.customId].callback(i as any);
  });

  collector.on("end", async () => {
    await msg.edit({ components: [] });
  });

  return msg;
}
