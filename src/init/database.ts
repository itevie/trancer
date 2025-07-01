import { analyticDatabase, connectAnalytic } from "../util/analytics";
import { connect, database } from "../util/database";
import { Init } from "./init";

const init: Init = {
  async execute() {
    await connect();
    await connectAnalytic();
  },

  async deinit() {
    await database.close();
    await analyticDatabase.close();
  },
};

export default init;
