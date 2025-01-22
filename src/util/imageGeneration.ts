import { Jimp } from "jimp";
import Canvas from "canvas";
import { readFileSync } from "fs";

export async function generateNotImmuneImage(imageUrl: string) {
  // Load stuff
  const canvas = Canvas.createCanvas(465, 658);
  const ctx = canvas.getContext("2d");
  const image = await Canvas.loadImage(
    readFileSync(__dirname + "/../data/not_immune.png")
  );

  // Make avatar a circle
  const av = await Jimp.read(imageUrl);
  av.resize({ w: 200, h: 200 });
  av.circle();

  // Get avatar
  const avatar = await Canvas.loadImage(await av.getBuffer("image/png"));

  // Draw
  ctx.drawImage(image, 0, 0);
  ctx.drawImage(avatar, 50, 450, 100, 100);
  return canvas.toBuffer();
}

export async function generateSpeechbubbleImage(imageUrl: string) {
  let offset = 60;

  // Load image
  const image = await Jimp.read(imageUrl);
  const speechBubble = await Jimp.read(
    readFileSync(__dirname + "/../data/speech_bubble.png")
  );
  speechBubble.resize({ w: image.width });
  image.resize({ h: image.height + offset, w: image.width });

  // Create canvas
  const canvas = Canvas.createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  // Draw
  ctx.drawImage(
    await Canvas.loadImage(await image.getBuffer("image/png")),
    0,
    offset
  );
  ctx.drawImage(
    await Canvas.loadImage(await speechBubble.getBuffer("image/png")),
    0,
    0
  );

  return canvas.toBuffer();
}
