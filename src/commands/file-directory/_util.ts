import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
} from "discord.js";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { createEmbed } from "../../util/other";
import config from "../../config";
import { paginate } from "../../util/components/pagination";
import Logger from "../../util/Logger";

const logger = new Logger("file-directory");
const cacheDirectory = config.dataDirectory + "/file_directory";
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
  nsfw: boolean;
  handler: () => Promise<FileDirectoryFile[]>;
}

export const sources: { [key: string]: FileDirectorySource } = {
  TranceByDawn: {
    description: "Files from TranceByDawn",
    nsfw: false,
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
    nsfw: false,
    websites: ["https://www.youtube.com/@DivinitysHypno"],
    handler: async () =>
      await loadSourcesFromYoutubeChannel(
        "DivinityAxo",
        "UCXUHkFi_dN0pUmlpnMmEzyg",
      ),
  },
  SillySpirals: {
    description: "Sunny's silly files!",
    nsfw: false,
    websites: ["https://www.youtube.com/@sillysunspirals"],
    handler: async () =>
      (
        await loadSourcesFromYoutubeChannel(
          "SillySpirals",
          "UC7vReXXqP-aIjX7mQBnkQIQ",
        )
      ).filter((x) => !x.name.toLowerCase().includes("non-hypnosis")),
  },
  Nimja: {
    description: "Files from Nimja.",
    websites: [
      "https://hypno.nimja.com/listen",
      "https://www.youtube.com/@Nimja/videos",
    ],
    nsfw: true,
    handler: async () =>
      await loadSourcesFromYoutubeChannel("Nimja", "UCZJwVlZhnEIrHD0hyogRqsA"),
  },
  MrSnake: {
    description: "Files from MrSnake Hypnosis",
    nsfw: true,
    websites: ["https://www.youtube.com/@MrSnakeHypnosis/videos"],
    handler: async () =>
      await loadSourcesFromYoutubeChannel(
        "MrSnake",
        "UCJetLuqepwRQ5ELnA_18sFA",
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
      }),
    );

    files.push(...data);
  }

  return files;
}

export async function loadSourcesFromYoutubeChannel(
  directory: string,
  id: string,
): Promise<FileDirectoryFile[]> {
  const allVideos: FileDirectoryFile[] = [];
  let nextPageToken: string | null = null;

  logger.log(`Loading YouTube videos from ${id} for ${directory}`);

  do {
    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.append("key", process.env.GOOGLE_API_KEY!);
    url.searchParams.append("channelId", id);
    url.searchParams.append("part", "snippet,id");
    url.searchParams.append("order", "date");
    url.searchParams.append("type", "video");
    url.searchParams.append("maxResults", "50");

    if (nextPageToken) {
      url.searchParams.append("pageToken", nextPageToken);
    }

    const response = await axios.get(url.toString());
    const data = response.data;

    allVideos.push(
      ...data.items.map((v: any) => ({
        name: v.snippet.title,
        directory,
        description: v.snippet.description,
        tags: [],
        link: `https://www.youtube.com/watch?v=${v.id.videoId}`,
      })),
    );

    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  console.log(`Loaded ${allVideos.length} videos for ${directory}!`);
  return allVideos;
}

export async function getFilesFrom(
  directory: string,
  allowNsfw: boolean = false,
): Promise<FileDirectoryFile[]> {
  if (sources[directory].nsfw && !allowNsfw) return [];
  return (await loadAllSources()).filter((x) => x.directory === directory);
}

export async function searchFiles(
  query: string,
  allowNsfw: boolean = false,
): Promise<FileDirectoryFile[]> {
  query = query.toLowerCase();
  return (await getAllFiles(allowNsfw)).filter(
    (x) =>
      x.description.toLowerCase().includes(query) ||
      x.tags.some((y) => y.toLowerCase() === query) ||
      x.name.toLowerCase().includes(query),
  );
}

export async function getAllFiles(
  allowNsfw: boolean = false,
): Promise<FileDirectoryFile[]> {
  return (await loadAllSources()).filter(
    (x) => allowNsfw || !sources[x.directory].nsfw,
  );
}

export function getSources(allowNsfw: boolean = false): {
  [key: string]: FileDirectorySource;
} {
  return Object.fromEntries(
    Object.entries(sources).filter((x) => allowNsfw || !x[1].nsfw),
  );
}

export async function getRandomFile(
  allowNsfw: boolean = false,
): Promise<FileDirectoryFile> {
  const directories = getSources(allowNsfw);
  const files = await getFilesFrom(
    Object.keys(directories)[
      Math.floor(Math.random() * Object.keys(directories).length)
    ],
    allowNsfw,
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
  file: FileDirectoryFile,
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
        .setURL(file.script_link),
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
  title: string = "",
): Promise<void> {
  await paginate({
    message: message,
    embed: createEmbed().setTitle(
      title.length === 0 ? "Here's the list of files!" : title,
    ),
    type: "field",
    data: files.map((x) => {
      return {
        name: `${x.directory}: ${x.name}`,
        value: `${x.description} [[Link](${x.link})]`,
      };
    }),
  });
}
