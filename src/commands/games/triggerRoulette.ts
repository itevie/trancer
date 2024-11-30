import { HypnoCommand } from "../../types/util";
import GameManager from "../../util/GameManager";

const gameManager = new GameManager<{}>({
  name: "Trigger Roulette",
  singleplayer: false,
});

const command: HypnoCommand = {
  name: "triggerroulette",
  aliases: ["troulette", "trou"],
  description: "A game of trigger roulette",
  type: "games",

  handler: async (message) => {
    gameManager.newGame(message);
  },
};

export default command;
