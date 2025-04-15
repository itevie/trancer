import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 1600;
const height = 800;
const backgroundColour = "#111111";

export const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});
