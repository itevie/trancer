import TrancerBooleanInput from "../../Components/TrancerBooleanInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import useServerResources from "../../hooks/useServerResources";

export default function FileDirectorySettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  return (
    <Column>
      <Words type="heading">File Directory Settings</Words>
      <label>
        Trancer has it's own hypnosis file directory! Configure what shows up
        here! Want to add your own files into the directory? DM me on Discord!
      </label>
      <label>More coming soon (maybe)</label>
      <FullWidthInput
        name="Allow NSFW Sources"
        description="Whether or not NSFW (or questionable) sources should appear in the file directory commands"
      >
        <TrancerBooleanInput k="allow_nsfw_sources" server={server} />
      </FullWidthInput>
    </Column>
  );
}
