import { HypnoCommand } from "../../types/util";
import { existingGames } from "./coinflip";

const command: HypnoCommand = {
  name: "cancelcoinflip",
  aliases: ["cancelcf", "ccf"],
  description: "Cancels a coinflip",
  type: "economy",

  handler: (message) => {
    // Check if the user has a game open
    if (!existingGames[message.author.id])
      return message.reply(`You have not requested a game!`);

    // Delete it
    delete existingGames[message.author.id];

    // Done
    return message.reply(`Cancelled the game!`);
  },
};

export default command;
