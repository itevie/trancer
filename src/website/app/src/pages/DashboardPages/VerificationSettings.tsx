import TrancerMultiInput from "../../Components/TrancerMultiInput";
import TrancerStringInput from "../../Components/TrancerStringInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import useServerResources from "../../hooks/useServerResources";

export default function VerificationSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  return (
    <Column>
      <Words type="heading">Verification Settings</Words>
      <label>
        Setup verification with Trancer! Then all you need to do is reply to a
        user with <code>.v</code> or <code>.verify</code> and you're good to go!
      </label>
      <FullWidthInput
        name="Verified Role"
        description="The role Trancer should give upon verifying someone"
      >
        <TrancerMultiInput
          k="verified_role"
          server={server}
          v={server.resources.roles.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Verified Message Channel"
        description="Where Trancer should send the message when someone is verified"
      >
        <TrancerMultiInput
          k="verified_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Verified Message"
        description="What Trancer should send in the channel above when verified"
      >
        <TrancerStringInput
          k="verified_message"
          server={server}
          varstring={true}
        />
      </FullWidthInput>
    </Column>
  );
}
