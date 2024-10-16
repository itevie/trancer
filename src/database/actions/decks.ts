import type { TrancerDatabase } from "../database.ts";

export default class TrancerDatabaseDecks {
  private database: TrancerDatabase;

  constructor(database: TrancerDatabase) {
    this.database = database;
  }

  public async getAll(): Promise<Deck[]> {
    return await this.database.connection.all<Deck[]>(
      `SELECT * FROM decks`,
    );
  }

  public async getById(id: number): Promise<Deck | undefined> {
    return await this.database.connection.get(
      `SELECT * FROM decks WHERE id = ?`,
      id,
    );
  }

  public async getByName(name: string): Promise<Deck | undefined> {
    return await this.database.connection.get(
      `SELECT * FROM decks WHERE name = ?`,
      name,
    );
  }
}
