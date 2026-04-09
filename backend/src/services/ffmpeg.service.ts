import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

if (typeof ffmpegPath !== "string") {
    throw new Error("Invalid ffmpeg path");
}

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobePath.path);

type Resolution = {
    width: number,
    height: number
}

export const getVideoResolution = (filePath: string): Promise<Resolution> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if(err) return reject(err);

            const stream = metadata.streams.find(
                s => s.width && s.height
            );

            if(!stream){
                return reject(new Error("No video stream found"));
            }

            resolve({
                width: stream.width as number,
                height: stream.height as number
            })
        })
    })
}

const LADDER = [
    {height: 1080, bitrate:"5000k"},
    {height: 720, bitrate: "3000k"},
    {height: 480, bitrate: "1500k"}
]

const transcodeToHLS = (filePath: string, outputDir: string, ladder: typeof LADDER) => {
    // return new Promise
}
