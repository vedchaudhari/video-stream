import { useEffect, useRef, useState, useCallback } from "react";
import Hls, { Level } from "hls.js";

interface VideoPlayerProps {
  src: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const VolumeLowIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  const draggingRef = useRef(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPreviewSeekRef = useRef(-1);

  // Video state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [dragging, setDragging] = useState(false);

  // HLS quality
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Progress hover
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  // Keep dragging ref in sync
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  // ── HLS setup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setLevels(hls.levels));
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setCurrentLevel(d.level));
      return () => {
        hlsRef.current = null;
        hls.destroy();
      };
    } else {
      video.src = src;
    }
  }, [src]);

  // ── Preview video HLS setup ─────────────────────────────────────────────────

  useEffect(() => {
    const pv = previewVideoRef.current;
    if (!pv) return;

    if (Hls.isSupported()) {
      const previewHls = new Hls({
        enableWorker: false,
        maxBufferLength: 1,
        maxMaxBufferLength: 1,
      });
      previewHls.loadSource(src);
      previewHls.attachMedia(pv);
      return () => previewHls.destroy();
    } else {
      pv.src = src;
    }
  }, [src]);

  // ── Preview frame drawing ─────────────────────────────────────────────────

  useEffect(() => {
    const pv = previewVideoRef.current;
    if (!pv) return;

    const onSeeked = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(pv, 0, 0, canvas.width, canvas.height);
    };

    pv.addEventListener("seeked", onSeeked);
    return () => pv.removeEventListener("seeked", onSeeked);
  }, []);

  // ── Video events ────────────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handlers: [string, EventListener][] = [
      [
        "timeupdate",
        () => {
          if (!draggingRef.current) setCurrentTime(v.currentTime);
        },
      ],
      ["durationchange", () => setDuration(v.duration)],
      ["play", () => setPlaying(true)],
      ["pause", () => setPlaying(false)],
      ["ended", () => setPlaying(false)],
      [
        "progress",
        () => {
          if (v.buffered.length > 0)
            setBuffered(v.buffered.end(v.buffered.length - 1));
        },
      ],
      [
        "volumechange",
        () => {
          setVolume(v.volume);
          setMuted(v.muted);
        },
      ],
    ];

    handlers.forEach(([e, h]) => v.addEventListener(e, h));
    return () => handlers.forEach(([e, h]) => v.removeEventListener(e, h));
  }, []);

  // ── Auto-hide controls ──────────────────────────────────────────────────────

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    if (playing && !settingsOpen) {
      hideTimer.current = window.setTimeout(() => {
        setControlsVisible(false);
        setSettingsOpen(false);
      }, 3000);
    }
  }, [playing, settingsOpen]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [resetHideTimer]);

  // ── Fullscreen listener ─────────────────────────────────────────────────────

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          v.muted = !v.muted;
          break;
        case "ArrowLeft":
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          v.volume = Math.min(1, v.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          v.volume = Math.max(0, v.volume - 0.1);
          break;
      }
      resetHideTimer();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetHideTimer]);

  // ── Drag-to-seek on progress bar ────────────────────────────────────────────

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const bar = progressRef.current;
      const v = videoRef.current;
      if (!bar || !v || !duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      v.currentTime = pct * duration;
      setCurrentTime(pct * duration);
    };

    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, duration]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const togglePlay = () => {
    const v = videoRef.current;
    if (v) v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  };

  const toggleFullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    document.fullscreenElement
      ? document.exitFullscreen()
      : c.requestFullscreen();
  };

  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = parseFloat(e.target.value);
    if (v.volume > 0) v.muted = false;
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  const handleQualityChange = (index: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setSettingsOpen(false);
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const isAuto = hlsRef.current?.autoLevelEnabled ?? true;
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  const VolumeIcon =
    muted || volume === 0
      ? VolumeMuteIcon
      : volume < 0.5
        ? VolumeLowIcon
        : VolumeHighIcon;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`group relative bg-black select-none w-full max-w-4xl aspect-video overflow-hidden rounded-xl outline-none ${
        !controlsVisible && playing ? "cursor-none" : ""
      }`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setControlsVisible(false);
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        playsInline
      />

      {/* Hidden video for thumbnail preview */}
      <video ref={previewVideoRef} className="hidden" muted playsInline />

      {/* Big center play button when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110">
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* ── Bottom controls overlay ────────────────────────────────────────── */}
      <div
        className={`absolute bottom-0 inset-x-0 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        <div
          ref={progressRef}
          className="group/bar relative mx-3 h-[3px] hover:h-[5px] transition-[height] cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
            handleProgressClick(e);
          }}
          onMouseMove={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const time = Math.max(0, Math.min(duration, pos * duration));
            setHoverTime(time);
            setHoverX(e.clientX - rect.left);
            const pv = previewVideoRef.current;
            if (pv && Math.abs(time - lastPreviewSeekRef.current) > 0.5) {
              lastPreviewSeekRef.current = time;
              pv.currentTime = time;
            }
          }}
          onMouseLeave={() => {
            setHoverTime(null);
            lastPreviewSeekRef.current = -1;
          }}
        >
          {/* Track background */}
          <div className="absolute inset-0 rounded-full bg-white/25" />

          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/40"
            style={{ width: `${bufPct}%` }}
          />

          {/* Played (red) */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-red-600"
            style={{ width: `${pct}%` }}
          />

          {/* Thumb dot */}
          <div
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-600 rounded-full transition-opacity ${
              dragging
                ? "opacity-100"
                : "opacity-0 group-hover/bar:opacity-100"
            }`}
            style={{ left: `${pct}%` }}
          />

          {/* Hover preview thumbnail */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-full mb-2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{
                left: `clamp(80px, ${hoverX}px, calc(100% - 80px))`,
              }}
            >
              <canvas
                ref={previewCanvasRef}
                width={160}
                height={90}
                className="rounded-md border-2 border-white/80 shadow-lg bg-black"
              />
              <div className="mt-1 bg-black/90 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                {formatTime(hoverTime)}
              </div>
            </div>
          )}
        </div>

        {/* ── Button row ───────────────────────────────────────────────────── */}
        <div className="relative flex items-center gap-1 px-2 py-1.5 text-white">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Volume group: icon + expanding slider */}
          <div className="flex items-center group/vol">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <VolumeIcon />
            </button>
            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeInput}
                className="w-20 accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-xs md:text-sm tabular-nums ml-1 text-white/90">
            {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* ── Settings (quality picker) ──────────────────────────────────── */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-transform duration-300 ${
                settingsOpen ? "rotate-[30deg]" : ""
              }`}
            >
              <SettingsIcon />
            </button>

            {settingsOpen && levels.length > 0 && (
              <div className="absolute bottom-full right-0 mb-2 w-52 bg-neutral-900/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-4 py-2.5 text-sm font-semibold border-b border-white/10">
                  Quality
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {/* Auto option */}
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/10 ${
                      isAuto ? "text-white font-medium" : "text-white/60"
                    }`}
                  >
                    <span>
                      Auto
                      {isAuto && currentLevel >= 0 && (
                        <span className="text-white/50 ml-1">
                          ({levels[currentLevel].height}p)
                        </span>
                      )}
                    </span>
                    {isAuto && <CheckIcon />}
                  </button>

                  {/* Individual levels */}
                  {levels.map((lvl, i) => (
                    <button
                      key={i}
                      onClick={() => handleQualityChange(i)}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/10 ${
                        !isAuto && currentLevel === i
                          ? "text-white font-medium"
                          : "text-white/60"
                      }`}
                    >
                      <span>{lvl.height}p</span>
                      {!isAuto && currentLevel === i && <CheckIcon />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}
