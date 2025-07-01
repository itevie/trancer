import getAllFiles from "./other";

export default function loadTs(dir: string) {
  return getAllFiles(dir)
    .filter((x: string) => !x.match(/_[a-zA-Z_]+\.[tj]s/))
    .filter((x: string) => x.match(/(\.[tj]s)$/))
    .filter((x: string) => !x.endsWith(".d.ts"));
}
