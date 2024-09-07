import * as admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://tenjin3-c882b.firebaseio.com',
})

const db = admin.firestore()

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello from Tenjin3 backend!')
})

app.get('/your-endpoint', async (req, res) => {
  const snapshot = await db.collection('your-collection').get()
  const data = snapshot.docs.map((doc) => doc.data())
  res.json(data)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
