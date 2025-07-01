import config from "../config";
import initServer from "../website";
import { Init } from "./init";

const init: Init = {
  whenReady: true,
  execute() {
    if (true || config.website.enabled) {
      initServer();
    }
  },
};

export default init;
