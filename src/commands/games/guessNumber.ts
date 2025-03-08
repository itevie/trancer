import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed, randomFromRange } from "../../util/other";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/language";
import { actions } from "../../util/database";

export const guessNumberGames: { [key: string]: boolean } = {};

const command: HypnoCommand<{ cancel?: string }> = {
  name: "guessnumber",
  type: "games",
  description: `You have 3 guesses to guess the bot's number to gain some ${ecoConfig.currency}`,

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "cancel",
        type: "string",
        mustBe: "cancel",
        description: `Add this if you want to cancel a previous game`,
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    let cancelGame = async () => {
      // Check if penalty
      if (guessNumberGames[message.author.id]) {
        await actions.eco.removeMoneyFor(message.author.id, 15, true);
        delete guessNumberGames[message.author.id];
        return message.reply(
          `The game was cancelled. But because you played in the last game and have now cancelled it, you lost ${currency(
            15
          )}`
        );
      }
      delete guessNumberGames[message.author.id];
      return message.reply(`Game cancelled!`);
    };

    // Check if they want to cancel
    if (args.cancel)
      if (!(message.author.id in guessNumberGames))
        return message.reply(`You do not have a game!`);
      else return cancelGame();

    // Check if they are already in a game
    if (message.author.id in guessNumberGames)
      return message.reply(
        `You already have a game of number guessing! Run \`${serverSettings.prefix}guessnumber cancel\` to cancel it.`
      );
    guessNumberGames[message.author.id] = false;

    let buttons: ButtonBuilder[] = [];
    let botsNumber = randomFromRange(0, 10);
    let guessed = 0;

    // Generate buttons
    for (let i = 0; i != 11; i++) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`guessnumber-${i}`)
          .setLabel(`${i}`)
          .setStyle(ButtonStyle.Primary)
      );
    }

    buttons.push(
      new ButtonBuilder()
        .setCustomId(`guessnumber-cancel`)
        .setLabel(`X`)
        .setStyle(ButtonStyle.Danger)
    );

    // Function to turn the buttons into 3 action rows
    let generateActionRow: () => ActionRowBuilder[] = () => {
      return [
        new ActionRowBuilder().addComponents(...buttons.slice(0, 3)),
        new ActionRowBuilder().addComponents(...buttons.slice(3, 6)),
        new ActionRowBuilder().addComponents(...buttons.slice(6, 9)),
        new ActionRowBuilder().addComponents(...buttons.slice(9, 12)),
      ];
    };

    let baseDescription = `I have a number from **0 to 10**, you have 3 tries to guess it correct to win ${ecoConfig.currency}!`;

    // Create message
    let botMsg = await message.reply({
      embeds: [
        createEmbed().setTitle(`Guess Number`).setDescription(baseDescription),
      ],
      // @ts-ignore
      components: [...generateActionRow()],
    });

    // Create collector
    const collector = botMsg.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id,
    });
    let isProcessing = false;

    // Listen for updates
    collector.on("collect", async (interaction) => {
      if (isProcessing)
        return interaction.reply({
          ephemeral: true,
          content: `I'm thinking... please wait...`,
        });
      isProcessing = true;

      // Check if cancel
      if (interaction.customId === `guessnumber-cancel`) {
        collector.stop();
        isProcessing = false;
        await cancelGame();
        return;
      }

      await interaction.deferUpdate();

      let number = parseInt(interaction.customId.match(/[0-9]+/)[0]);

      // Update buttons
      buttons[number].setDisabled(true);
      await botMsg.edit({
        // @ts-ignore
        components: [...generateActionRow()],
      });

      let updateMessage = async (message: string) => {
        await botMsg.edit({
          embeds: [
            createEmbed()
              .setTitle(`Guess Number`)
              .setDescription(baseDescription + `\n\n${message}`),
          ],
        });
      };

      // Check if correct number
      if (number === botsNumber) {
        collector.stop();

        // Calculate win
        let baseReward = randomFromRange(
          ecoConfig.payouts.guessNumber.min,
          ecoConfig.payouts.guessNumber.max
        );
        let multipliedReward = baseReward * (3 - guessed);

        // Give money
        await actions.eco.addMoneyFor(
          message.author.id,
          multipliedReward,
          "gambling"
        );
        await message.reply(
          `Welldone! You guessed the number **${botsNumber}** in **${guessed}** guesses! You got ${currency(
            multipliedReward
          )}`
        );
        isProcessing = false;
        delete guessNumberGames[message.author.id];
        return;
      }

      // Check if ran out of guesses
      else if (guessed >= 2) {
        collector.stop();

        // Remove money
        let amount = ecoConfig.payouts.guessNumber.punishment;
        await actions.eco.removeMoneyFor(message.author.id, amount, true);
        await message.reply(
          `Oops... you weren't able to get the number correct in 3 guesses! The number was **${botsNumber}**! You lost ${currency(
            amount
          )}`
        );
        isProcessing = false;
        delete guessNumberGames[message.author.id];
        return;
      }

      // Lost, but they still have guesses
      else {
        guessed++;
        guessNumberGames[message.author.id] = true;

        // Send message
        await updateMessage(
          `That's not correct! You now have **${
            3 - guessed
          }** guesses!\nMy number is: **${
            number > botsNumber ? "lower" : "higher"
          }**`
        );
        isProcessing = false;
      }
    });
  },
};

export default command;
