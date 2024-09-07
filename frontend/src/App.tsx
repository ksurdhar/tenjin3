import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebaseConfig'
import { Link } from 'react-router-dom'
import NewVideo from './NewVideo'
import VideoDetail from './VideoDetail'

function Home() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')

  useEffect(() => {
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, 'videos'))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData(data)
    }
    getData()
  }, [])

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(event.target.value)
  }

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {data && (
        <select value={selectedVideo} onChange={handleSelectChange}>
          <option value="">Select a video</option>
          {data.map((video) => (
            <option key={video.id} value={video.id}>
              {video.title}
            </option>
          ))}
        </select>
      )}
      {selectedVideo && <Link to={`/video/${selectedVideo}`}>Go to Video</Link>}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Link to="/new-video">Add New Video</Link>
    </>
  )
}

function About() {
  return <h1>About Page</h1>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/new-video" element={<NewVideo />} />
        <Route path="/video/:id" element={<VideoDetail />} />
      </Routes>
    </Router>
  )
}

export default App
