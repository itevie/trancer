import { connectAnalytic } from "../util/analytics";
import { connect } from "../util/database";

export default async function () {
  await connect();
  await connectAnalytic();
}
