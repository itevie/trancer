import { loadAllSources } from "../commands/file-directory/_util";
import { Init } from "./init";

const init: Init = {
  execute() {
    loadAllSources();
  },
};

export default init;
