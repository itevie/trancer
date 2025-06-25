import { OptionDefinition } from "command-line-args";

const cliArgumentsDefinition: OptionDefinition[] = [
  {
    name: "load-cmd",
    defaultValue: [],
    alias: "c",
    multiple: true,
    type: String,
  },
  { name: "no-handlers", defaultValue: false, type: Boolean },
] as const;

export default cliArgumentsDefinition;
