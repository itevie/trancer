import Mexp from "math-expression-evaluator";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ expr: string }> = {
  name: "matheval",
  description: "Evaluate a mathjs expression",
  type: "help",
  args: {
    requiredArguments: 1,
    args: [
      {
        name: "expr",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: (message, { args }) => {
    const mexp = new Mexp();
    try {
      return message.reply(mexp.eval(args.expr).toString());
    } catch (e) {
      return message.reply(`${e.toString()}`);
    }
  },
};

export default command;
