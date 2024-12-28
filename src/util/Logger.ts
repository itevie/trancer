export default class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public log(message: string): void {
    console.log(`[${this.name}]: ${message}`);
  }

  public logAny(data: any): void {
    console.log(`[${this.name}]: ${data}`);
  }
}
