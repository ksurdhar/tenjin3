import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null)

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData()
      setData(result)
    }
    getData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/your-endpoint`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json()
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
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
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
