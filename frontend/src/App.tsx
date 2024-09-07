import { useEffect, useState } from 'react'
import './App.css'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

initializeApp(firebaseConfig)
const db = getFirestore()

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, 'videos'))
      const data = querySnapshot.docs.map((doc) => doc.data())
      setData(data)
    }
    getData()
  }, [])

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
