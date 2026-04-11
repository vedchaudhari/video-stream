import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import fs from "node:fs";
import path from "node:path";

if (typeof ffmpegPath !== "string") {
    throw new Error("Invalid ffmpeg path");
}

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobePath.path);

type Resolution = {
    width: number;
    height: number;
};

export const getVideoResolution = (filePath: string): Promise<Resolution> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);

            const stream = metadata.streams.find(
                (s) => s.width && s.height
            );

            if (!stream) {
                return reject(new Error("No video stream found"));
            }

            resolve({
                width: stream.width as number,
                height: stream.height as number,
            });
        });
    });
};

const LADDER = [
    { name: "2160p", width: 3840, height: 2160, bitrate: "14000k", bw: 14_000_000 },
    { name: "1440p", width: 2560, height: 1440, bitrate: "8000k", bw: 8_000_000 },
    { name: "1080p", width: 1920, height: 1080, bitrate: "5000k", bw: 5_000_000 },
    { name: "720p", width: 1280, height: 720, bitrate: "3000k", bw: 3_000_000 },
    { name: "480p", width: 854, height: 480, bitrate: "1500k", bw: 1_500_000 },
    { name: "360p", width: 640, height: 360, bitrate: "800k", bw: 800_000 },
    { name: "240p", width: 426, height: 240, bitrate: "400k", bw: 400_000 },
    { name: "144p", width: 256, height: 144, bitrate: "200k", bw: 200_000 },
];

const getValidLadder = (inputHeight: number) => {
    return LADDER.filter((r) => r.height <= inputHeight);
};

/**
 * Write a master HLS playlist that references each variant sub-playlist.
 */
const writeMasterPlaylist = (
    outputDir: string,
    ladder: typeof LADDER
) => {
    let m3u8 = "#EXTM3U\n#EXT-X-VERSION:3\n";

    ladder.forEach((r, i) => {
        m3u8 += `#EXT-X-STREAM-INF:BANDWIDTH=${r.bw},RESOLUTION=${r.width}x${r.height}\n`;
        m3u8 += `v${i}/index.m3u8\n`;
    });

    fs.writeFileSync(path.join(outputDir, "master.m3u8"), m3u8);
};

export const transcodeToHLS = async (
    filePath: string,
    outputDir: string
): Promise<{ masterPlaylist: string }> => {
    // Get resolution
    const { height } = await getVideoResolution(filePath);

    // Filter ladder
    const ladder = getValidLadder(height);

    if (ladder.length === 0) {
        throw new Error("No valid resolutions found");
    }

    // Create output folder
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const command = ffmpeg(filePath);

        // Add outputs for each resolution
        ladder.forEach((r, i) => {
            const variantPath = path.join(outputDir, `v${i}`);

            if (!fs.existsSync(variantPath)) {
                fs.mkdirSync(variantPath, { recursive: true });
            }

            command
                .output(`${variantPath}/index.m3u8`)
                .videoCodec("libx264")
                .audioCodec("aac")
                .size(`?x${r.height}`)
                .videoBitrate(r.bitrate)
                .audioBitrate("128k")
                .outputOptions([
                    "-preset fast",
                    "-crf 23",
                    "-g 48",
                    "-sc_threshold 0",
                    "-hls_time 6",
                    "-hls_playlist_type vod",
                    `-hls_segment_filename ${variantPath}/segment%d.ts`,
                ]);
        });

        console.log("Starting transcoding...");

        command
            .on("start", (cmd) => {
                console.log("FFmpeg command:", cmd);
            })
            .on("progress", (progress) => {
                console.log(`Processing: ${progress.percent?.toFixed(2)}%`);
            })
            .on("end", () => {
                // Generate the master playlist manually so it includes ALL variants
                writeMasterPlaylist(outputDir, ladder);
                console.log("Transcoding finished");
                resolve({
                    masterPlaylist: path.join(outputDir, "master.m3u8"),
                });
            })
            .on("error", (err) => {
                console.error("Transcoding error:", err.message);
                reject(err);
            })
            .run();
    });
};