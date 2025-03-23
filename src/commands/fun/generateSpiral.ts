import { createCanvas } from "canvas";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";
import { Jimp } from "jimp";

const command: HypnoCommand = {
  name: "generatespiral",
  type: "fun",
  description: "Generate spiral",

  handler: async (message) => {
    // Canvas size
    const width = 600;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    function drawThickSpiral(
      ctx: ReturnType<typeof canvas.getContext>,
      width,
      height,
      armThickness = 10,
      rotation = 60,
    ) {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = 250; // Maximum spiral radius
      const turns = 5; // Number of full turns
      const points = 500; // Number of points in the spiral
      const scaleFactor = 1.5; // Increase to make arms spread more

      ctx.clearRect(0, 0, width, height);

      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        maxRadius,
      );
      gradient.addColorStop(0, "blue");
      gradient.addColorStop(1, "red");

      ctx.strokeStyle = gradient;

      ctx.save();

      ctx.translate(centerX, centerY);
      ctx.rotate(rotation); // Rotate the entire spiral
      ctx.translate(-centerX, -centerY);

      // Draw multiple spirals slightly offset to create thick arms
      for (let offset = -armThickness; offset <= armThickness; offset += 2) {
        ctx.beginPath();

        for (let i = 0; i < points; i++) {
          const angle = (i / points) * (turns * Math.PI * 2);
          const radius = (i / points) * maxRadius * scaleFactor + offset; // Offset makes arms thicker

          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      ctx.restore();
    }

    let frames: Buffer[] = [];

    for (let i = 0; i != 10; i++) {
      drawThickSpiral(ctx, width, height, i * 10);
      frames.push(canvas.toBuffer("image/png"));
    }

    const images = await Promise.all(frames.map((x) => Jimp.read(x)));

    const gif = new Jimp({ width, height });

    images.forEach((image, _) => {
      gif.composite(image, 0, 0);
    });

    // Convert canvas to a Buffer
    const buffer = await gif.getBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer).setName("spiral.gif");

    return message.reply({
      files: [attachment],
    });
  },
};

export default command;
