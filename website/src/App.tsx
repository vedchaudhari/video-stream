import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const App = () => {

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource("http://localhost:3000/api/videos/bike/master.m3u8");
      hls.attachMedia(videoRef.current);
    } else {
      if (videoRef.current) {
        videoRef.current.src = "http://localhost:3000/api/videos/bike/master.m3u8";
      }
    }
  }, []);

  return <video ref={videoRef} controls width={600} />
}

export default App;