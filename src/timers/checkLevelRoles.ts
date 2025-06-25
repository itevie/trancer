import { client } from "..";
import { calculateLevel } from "../messageHandlers/xp";
import LevelRole from "../models/LevelRole";
import { actions } from "../util/database";
import Logger from "../util/Logger";
import { units } from "../util/ms";
import { addRole } from "../util/other";
import { Timer } from "./timer";

const logger = new Logger("level-role-checker");
const timer: Timer = {
  name: "check-level-roles",
  every: units.hour * 3,
  async execute() {
    logger.log(`Checking level roles`);
    const servers = client.guilds.cache;
    for await (const server of servers.values()) {
      const levelRoles = await LevelRole.fetchAll(server.id);
      logger.log(
        `Checking for server ${server.id}, it has ${levelRoles.length} level roles`,
      );

      for await (const member of server.members.cache.values()) {
        if (member.user.bot) continue;

        const userData = await actions.userData.getFor(
          member.user.id,
          server.id,
        );

        for await (const levelRole of levelRoles) {
          const memberLevel = calculateLevel(userData.xp);
          if (memberLevel >= levelRole.data.level) {
            try {
              const role = await server.roles.fetch(levelRole.data.role_id);
              if (member.roles.cache.has(role.id)) continue;
              await addRole(member, role);
              logger.log(`Gave ${member.user.id} the role ${role.name}`);
            } catch (e) {
              // TODO: Send log to owner
              logger.error(e);
            }
          }
        }
      }
    }
  },
};

export default timer;
