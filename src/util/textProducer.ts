import ecoConfig from "../ecoConfig";

export function currency(amount: number): string {
  return `**${amount}${ecoConfig.currency}**`;
}

export function itemText(item: Item, amount?: number): string {
  return `**${amount && amount > 1 ? `${amount} ` : ""}${
    item.emoji ? item.emoji : ""
  }${item.name}${amount && amount > 1 ? "s" : ""}**`;
}
