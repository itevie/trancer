export default class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public log(...contents: unknown[]) {
    console.log(...contents);
  }
}
