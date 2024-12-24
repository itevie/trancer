import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  MessageEditOptions,
  MessageReplyOptions,
} from "discord.js";

interface ConfirmActionOptions {
  message: Message<true>;
  callback: () => Promise<MessageEditOptions>;
  embed: EmbedBuilder;
  autoYes?: boolean;
}

export default async function ConfirmAction(
  options: ConfirmActionOptions
): Promise<void> {
  if (options.autoYes) {
    await options.message.reply(
      (await options.callback()) as MessageReplyOptions
    );
    return;
  }

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("deny")
      .setLabel("No")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Yes")
      .setStyle(ButtonStyle.Success)
  );

  const message = await options.message.reply({
    embeds: [options.embed],
    components: [buttonRow as any],
  });

  const result = await message.awaitMessageComponent({
    filter: (i) => i.user.id === options.message.author.id,
  });

  if (result.customId === "confirm")
    await message.edit({
      components: [],
      embeds: [],
      ...(await options.callback()),
    });
  else
    await message.edit({
      content: "Action cancelled.",
      embeds: [],
      components: [],
    });
}
