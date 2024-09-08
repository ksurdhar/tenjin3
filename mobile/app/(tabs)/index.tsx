import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebaseConfig'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

interface Video {
  id: string
  title: string
}

export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    const fetchVideos = async () => {
      const querySnapshot = await getDocs(collection(db, 'videos'))
      const videoData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }))
      setVideos(videoData)
    }

    fetchVideos()
  }, [])

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Videos
      </ThemedText>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.videoItem}>
            <ThemedText>{item.title}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  videoItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
})
