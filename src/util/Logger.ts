export default class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public logProgress(
    label: string,
    total: number,
  ): (stepLabel?: string | true) => void {
    let current = 0;

    const render = (done = false) => {
      const barLength = 20;
      const progress = Math.floor((current / total) * barLength);
      const bar = "=".repeat(progress) + " ".repeat(barLength - progress);
      const percent = Math.floor((current / total) * 100);
      const status = done ? "✅" : "";

      // \r = return to start of line, \x1b[0K = clear to end of line
      process.stdout.write(
        `\r[${this.name}]: ${label}: [${bar}] ${current}/${total} ${percent}% ${status}\x1b[0K`,
      );
    };

    render();

    return (stepLabel?: string | true) => {
      if (stepLabel === true) {
        current = total;
        render(true);
        process.stdout.write("\n");
        return;
      }

      current++;
      const done = current === total;
      render(done);
    };
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
