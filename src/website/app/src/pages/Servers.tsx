import { useEffect, useState } from "react";
import Page from "../dawn-ui/components/Page";
import AppNavbar from "../Navbar";
import { axiosClient } from "..";
import Row from "../dawn-ui/components/Row";
import Container from "../dawn-ui/components/Container";
import Icon from "../dawn-ui/components/Icon";
import Column from "../dawn-ui/components/Column";
import Words from "../dawn-ui/components/Words";
import Hoverable from "../dawn-ui/components/Hoverable";
import { useServers } from "../hooks/useServers";

export default function ServerList() {
  const servers = useServers();

  return (
    <>
      <AppNavbar full />
      <Page full>
        <Row util={["justify-center"]}>
          {servers.map((s) => (
            <Container
              hover
              style={{ width: "fit-content" }}
              onClick={() => (window.location.href = `/servers/${s.id}`)}
            >
              <Column util={["align-center", "justify-center"]}>
                <Icon
                  src={s.avatar ?? "https://dawn.rest/cdn/no_pfp.png"}
                  size={"96px"}
                  style={{ borderRadius: "100px" }}
                  fallback="https://dawn.rest/cdn/no_pfp.png"
                />
                <Words>{s.name}</Words>
              </Column>
            </Container>
          ))}
        </Row>
      </Page>
    </>
  );
}
