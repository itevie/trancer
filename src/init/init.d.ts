import { MaybePromise } from "../types/util";

declare type Init =
  | (() => MaybePromise<any>)
  | {
      whenReady?: boolean;
      execute: () => MaybePromise<any>;
    };
