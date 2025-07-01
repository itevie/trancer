export default class Birthday {
  public date: Date;
  private old: string;

  public get next(): Date {
    const today = new Date();
    const birthday = new Date(this.date);
    birthday.setFullYear(today.getFullYear());

    const hasPassed =
      birthday.getMonth() < today.getMonth() ||
      (birthday.getMonth() === today.getMonth() &&
        birthday.getDate() <= today.getDate());

    if (hasPassed) {
      birthday.setFullYear(today.getFullYear() + 1);
    }

    return birthday;
  }

  public constructor(data: string) {
    this.old = data;

    if (data.includes("????"))
      data = data.replace("????", new Date().getFullYear().toString());

    this.date = new Date(data);
  }
}
