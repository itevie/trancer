import { HypnoCommand } from "../../types/util";
import { getRandomFile, handleFileMessage } from "./_util";

const command: HypnoCommand = {
  name: "randomfile",
  description: "Get a random file from the Trancer file directory",
  type: "file-directory",

  handler: async (message, { serverSettings }) => {
    handleFileMessage(
      message,
      await getRandomFile(serverSettings.allow_nsfw_file_directory_sources)
    );
  },
};

export default command;
