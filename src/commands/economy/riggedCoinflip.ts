import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";
import { currency } from "../../util/language";

const command: HypnoCommand<{ amount: number; confirm?: string }> = {
  name: "riggedcoinflip",
  type: "economy",
  aliases: ["rcf"],
  description: "Flip a ***RIGGED*** coin (40% chance of winning)",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "amount",
        type: "currency",
        min: 10,
      },
      {
        name: "confirm",
        type: "string",
        mustBe: "confirm",
      },
    ],
  },

  handler: async (message, args) => {
    let eco = await actions.eco.getFor(message.author.id);

    console.log(
      args,
      args.args.amount > 1000 ||
        (eco.balance > 100 && args.args.amount > eco.balance / 2)
    );

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Confirm coinflip`)
        .setDescription(
          `You are coinflipping a lot of money (${currency(
            args.args.amount
          )}), are you sure?`
        ),
      autoYes: !(
        args.args.amount > 1000 ||
        (eco.balance > 100 && args.args.amount > eco.balance / 2)
      ),
      async callback() {
        let win = Math.random() < 0.4;

        if (win) {
          await actions.eco.addMoneyFor(
            message.author.id,
            args.args.amount,
            "gambling"
          );
        } else {
          await actions.eco.removeMoneyFor(
            message.author.id,
            args.args.amount,
            true
          );
        }

        if (!win && args.args.amount > 1000) {
          await message.reply(
            "https://tenor.com/view/not-stonks-profit-down-sad-frown-arms-crossed-gif-15684535"
          );
        }

        return {
          embeds: [
            createEmbed()
              .setTitle("Coinflip Outcome")
              .setDescription(
                win
                  ? `:green_circle: The coin landed in your favour! Your earnt ${currency(
                      args.args.amount
                    )}!`
                  : `:red_circle: The coin did not land in your favour, you lost ${currency(
                      args.args.amount
                    )} :(`
              ),
          ],
        };
      },
    });
  },
};

export default command;
