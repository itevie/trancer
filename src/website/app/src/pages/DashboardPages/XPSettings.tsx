import TrancerBooleanInput from "../../Components/TrancerBooleanInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import { useBotDetails } from "../../hooks/useBotDetails";
import useServerResources from "../../hooks/useServerResources";

export default function XPSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  const botDetails = useBotDetails();

  return (
    <Column>
      <Words type="heading">XP Settings</Words>
      <label>
        Trancer has it's very own XP system, per-server! Track who speaks the
        most with the <code>.xpl</code> command!
      </label>
      <label>More coming soon (maybe)</label>
      <FullWidthInput
        name="Level Notifications"
        description="Whether or not Trancer should reply to people when they have levelled up"
      >
        <TrancerBooleanInput k="level_notifications" server={server} />
      </FullWidthInput>
    </Column>
  );
}
