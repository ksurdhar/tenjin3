import admin from 'firebase-admin'
import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { OpenAI } from 'openai'
// import { collection, addDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { error } from 'console'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

const openaiApiKey = process.env.OPENAI_API_KEY
if (!openaiApiKey) {
  throw new Error('API keys are missing! Check your .env file.')
}
const openai = new OpenAI({
  apiKey: openaiApiKey,
})

const app = express()
const port = process.env.PORT || 3000

// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   }),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// })

// const db = admin.firestore()

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send('Hello from Tenjin3 backend!')
})

app.get('/your-endpoint', async (req, res) => {
  // const snapshot = await db.collection('your-collection').get()
  // const data = snapshot.docs.map((doc) => doc.data())
  // res.json(data)
})

interface TranslationRequest extends Request {
  body: {
    text: string
  }
}

app.post('/api/translate', async (req: TranslationRequest, res: Response) => {
  const { text } = req.body

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an endpoint that translates Japanese text into a reliable data structure for a web app to consume.',
        },
        {
          role: 'user',
          content: `Translate the following Japanese text into a data structure where the keys are the timestamps, then the values are keys of romanji and english, where the value of the romanji is an array of these { word: "Jibun", translation: "My" } and the value of the english translation is just the translated phrase: ${text}`,
        },
      ],
      stream: false,
    })

    const content = response.choices[0].message.content

    console.log('translation', content)

    if (content) {
      const cleanedContent = content.replace(/```json|```/g, '').trim()
      const translationData = JSON.parse(cleanedContent)
      res.json({ success: true, data: translationData })
    } else {
      throw new Error('Response content is null')
    }
  } catch (error) {
    console.error(error)
    res.json({ success: false, error: (error as Error).message })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
