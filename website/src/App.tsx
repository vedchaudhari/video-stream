const App = () => {
  return (
    <div>
      <video width={600} controls>
        <source
          src="http://localhost:3000/api/upload/video"
          type="video/mp4"
        />
      </video>
    </div>
  )
}

export default App