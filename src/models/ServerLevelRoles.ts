import LevelRole from "./LevelRole";

export default class ServerLevelRoles {
  public constructor(public serverId: string) {}

  public fetch(roleId: string, level: number) {
    return LevelRole.fetch(this.serverId, roleId, level);
  }

  public fetchAll() {
    return LevelRole.fetchAll(this.serverId);
  }

  public create(roleId: string, level: number) {
    return LevelRole.create(this.serverId, roleId, level);
  }
}
