import { HypnoCommand } from "../../types/util";
import { getRandomFile, handleFileMessage } from "./_util";

const command: HypnoCommand = {
  name: "randomfile",
  description: "Get a random file from the Trancer file directory",
  type: "file-directory",

  handler: async (message) => {
    handleFileMessage(message, await getRandomFile());
  },
};

export default command;
