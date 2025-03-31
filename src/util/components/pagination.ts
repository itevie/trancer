import {
  Message,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
} from "discord.js";
import { INTERNAL } from "sqlite3";

interface BasePaginationOptions {
  message: Message;
  embed: EmbedBuilder;
  type: "description" | "field";
  pageLength?: number;
}

interface DescriptionPaginationOptions extends BasePaginationOptions {
  type: "description";
  data?: string[];
  baseDescription?: string;
}

interface FieldPaginationOptions extends BasePaginationOptions {
  type: "field";
  data?: { name: string; value: string }[];
}

type PaginationOptions = DescriptionPaginationOptions | FieldPaginationOptions;

export async function paginate(options: PaginationOptions): Promise<Message> {
  options.embed.setTimestamp(null);
  const pageLength = options.pageLength || 10;
  const oldFooter = options.embed.data.footer?.text || "";
  const user = options.data.findIndex((x) =>
    x.toString().includes(options.message.author.username),
  );

  // Initial
  let currentIndex = 0;
  let modifyEmbed = () => {
    if (options.data.length === 0)
      options.embed.setDescription("*No items to show here!*");
    else if (options.type === "description") {
      options.embed.setDescription(
        (options.baseDescription ? `${options.baseDescription}\n\n` : "") +
          options.data
            .slice(currentIndex, currentIndex + pageLength)
            .join("\n"),
      );
    } else {
      options.embed.setFields(
        options.data.slice(currentIndex, currentIndex + pageLength),
      );
    }
    options.embed.setFooter({
      text: `${oldFooter ? `${oldFooter} - ` : ""}Page ${
        currentIndex / pageLength + 1
      } / ${Math.ceil(options.data.length / pageLength)} (${
        options.data.length
      } items)${user !== -1 ? ` - You are #${user + 1}` : ""}`,
    });
  };
  modifyEmbed();

  // Check if there is any more to add
  if (options.data.length < pageLength + 1)
    return options.message.reply({
      embeds: [options.embed],
    });

  let message = await options.message.reply({
    embeds: [options.embed],
    components: [
      // @ts-ignore
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("first-page")
          .setLabel("<<<")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`page-prev`)
          .setLabel(`<`)
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("page-search")
          .setLabel("🔍️")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`page-next`)
          .setLabel(`>`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("last-page")
          .setLabel(">>>")
          .setStyle(ButtonStyle.Secondary),
      ]),
    ],
  });

  let collector = message.createMessageComponentCollector({});

  collector.on("collect", async (interaction) => {
    if (interaction.user.id !== options.message.author.id)
      return interaction.reply({
        ephemeral: true,
        content: "This isn't for you! Try running the command yourself.",
      });

    if (interaction.customId === "page-search") {
      const modal = new ModalBuilder()
        .setCustomId("page-search-modal")
        .setTitle("Username Search");

      const usernameInput = new TextInputBuilder()
        .setCustomId("page-search-value")
        .setLabel("Query")
        .setPlaceholder("query")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const actionRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          usernameInput,
        );

      modal.addComponents(actionRow);
      await interaction.showModal(modal);

      let result = await interaction.awaitModalSubmit({
        time: 60000,
      });

      let query = result.fields
        .getTextInputValue("page-search-value")
        .toLowerCase();
      let index = options.data.findIndex(
        (x: any) =>
          (typeof x === "object" && x.name.includes(query)) ||
          (typeof x === "object" && x.value.includes(query)) ||
          (typeof x !== "object" &&
            x.replace(/\\\\/g, "").toLowerCase().includes(query)),
      );
      if (index === -1)
        return await result.reply(
          `${interaction.user.username}, sorry, but I couldn't find anything matching your query.`,
        );

      currentIndex = index - (index % pageLength);
      modifyEmbed();

      await message.edit({
        embeds: [options.embed],
      });

      await result.deferUpdate();

      return;
    }

    await interaction.deferUpdate();
    if (interaction.customId === "page-prev") {
      if (currentIndex < pageLength) return;
      currentIndex -= pageLength;
      modifyEmbed();
    } else if (interaction.customId === "page-next") {
      if (currentIndex >= options.data.length - pageLength) return;
      currentIndex += pageLength;
      modifyEmbed();
    } else if (interaction.customId === "first-page") {
      currentIndex = 0;
      modifyEmbed();
    } else if (interaction.customId === "last-page") {
      currentIndex = options.data.length - (options.data.length % pageLength);
      modifyEmbed();
    }

    await message.edit({
      embeds: [options.embed],
    });
  });
}
