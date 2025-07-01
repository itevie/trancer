import { Jimp } from "jimp";
import Canvas, { createCanvas, loadImage } from "canvas";
import { exists, existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import GIFEncoder from "gifencoder";
import { execSync } from "child_process";
import config from "../../config";

export async function generateNotImmuneImage(imageUrl: string) {
  // Load stuff
  const canvas = Canvas.createCanvas(465, 658);
  const ctx = canvas.getContext("2d");
  const image = await Canvas.loadImage(
    readFileSync(config.dataDirectory + "/not_immune.png"),
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
    readFileSync(__dirname + "/../data/speech_bubble.png"),
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
    offset,
  );
  ctx.drawImage(
    await Canvas.loadImage(await speechBubble.getBuffer("image/png")),
    0,
    0,
  );

  return canvas.toBuffer();
}

export async function createRotatingGifBuffer(
  inputPath: string,
  frameCount = 30,
  duration = 3,
) {
  const image = await loadImage(inputPath);
  const size = Math.max(image.width, image.height);

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const encoder = new GIFEncoder(size, size);

  const bufferStream = [];
  const stream = encoder.createReadStream();
  stream.on("data", (chunk) => bufferStream.push(chunk));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay((duration * 1000) / frameCount);
  encoder.setQuality(10);

  for (let i = 0; i < frameCount; i++) {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(((2 * Math.PI) / frameCount) * i);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
    // @ts-ignore
    encoder.addFrame(ctx);
  }

  encoder.finish();

  return Buffer.concat(bufferStream);
}

export function getFontFile() {
  const fonts = [
    "/usr/share/fonts/TTF/Impact.TTF",
    "/usr/share/fonts/msttcore/impact.ttf",
  ];

  for (const font of fonts) if (existsSync(font)) return font;
  throw new Error("No impact font found...");
}

export function addCaptionToGif(
  inputPath: string,
  caption: string,
  ext: string = "gif",
) {
  const safeCaption = caption.replace(/'/g, "\\'");
  const output = __dirname + `/output.${ext}`;

  if (existsSync(output)) rmSync(output);

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  let lines = safeCaption.match(/.{1,30}/g);
  let whitespace = 50 * lines.length;

  const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "pad=iw:ih+${whitespace}:0:${whitespace}:white, drawtext=text='${lines.join(
    "\n",
  )}':fontfile='${getFontFile()}':x=(w-text_w)/2:y=10:fontsize=36:fontcolor=black" "${output}"`;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
    const read = readFileSync(output);
    return { buffer: read, name: output };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function runFfmpegCommand(command: string, ext: string) {
  let output = __dirname + "/output." + ext;

  try {
    execSync(`${command} ${output}`, { stdio: "inherit" });
    const read = readFileSync(output);
    return { buffer: read, name: output };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function runFfmpegCommandWithInput(
  input: Buffer,
  inputExt: string,
  command: string,
  ext: string,
) {
  let temp = __dirname + "/temp." + inputExt;
  writeFileSync(temp, input);
  let result = runFfmpegCommand(command.replace(/%i/g, temp), ext);
  //rmSync(temp);
  return result;
}
