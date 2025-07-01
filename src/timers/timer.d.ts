import { MaybePromise } from "../types/util";

declare interface Timer {
  name: string;
  every: number;
  noDev?: boolean;
  execute: () => MaybePromise<any>;
}
