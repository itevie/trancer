import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ what: string; user?: User }> = {
  name: "rate",
  description: "Rate someone's ___",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "what",
        type: "string",
      },
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: (message, { args }) => {
    let user = args.user ? args.user : message.author;

    return message.reply(
      `According to my calculation... **${
        user.username
      }** is... **${createRating(user.username, args.what)}% ${args.what}**`
    );
  },
};

export default command;

export function createRating(username: string, what: string): number {
  return randomNumberFromString(`${username}-${what}`, -5, 100);
}

// Stolen from ChatGPT
export function randomNumberFromString(
  input: string,
  rangeMin: number,
  rangeMax: number
) {
  // Step 1: Hash the string using a simple hash function
  function simpleHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // Use bitwise to keep it in 32-bit range
    }
    return hash;
  }

  // Step 2: Use the hash as a seed to generate a deterministic number
  const seed = simpleHash(input);

  // Step 3: Create a pseudo-random number based on the seed
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Step 4: Map the pseudo-random number to the specified range
  const randomValue = seededRandom(seed);
  return Math.floor(randomValue * (rangeMax - rangeMin + 1)) + rangeMin;
}
