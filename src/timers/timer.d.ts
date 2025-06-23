import { MaybePromise } from "../types/util";

declare interface Timer {
  name: string;
  every: number;
  execute: () => MaybePromise<any>;
}
