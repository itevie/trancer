import { HypnoCommand } from "../../types/util";

const consonantClustors = (
  "bl, gl, pl, kl, br, dr, gr, pr, th, tr, kr, ph, spl, spr, str, skr, sp, st, sk, sl, sm, sn, thr, fl, fr, sw, tw, skw, fy, shw, shm, " +
  "b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, x, z, w, y"
).split(", ");

const command: HypnoCommand<{ content: string }> = {
  name: "piglatin",
  description: "Converts English to pig latin (igpay atinlay)",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "content",
        type: "string",
        takeContent: true,
        infer: true,
      },
    ],
  },

  handler: (message, { args }) => {
    let content = args.content
      .replace(/[!?.,\-'"]/g, "")
      .toLowerCase()
      .split(" ");
    let words = [];
    for (const word of content) {
      let newWord = "";

      // Check if starts with consonant
      for (const cc of consonantClustors)
        if (word.toLowerCase().startsWith(cc)) {
          let part = word.substring(cc.length);
          let ccInWord = word.substring(0, cc.length);
          newWord = `${part}${ccInWord}`;
          break;
        }

      // Check if vowel-starting
      if (!newWord) newWord = word;

      newWord += "ay";
      words.push(newWord);
    }

    return message.reply(
      `${words.length === 0 ? "No result" : words.join(" ")}`
    );
  },
};

export default command;
