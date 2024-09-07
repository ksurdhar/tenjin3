import { useState } from 'react'
import { db } from './firebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function NewVideo() {
  const [japaneseText, setJapaneseText] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('')
  const [translationData, setTranslationData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: japaneseText }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(data)
        setStatus('Translation successful.')
        setTranslationData(data.data)

        if (typeof data.data === 'object' && data.data !== null) {
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
        } else {
          setStatus('Translation data is not in the expected format.')
        }
      } else {
        setStatus('Translation failed.')
        setTranslationData(null)
      }
    } catch (error) {
      setStatus('An error occurred.')
      console.log('error', error)
      setTranslationData(null)
    } finally {
      setLoading(false)
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
      {loading && <p>Loading...</p>} <p>{status}</p>
      {translationData && <pre>{JSON.stringify(translationData, null, 2)}</pre>}
    </div>
  )
}

export default NewVideo
