import { client } from "..";
import config from "../config";
import { initInviteCache } from "../events/guildMemberAdd";
import { actions } from "../util/database";
import { initQotd } from "../util/qotd";
import { initLottery } from "./lottery";

export default function initAllManagers() {
  if (client.user.id !== config.devBot.id) {
    initInviteCache();
    initLottery();
    initQotd();
  }

  actions.commandCreations.init();
}
