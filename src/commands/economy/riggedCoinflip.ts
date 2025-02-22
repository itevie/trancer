import { HypnoCommand } from "../../types/util";
import {
  addMoneyFor,
  getEconomyFor,
  removeMoneyFor,
} from "../../util/actions/economy";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";
import { currency } from "../../util/textProducer";

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
    let eco = await getEconomyFor(message.author.id);

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
          await addMoneyFor(message.author.id, args.args.amount, "gambling");
        } else {
          await removeMoneyFor(message.author.id, args.args.amount, true);
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
