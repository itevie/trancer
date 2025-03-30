import { execSync } from "child_process";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "githistory",
  type: "help",
  description: "Get a list of git commit messages",

  handler: async (message) => {
    const output = execSync(
      'git log --pretty=format:"%s\r-# %ad" --date=short',
      {
        encoding: "utf8",
      },
    )
      .split("\n")
      .map((x) => x.replace("\r", "\n"));

    return paginate({
      message,
      embed: createEmbed().setTitle("All git commits"),
      type: "description",
      data: output,
    });
  },
};

export default command;
