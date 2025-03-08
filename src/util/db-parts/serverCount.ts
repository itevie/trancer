import { database } from "../database";

const _actions = {
  getFor: async (serverId: string): Promise<ServerCount> => {
    return await database.get<ServerCount>(
      `SELECT * FROM server_count WHERE server_id = ?;`,
      serverId
    );
  },
} as const;

export default _actions;
