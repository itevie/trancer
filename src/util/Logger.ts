export default class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public log(message: string): void {
    console.log(`[${this.name}]: ${message}`);
  }

  public warn(...message: string[]): void {
    console.log(`\x1b[33m[${this.name}]`, ...message, "\x1b[0m");
  }

  public error(...message: any[]): void {
    console.log(`\x1b[31m[${this.name}]`, ...message, "\x1b[0m");
  }

  public logAny(data: any): void {
    console.log(`[${this.name}]: ${data}`);
  }
}
