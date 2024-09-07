import { useState } from 'react'

function NewVideo() {
  const [japaneseText, setJapaneseText] = useState('')
  const [status, setStatus] = useState('')
  const [translationData, setTranslationData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true) // Set loading to true when the request starts
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
        setTranslationData(data.data) // Store the translation data
      } else {
        setStatus('Translation failed.')
        setTranslationData(null)
      }
    } catch (error) {
      setStatus('An error occurred.')
      setTranslationData(null)
    } finally {
      setLoading(false) // Set loading to false when the request completes
    }
  }

  return (
    <div>
      <h1>Add New Video</h1>
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
