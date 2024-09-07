import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const [video, setVideo] = useState<any>(null)
  const [phrases, setPhrases] = useState<any[]>([])
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  useEffect(() => {
    const fetchVideo = async () => {
      if (id) {
        const docRef = doc(db, 'videos', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setVideo(docSnap.data())
          console.log('video', docSnap.data())
        } else {
          console.log('No such document!')
        }
      }
    }

    const fetchPhrases = async () => {
      if (id) {
        const phrasesCollectionRef = collection(db, 'videos', id, 'phrases')
        const phrasesQuery = query(phrasesCollectionRef, orderBy('timestamp'))
        const phrasesSnapshot = await getDocs(phrasesQuery)
        const phrasesData = phrasesSnapshot.docs.map((doc) => doc.data())
        console.log('phrasesData', phrasesData)
        setPhrases(phrasesData)
      }
    }

    fetchVideo()
    fetchPhrases()
  }, [id])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setCurrentPhraseIndex((prevIndex) =>
          Math.min(prevIndex + 1, phrases.length - 1)
        )
      } else if (event.key === 'ArrowLeft') {
        setCurrentPhraseIndex((prevIndex) => Math.max(prevIndex - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [phrases])

  const currentPhrase = phrases[currentPhraseIndex]

  return (
    <div>
      {video ? (
        <div>
          <h1>{video.title}</h1>
          {currentPhrase ? (
            <div>
              <h2>
                {currentPhrase.romanji.map((wordObj: { word: string }) => (
                  <span>{wordObj.word} </span>
                ))}
              </h2>
              <p>{currentPhrase.english}</p>
            </div>
          ) : (
            <p>Loading phrases...</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default VideoDetail
