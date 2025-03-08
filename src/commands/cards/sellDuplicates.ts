import { HypnoCommand } from "../../types/util";
import { computeCardPrice, convertAquiredCardsToCards } from "./_util";
import ConfirmAction from "../../util/components/Confirm";
import { actions, database } from "../../util/database";
import { createEmbed } from "../../util/other";
import { currency } from "../../util/textProducer";

const command: HypnoCommand = {
  name: "sellduplicates",
  description: "Sells all of your duplicate cards",
  aliases: ["selldups"],
  type: "cards",

  handler: async (message) => {
    // Collect all the data
    let acards = (
      await actions.cards.aquired.getAllFor(message.author.id)
    ).filter((x) => x.amount > 1);
    if (acards.length === 0)
      return message.reply(`You have no duplicate cards!`);

    let cards = await convertAquiredCardsToCards(acards);
    let worth = 0;
    let amount = 0;

    for (const acard in acards) {
      worth += computeCardPrice(cards[acard]) * (acards[acard].amount - 1);
      amount += acards[acard].amount - 1;
    }

    // Create the selling cards
    let text = acards
      .map(
        (v, i) => `**${cards[i].name}** *${cards[i].rarity}* x${v.amount - 1}`
      )
      .join("\n");
    text = text + `\n\n**${amount}** cards worth: ${currency(worth)}`;

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Are you sure you want to sell these?`)
        .setDescription(text),
      callback: async () => {
        for await (const acard of acards) {
          await database.run(
            `UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?;`,
            acard.amount - 1,
            message.author.id,
            acard.card_id
          );
        }

        await actions.eco.addMoneyFor(message.author.id, worth);

        return {
          embeds: [
            createEmbed().setTitle("Sold the cards!").setDescription(text),
          ],
        };
      },
    });
  },
};

export default command;
