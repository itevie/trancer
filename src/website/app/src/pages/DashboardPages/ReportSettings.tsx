import TrancerMultiInput from "../../Components/TrancerMultiInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import { useBotDetails } from "../../hooks/useBotDetails";
import useServerResources from "../../hooks/useServerResources";

export default function ReportSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  const botDetails = useBotDetails();

  return (
    <Column>
      <Words type="heading">Report Settings</Words>
      <label>
        This feature allows different server to send reports to all servers.
        When someone in a <b>trusted</b> server makes a report, it will be sent
        to all servers with a report channel set up!
      </label>
      <label>
        {server.resources.raw_settings.report_trusted ? (
          <>
            You can send reports with the <code>.reportwizard</code> or{" "}
            <code>.report</code> command in your server!
          </>
        ) : (
          <>
            Your server has <b>not</b> been trusted for sending reports yet.
            Please DM the bot owner on Discord to get trusted!
          </>
        )}
      </label>
      <FullWidthInput
        name="Report Channel"
        description="Where should Trancer send new reports in your server"
      >
        <TrancerMultiInput
          k="report_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Report Ban Message Channel"
        description="When you ban a user via a Trancer report, Trancer will send the report embed in this channel"
      >
        <TrancerMultiInput
          k="report_ban_log_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
    </Column>
  );
}
