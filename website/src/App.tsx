import VideoPlayer from "./components/VideoPlayer";

const App = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <VideoPlayer src="http://localhost:3000/api/videos/bike-2c8abfad-5ff0-4b8f-b4d0-fa1b1ed0b8ab/master.m3u8" />
    </div>
  );
};

export default App;
