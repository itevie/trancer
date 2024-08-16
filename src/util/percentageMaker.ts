const empty = "░";
const filled = "█";

export default function makePercentageASCII(percentage: number, length: number): string {
    const percentagePer = 100 / length;
    const amount = Math.round(percentage / percentagePer);

    return `${filled.repeat(amount)}${empty.repeat(length - amount)}`;
}