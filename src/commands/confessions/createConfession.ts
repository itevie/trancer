import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { HypnoCommand, HypnoInteractionCommand } from "../../types/util";
import { units } from "../../util/ms";
import { actions } from "../../util/database";

const command: HypnoCommand<{ confession?: string }> = {
  name: "confess",
  aliases: ["createconfession"],
  type: "fun",
  description: "Create a confession",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "confession",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    if (!serverSettings.confessions_channel_id)
      return message.reply(`This server does not have a confessions channel`);

    await message.delete();

    if (!args.confession) {
      let msg = await message.channel.send({
        content: "Click the button to write your confession!",
        components: [
          // @ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setLabel("Write!")
              .setCustomId("write"),
          ),
        ],
      });

      try {
        let result = await msg.awaitMessageComponent({
          filter: (x) => x.user.id === message.author.id,
        });
        await msg.delete();

        await result.showModal(
          new ModalBuilder()
            .setTitle("Write your confession!")
            .setCustomId("confession-modal")
            .addComponents(
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setLabel("Your Confession")
                  .setCustomId("confession")
                  .setStyle(TextInputStyle.Paragraph)
                  .setMinLength(2)
                  .setMaxLength(2000)
                  .setRequired(true),
              ),
            ),
        );

        let modalResult = await result.awaitModalSubmit({
          time: units.minute * 5,
        });

        await modalResult.deferUpdate();

        args.confession = modalResult.fields.getTextInputValue("confession");
      } catch (e) {
        console.log(e);
        return;
      }
    }

    const channel = (await message.guild.channels.fetch(
      serverSettings.confessions_channel_id,
    )) as TextChannel;
    let confession = await actions.confessions.create(
      args.confession,
      message.author.id,
      channel,
    );
    await message.author.send(
      `Your confession was created in <#${channel.id}>!\nIf you'd like to delete it, click the red delete button, or type \`${serverSettings.prefix}deleteconfession ${confession.id}\``,
    );
  },
};

export default command;
