import sqlite3, { Statement } from "sqlite3";
import { Database, open } from "sqlite";
import Logger from "../util/Logger.ts";
import config from "../../config.ts";
import TrancerDatabaseServer from "./actions/server.ts";
import TrancerDatabaseCards from "./actions/cards.ts";
import TrancerDatabaseDecks from "./actions/decks.ts";

export class TrancerDatabase {
  public connection: Database<sqlite3.Database, Statement> =
    1 as unknown as Database<sqlite3.Database, Statement>;
  public logger = new Logger("database");

  public servers = new TrancerDatabaseServer(this);
  public cards = new TrancerDatabaseCards(this);
  public decks = new TrancerDatabaseDecks(this);

  public async init(): Promise<TrancerDatabase> {
    const databasePath = config.database.path;

    // Connect
    this.connection = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    // Setup
    await this.connection.exec(
      Deno.readTextFileSync(import.meta.dirname + "/../sql/setup.sql"),
    );

    this.logger.log(`Initialised database`);

    return this;
  }
}

const database = await new TrancerDatabase().init();
export default database;
