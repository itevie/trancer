import { MaybePromise } from "../types/util";

declare interface Init {
  whenReady?: boolean;
  priority?: number;
  execute: () => MaybePromise<any>;
  deinit?: () => MaybePromise<any>;
}
