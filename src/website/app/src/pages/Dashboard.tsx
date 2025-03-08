import Container from "../dawn-ui/components/Container";
import FAB from "../dawn-ui/components/FAB";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Page from "../dawn-ui/components/Page";
import Tabbed from "../dawn-ui/components/Tabbed";
import useServerResources from "../hooks/useServerResources";
import AppNavbar from "../Navbar";
import AutobanSettings from "./DashboardPages/AutobanSettings";
import BasicSettings from "./DashboardPages/BasicSettings";
import FileDirectorySettings from "./DashboardPages/FileDirectorySettings";
import MessageSettings from "./DashboardPages/MessagesSettings";
import ReportSettings from "./DashboardPages/ReportSettings";
import VerificationSettings from "./DashboardPages/VerificationSettings";
import XPSettings from "./DashboardPages/XPSettings";

export default function Dashboard() {
  const server = useServerResources(
    window.location.pathname.match(/\/servers\/([0-9]*)/)?.[1] as string
  );

  return (
    <>
      <AppNavbar full />
      {Object.keys(server.modified).length > 0 ? (
        <FAB
          clicked={server.save}
          label={<GoogleMatieralIcon name="save" />}
          type="success"
        />
      ) : (
        <></>
      )}

      <Page full>
        <Container>
          <Tabbed>
            {{
              "Basic Settings": <BasicSettings server={server} />,
              "Welcome Messages": <MessageSettings server={server} />,
              Verification: <VerificationSettings server={server} />,
              Reporting: <ReportSettings server={server} />,
              Autoban: <AutobanSettings server={server} />,
              XP: <XPSettings server={server} />,
              "File Directory": <FileDirectorySettings server={server} />,
            }}
          </Tabbed>
        </Container>
      </Page>
    </>
  );
}
