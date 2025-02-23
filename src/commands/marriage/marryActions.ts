import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database, databaseLogger } from "../../util/database";
import { createEmbed } from "../../util/other";
import ConfirmAction from "../../util/components/Confirm";

export function englishRelationship(type: RelationshipType) {
  return {
    dating: "date",
    married: "partner",
    friends: "friend",
    enemies: "enemy",
    parent: "child",
    worships: "deity",
  }[type];
}

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
      child: "parent",
      worship: "worships",
    }[_c] as RelationshipType;

    if (!type) return;

    if (
      await actions.relationships.exists(message.author.id, args.user.id, type)
    ) {
      return message.reply(
        `**${args.user.username}** is already your **${englishRelationship(
          type
        )}**! ${type === "enemies" ? ":broken_heart:" : ":heart:"}`
      );
    }

    const old = await actions.relationships.current(
      message.author.id,
      args.user.id
    );

    ConfirmAction({
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
      async callback() {
        if (type === "enemies" || type === "friends" || type === "worships") {
          await actions.relationships.set(
            message.author.id,
            args.user.id,
            type
          );

          return {
            embeds: [
              createEmbed()
                .setTitle("Relationship updated!")
                .setDescription(
                  `**${
                    args.user.username
                  }** has been set to your **${englishRelationship(type)}**!` +
                    (old ? `\n\n**${old.type}** :arrow_right: **${type}**` : "")
                ),
            ],
          };
        } else {
          const msg = await message.reply({
            content: `<@${args.user.id}>`,
            embeds: [
              type === "parent"
                ? createEmbed()
                    .setTitle(
                      `${message.author.username} would like to be your parent!`
                    )
                    .setDescription(
                      `**${args.user.username}**, **${message.author.username}** would like to adopt you! What do you say?`
                    )
                : createEmbed()
                    .setTitle(
                      `${message.author.username} has something special to say...`
                    )
                    .setDescription(
                      type === "married"
                        ? `**${message.author.username}** bent down on one knee... and asked: "${args.user.username}, will you marry me?"\n\nSo, what do you say?`
                        : `**${message.author.username}** asked you to be their date, what do you say?`
                    ),
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
                    .setDescription("They said no"),
                ],
              });
            }

            await actions.relationships.set(
              message.author.id,
              args.user.id,
              type
            );

            if (type === "parent") {
              await msg.edit({
                embeds: [
                  createEmbed()
                    .setTitle(`Adoption Report`)
                    .setDescription(
                      `**${message.author.username}** is now the legal (fake legal for legal purposes) guardian of **${args.user.username}**`
                    ),
                ],
                components: [],
              });
              return;
            }

            await msg.edit({
              embeds: [
                createEmbed()
                  .setTitle(`Together forever <3`)
                  .setDescription(`You two are now **${type}** :heart:`),
              ],
              components: [],
            });
          });

          collector.on("end", async (_, reason) => {
            if (reason === "time")
              await msg.edit({
                embeds: [
                  createEmbed()
                    .setTitle("Oopsies...")
                    .setDescription(
                      "They took too long to respond - try again."
                    ),
                ],
                components: [],
              });
          });

          if (!old) return null;

          return {
            embeds: [],
            content: `Please wait for the person's response in the following message!`,
          };
        }
      },
    });
  },
};

export default command;
