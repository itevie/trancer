import { HypnoCommand } from "../../types/command";
import { analyticDatabase } from "../../util/analytics";

const command: HypnoCommand = {
    name: "moneytransactions",
    type: "analytics",

    handler: async (message) => {
        let total = (await analyticDatabase.get(`SELECT COUNT() AS amount FROM money_transactions`)).amount;
        let fromUser = (await analyticDatabase.get(`SELECT COUNT() AS amount FROM money_transactions WHERE user_id = ?`, message.author.id)).amount;

        return message.reply(`There are **${total}** transacations recorded, **${fromUser}** which are from you`);
    }
};

export default command;