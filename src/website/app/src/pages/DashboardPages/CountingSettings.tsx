import TrancerBooleanInput from "../../Components/TrancerBooleanInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words, { TextType } from "../../dawn-ui/components/Words";
import useServerResources from "../../hooks/useServerResources";

export default function CountingSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  return (
    <Column>
      <label>
        Create your very own counting channel in your server! Have your members
        count as high as they can! Set this up in Discord with Trancer with{" "}
        <code>.setupcount</code>
      </label>
      <Words type={TextType.Heading}>Counting Settings</Words>
      <FullWidthInput
        name="Failures"
        description="Should the count be reset if someone fails?"
      >
        <TrancerBooleanInput k="ignore_failure" server={server} />
      </FullWidthInput>
      <FullWidthInput
        name="Failures on Weekends"
        description="Should the count be reset if someone fails, only on weekends?"
      >
        <TrancerBooleanInput k="ignore_failure_weekend" server={server} />
      </FullWidthInput>
    </Column>
  );
}
