import { TrancerDatabase } from "../database.ts";

export default class TrancerDatabaseServer {
  private database: TrancerDatabase;

  constructor(database: TrancerDatabase) {
    this.database = database;
  }

  public async getSettings(serverId: string): Promise<ServerSettings> {
    const settings = await this.database.connection.get<ServerSettings>(
      `SELECT * FROM server_settings WHERE server_id = ?;`,
      serverId,
    );

    return !settings ? this.setupSettings(serverId) : settings;
  }

  public async setupSettings(serverId: string): Promise<ServerSettings> {
    return await this.database.connection.get<ServerSettings>(
      `INSERT INTO server_settings (server_id) VALUES (?) RETURNING *;`,
      serverId,
    ) as ServerSettings;
  }
}
