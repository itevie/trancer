import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import Page from "../dawn-ui/components/Page";
import Row from "../dawn-ui/components/Row";
import { todo } from "../dawn-ui/util";
import AppNavbar from "../Navbar";

export default function Economy() {
  return (
    <>
      <AppNavbar full />
      <Page full>
        <Column>
          <Container>
            <Row className="economy-podium">
              <Column>
                <img
                  className="economy-podium-img"
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.M6acAhueNKPF0Ou5vKYfpwHaF4%26pid%3DApi&f=1&ipt=897a35e2af40bdba8bedd1c3b9690ddbd2552400a5a22297909f1705c40b0021&ipo=images"
                />
                <label>username</label>
              </Column>

              <Column>
                <img
                  className="economy-podium-img"
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.M6acAhueNKPF0Ou5vKYfpwHaF4%26pid%3DApi&f=1&ipt=897a35e2af40bdba8bedd1c3b9690ddbd2552400a5a22297909f1705c40b0021&ipo=images"
                />
                <label>username</label>
              </Column>

              <Column>
                <img
                  className="economy-podium-img"
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.M6acAhueNKPF0Ou5vKYfpwHaF4%26pid%3DApi&f=1&ipt=897a35e2af40bdba8bedd1c3b9690ddbd2552400a5a22297909f1705c40b0021&ipo=images"
                />
                <label>username</label>
              </Column>
            </Row>
          </Container>
          <Row util={["justify-center"]}>
            <Container small hover title="Leaderboard" onClick={todo}>
              Check out the leaderboard! See who's the best.
            </Container>
            <Container small hover title="Users" onClick={todo}>
              See all a user's details.
            </Container>
            <Container small hover title="Items" onClick={todo}>
              See all the items, see who has the most, etc.
            </Container>
            <Container small hover title="Misc Details" onClick={todo}>
              Other details such as lottery.
            </Container>
          </Row>
        </Column>
      </Page>
    </>
  );
}
