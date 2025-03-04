import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database, databaseLogger } from "../../util/database";
import { createEmbed } from "../../util/other";
import ConfirmAction from "../../util/components/Confirm";
import { englishifyRelationship } from "../../util/marriage";

const command: HypnoCommand<{ user: User }> = {
  name: "_marry_actions",
  description: "Commands to do with changing relationships",
  type: "marriage",
  aliases: [
    "marry",
    "wife",
    "husband",
    "date",
    "enemy",
    "friend",
    "adopt",
    "parent",
    "child",
    "worship",
    "own",
    "owner",
  ],
  eachAliasIsItsOwnCommand: true,

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
        description: "The user you want to marry",
      },
    ],
  },

  handler: async (message, { args, command: _c }) => {
    if (_c === "_marry_actions") {
      return message.reply(
        `Please type one of the following: ${command.aliases.join(", ")}`
      );
    }

    if (
      !(await actions.userData.getFor(args.user.id, message.guild.id))
        .relationships
    )
      return message.reply(
        `**${args.user.username}** has disabled relationships`
      );

    const type: RelationshipType = {
      date: "dating",
      marry: "married",
      wife: "married",
      husband: "married",
      friend: "friends",
      enemy: "enemies",
      adopt: "parent",
      parent: "parent",
      own: "owner",
      owner: "owner",
      child: "parent",
      worship: "worships",
    }[_c] as RelationshipType;

    if (!type) return;

    if (
      await actions.relationships.exists(message.author.id, args.user.id, type)
    ) {
      return message.reply(
        `**${args.user.username}** is already your **${englishifyRelationship(
          type
        )}**! ${type === "enemies" ? ":broken_heart:" : ":heart:"}`
      );
    }

    /*ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Are you sure?")
        .setDescription(
          `Are you sure you want to make **${
            args.user.username
          }** your **${englishRelationship(
            type
          )}**? They are already your **${englishRelationship(old?.type)}**!`
        ),
      autoYes: !old,
      async callback() {*/
    if (type === "enemies" || type === "friends" || type === "worships") {
      await actions.relationships.add(message.author.id, args.user.id, type);

      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Relationship updated!")
            .setDescription(
              `**${
                args.user.username
              }** has been set to your **${englishifyRelationship(type)}**!`
            ),
        ],
      });
    } else {
      const msg = await message.reply({
        content: `<@${args.user.id}>`,
        embeds: [
          {
            parent: createEmbed()
              .setTitle(
                `${message.author.username} would like to be your parent!`
              )
              .setDescription(
                `**${args.user.username}**, **${message.author.username}** would like to adopt you! What do you say?`
              ),
            owner: createEmbed()
              .setTitle(
                `${message.author.username} would like you to be their pet!`
              )
              .setDescription(
                `**${message.author.username}** is asking to be your owner, **${args.user.username}**, what do you say?`
              ),
            married: createEmbed()
              .setTitle(
                `${message.author.username} has something special to say...`
              )
              .setDescription(
                `**${message.author.username}** bent down on one knee... and asked: "${args.user.username}, will you marry me?"\n\nSo, what do you say?`
              ),
            date: createEmbed()
              .setTitle(
                `${message.author.username} has something special to say...`
              )
              .setDescription(
                `**${message.author.username}** asked you to be their date, what do you say?`
              ),
          }[type],
        ],

        components: [
          // @ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("deny")
              .setLabel("No")
              .setEmoji("💔")
              .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
              .setCustomId("accept")
              .setLabel("Yes")
              .setEmoji("❤️")
              .setStyle(ButtonStyle.Success)
          ),
        ],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === args.user.id,
        time: 1000 * 60 * 30,
      });

      collector.on("collect", async (i) => {
        collector.stop();

        if (i.customId === "deny") {
          return await msg.edit({
            embeds: [
              createEmbed()
                .setTitle("So sad...")
                .setDescription(
                  "Sorry to break it to you... but they said no :broken_heart:"
                ),
            ],
            components: [],
          });
        }

        await actions.relationships.add(message.author.id, args.user.id, type);

        const title = {
          parent: "Adoption Report",
          owner: "Pet Adoption Report",
          dating: "The beginning of something great",
          married: "Together forever",
        }[type];

        const description = {
          parent: `**${message.author.username}** is now the legal (fake legal for legal purposes) guardian of **${args.user.username}**`,
          owner: `**${message.author.username}** is now the owner of **${args.user.username}**`,
          married: `You two are now married together forever <3`,
          dating: "You two are now dating! How sweet! <3",
        }[type];

        await msg.edit({
          embeds: [createEmbed().setTitle(title).setDescription(description)],
          components: [],
        });
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time")
          await msg.edit({
            embeds: [
              createEmbed()
                .setTitle("Oopsies...")
                .setDescription("They took too long to respond - try again."),
            ],
            components: [],
          });
      });
    }
    //},
    //});
  },
};

export default command;
