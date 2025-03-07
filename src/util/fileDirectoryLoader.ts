import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
} from "discord.js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { createEmbed, paginate } from "./other";

const cacheDirectory = __dirname + "/../data/file_directory";
if (!existsSync(cacheDirectory)) mkdirSync(cacheDirectory);

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface FileDirectoryFile {
  name: string;
  directory: string;
  tags: string[];
  description: string;
  link: string;
  script_link: string;
}

export interface FileDirectorySource {
  description: string;
  websites: string[];
  handler: () => Promise<FileDirectoryFile[]>;
}

export const sources: { [key: string]: FileDirectorySource } = {
  TranceByDawn: {
    description: "Files from TranceByDawn",
    websites: ["https://dawn.rest/hypno", "https://youtube.com/@trancebydawn"],
    handler: async () => {
      const files = await axios.get("https://dawn.rest/api/file-list");

      return files.data.map((x) => {
        return {
          name: x.title,
          directory: "TranceByDawn",
          description: x.description,
          tags: x.tags.split(","),
          link: "https://dawn.rest/hypno/files/" + x.id,
          script_link: x.script,
        };
      });
    },
  },
  DivinityAxo: {
    description: "Axo's cool files!",
    websites: ["https://www.youtube.com/@DivinitysHypno"],
    handler: async () =>
      await loadSourcesFromYoutubeChannel(
        "DivinityAxo",
        "UCXUHkFi_dN0pUmlpnMmEzyg"
      ),
  },
};

export async function loadAllSources(): Promise<FileDirectoryFile[]> {
  const files: FileDirectoryFile[] = [];

  for await (const [name, value] of Object.entries(sources)) {
    const file = `${cacheDirectory}/${name}.json`;

    if (existsSync(file)) {
      const cache = JSON.parse(readFileSync(file, "utf-8"));
      if (
        1000 * 60 * 60 * 24 * 3 -
        (Date.now() - new Date(cache.fetch).getTime())
      ) {
        files.push(...cache.data);
        continue;
      }
    }

    const data = await value.handler();

    writeFileSync(
      file,
      JSON.stringify({
        fetch: new Date().toISOString(),
        data,
      })
    );

    files.push(...data);
  }

  return files;
}

export async function loadSourcesFromYoutubeChannel(
  directory: string,
  id: string
): Promise<FileDirectoryFile[]> {
  const url = `${BASE_URL}/search?key=${process.env.GOOGLE_API_KEY}&channelId=${id}&part=snippet,id&order=date&type=video&maxResults=200`;

  const response = await axios.get(url);
  const videos = response.data.items;

  return videos.map((v) => {
    return {
      name: v.snippet.title,
      directory,
      description: v.snippet.description,
      tags: [],
      link: `https://www.youtube.com/watch?v=${v.id.videoId}`,
    };
  });
}

export async function getFilesFrom(
  directory: string
): Promise<FileDirectoryFile[]> {
  return (await loadAllSources()).filter((x) => x.directory === directory);
}

export async function getRandomFile(): Promise<FileDirectoryFile> {
  const files = await getFilesFrom(
    Object.keys(sources)[
      Math.floor(Math.random() * Object.keys(sources).length)
    ]
  );
  return files[Math.floor(Math.random() * files.length)];
}

export function fileToEmbed(file: FileDirectoryFile): EmbedBuilder {
  let description = file.description;
  if (file.tags.length > 0)
    description += `\n> **Tags:** ${file.tags.join(", ")}`;

  const embed = createEmbed()
    .setTitle(`${file.directory}: ${file.name}`)
    .setDescription(description);

  return embed;
}

export async function handleFileMessage(
  message: Message<true>,
  file: FileDirectoryFile
): Promise<void> {
  const components: ButtonBuilder[] = [
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Take me there!")
      .setURL(file.link),
  ];

  if (file.script_link)
    components.push(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Script Link")
        .setURL(file.script_link)
    );

  await message.reply({
    embeds: [fileToEmbed(file)],
    components: [
      // @ts-ignore
      new ActionRowBuilder().addComponents(components),
    ],
  });
}

export function clearFileDirectoryCache() {
  rmSync(cacheDirectory, { recursive: true, force: true });
  mkdirSync(cacheDirectory);
}

export async function paginateFileList(
  message: Message<true>,
  files: FileDirectoryFile[],
  title: string = ""
): Promise<void> {
  await paginate({
    replyTo: message,
    embed: createEmbed().setTitle(title ?? "Here's the list of files!"),
    type: "field",
    data: files.map((x) => {
      return {
        name: `${x.directory}: ${x.name}`,
        value: `${x.description} [[Link](${x.link})]`,
      };
    }),
  });
}
