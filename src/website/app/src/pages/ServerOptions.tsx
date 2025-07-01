import { useEffect, useState } from "react";
import Page from "../dawn-ui/components/Page";
import Words, { TextType } from "../dawn-ui/components/Words";
import AppNavbar from "../Navbar";
import { Server, useServers } from "../hooks/useServers";
import Row from "../dawn-ui/components/Row";
import Container from "../dawn-ui/components/Container";

export default function ServerOptions() {
  const servers = useServers();
  const [selectedServer, setSelectedServer] = useState<Server | undefined>(
    undefined,
  );

  useEffect(() => {
    const id = window.location.href.match(/servers\/([0-9]+)/)?.[1];
    if (!id) return;
    setSelectedServer(servers.find((x) => x.id == id));
  }, [servers]);

  return (
    <>
      <AppNavbar full />
      <Page full>
        <Words style={{ textAlign: "center" }} type={TextType.PageTitle}>
          {selectedServer?.name}
        </Words>
        <Row util={["justify-center"]}>
          <Container
            hover
            title="Leaderboards"
            util={["fit-content"]}
            onClick={() =>
              (window.location.href = `/servers/${selectedServer?.id}/leaderboards`)
            }
          >
            View this server's leaderboards.
          </Container>
          {selectedServer?.can_manage && (
            <Container
              hover
              title="Dashboard"
              util={["fit-content"]}
              onClick={() =>
                (window.location.href = `/servers/${selectedServer?.id}/dashboard`)
              }
            >
              Manage Trancer for this server.
            </Container>
          )}
        </Row>
      </Page>
    </>
  );
}
