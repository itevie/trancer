import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ state: boolean }> = {
  name: "showmyquotes",
  aliases: ["showmyquotesonsite", "siteopt"],
  description: "Opt out of your quotes being shown on the website",
  type: "quotes",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "boolean",
        name: "state",
      },
    ],
  },

  handler: async (message, args) => {
    await database.run(
      "UPDATE user_data SET site_quote_opt_in = ? WHERE user_id = ?;",
      args.args.state,
      message.author.id
    );

    return message.reply(
      `You have opted **${args.args.state ? "in" : "out"}** ${
        args.args.state ? "to" : "of"
      } your quotes being displayed on the site.`
    );
  },
};

export default command;
