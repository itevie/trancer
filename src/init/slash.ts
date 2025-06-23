import { loadSlashCommands } from "../util/slashCommands";
import { Init } from "./init";

const init: Init = {
  whenReady: true,
  execute: () => {
    loadSlashCommands();
  },
};

export default init;
