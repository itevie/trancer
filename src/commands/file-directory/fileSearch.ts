import { HypnoCommand } from "../../types/util";
import { paginateFileList, searchFiles } from "./_util";

const command: HypnoCommand<{ query: string }> = {
  name: "filesearch",
  aliases: [
    "searchfiles",
    "findfiles",
    "findfile",
    "searchfile",
    "searchdirectory",
  ],
  description: "Searches the directory of files for your query",
  type: "file-directory",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "query",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    paginateFileList(
      message,
      await searchFiles(args.query),
      `Files matching ${args.query}`
    );
  },
};

export default command;
