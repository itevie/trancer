import { database } from "../database";

type ServerSettingsUpdate = Omit<ServerSettings, "server_id">;

const _actions = {
  getFor: async (serverId: string): Promise<ServerSettings> => {
    return (
      (await database.get<ServerSettings>(
        "SELECT * FROM server_settings WHERE server_id = ?;",
        serverId
      )) ?? (await _actions.createFor(serverId))
    );
  },

  createFor: async (serverId: string): Promise<ServerSettings> => {
    return await database.get<ServerSettings>(
      "INSERT INTO server_settings (server_id) VALUES (?) RETURNING *;",
      serverId
    );
  },

  update: async <T extends keyof ServerSettingsUpdate>(
    serverId: string,
    key: T,
    value: ServerSettingsUpdate[T]
  ): Promise<ServerSettingsUpdate> => {
    return await database.get<ServerSettingsUpdate>(
      `UPDATE server_settings SET ${key} = ? WHERE server_id = ?;`,
      value,
      serverId
    );
  },
} as const;

export default _actions;
