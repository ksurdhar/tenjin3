import { useState } from 'react'
import { db } from './firebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function NewVideo() {
  const [japaneseText, setJapaneseText] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('')
  const [translationData, setTranslationData] = useState<Record<
    string,
    any
  > | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({
    totalChunks: 0,
    completedChunks: 0,
  })

  const handleSubmit = async () => {
    setLoading(true)
    setStatus('')
    setTranslationData(null)
    setProgress({ totalChunks: 0, completedChunks: 0 })

    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: japaneseText }),
    })

    const { id, totalChunks } = await response.json()
    setProgress((prev) => ({ ...prev, totalChunks }))

    const eventSource = new EventSource(
      `http://localhost:3000/api/translate/${id}`
    )

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data)

      if (data.totalChunks) {
        setProgress((prev) => ({ ...prev, totalChunks: data.totalChunks }))
      } else if (data.chunkIndex !== undefined) {
        setProgress((prev) => ({
          ...prev,
          completedChunks: prev.completedChunks + 1,
        }))

        if (data.data) {
          setTranslationData((prev) => ({ ...prev, ...data.data }))

          const videoDoc = await addDoc(collection(db, 'videos'), {
            title,
            uploadedAt: serverTimestamp(),
          })

          const phrasesCollection = collection(
            db,
            'videos',
            videoDoc.id,
            'phrases'
          )
          for (const [key, value] of Object.entries(data.data)) {
            if (typeof value === 'object' && value !== null) {
              await addDoc(phrasesCollection, { timestamp: key, ...value })
            } else {
              console.log(`Skipping invalid value at ${key}:`, value)
            }
          }
        } else if (data.error) {
          setStatus(`Error in chunk ${data.chunkIndex}: ${data.error}`)
        }
      } else if (data.done) {
        setLoading(false)
        setStatus('Translation completed.')
        eventSource.close()
      }
    }

    eventSource.onerror = (error) => {
      setLoading(false)
      setStatus('An error occurred.')
      console.log('error', error)
      eventSource.close()
    }
  }

  return (
    <div>
      <h1>Add New Video</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter video title"
      />
      <textarea
        value={japaneseText}
        onChange={(e) => setJapaneseText(e.target.value)}
        placeholder="Paste Japanese text here"
      />
      <button onClick={handleSubmit} disabled={loading}>
        Submit
      </button>
      {loading && (
        <p>
          Loading... {progress.completedChunks}/{progress.totalChunks} chunks
          completed
        </p>
      )}
      <p>{status}</p>
      {translationData && <pre>{JSON.stringify(translationData, null, 2)}</pre>}
    </div>
  )
}

export default NewVideo
