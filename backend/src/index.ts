import admin from 'firebase-admin'
import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { OpenAI } from 'openai'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'

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

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send('Hello from Tenjin3 backend!')
})

interface TranslationRequest extends Request {
  body: {
    text: string
  }
}

const splitJapaneseText = (text: string, maxChunkSize = 1000): string[] => {
  // List of common sentence-ending particles/phrases in Japanese
  const sentenceEndMarkers =
    /か|ね|よ|だ|です|ます|ました|ましたか|でした|。|！|？|．|！|？/g

  const chunks: string[] = []
  let currentChunk = ''

  for (let i = 0; i < text.length; i++) {
    currentChunk += text[i]

    // If current chunk exceeds max chunk size, try to break at the nearest sentence end marker
    if (currentChunk.length >= maxChunkSize) {
      const remainingText = text.slice(i + 1)
      const nextSentenceEnd = remainingText.search(sentenceEndMarkers)

      if (nextSentenceEnd !== -1) {
        // If a sentence end marker is found, split here
        const sentenceEndIndex = i + nextSentenceEnd + 1
        currentChunk += text.slice(i + 1, sentenceEndIndex)
        chunks.push(currentChunk.trim())
        currentChunk = ''
        i = sentenceEndIndex - 1 // Continue after this sentence end
      } else {
        // If no sentence end marker is found, just cut the text at the max chunk size
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
    }
  }

  // Push any remaining text as the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

const translations = new Map<string, { chunks: string[]; progress: any[] }>()

app.post('/api/translate', (req: TranslationRequest, res: Response) => {
  const { text } = req.body
  const chunks = splitJapaneseText(text, 1000)
  const id = uuidv4()

  translations.set(id, { chunks, progress: [] })

  res.json({ id, totalChunks: chunks.length })
})

app.get('/api/translate/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const translation = translations.get(id)

  if (!translation) {
    return res.status(404).json({ error: 'Translation not found' })
  }

  const { chunks, progress } = translation

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.write(`data: ${JSON.stringify({ totalChunks: chunks.length })}\n\n`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
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
            content: `Translate the following Japanese text into a data structure where the keys are the timestamps, then the values are keys of romanji and english, where the value of the romanji is an array of these { word: "Jibun", translation: "My" } and the value of the english translation is just the translated phrase. Ignore any text that is not Japanese: ${chunk}`,
          },
        ],
        stream: false,
      })

      const content = response.choices[0].message.content
      if (content) {
        const cleanedContent = content.replace(/```json|```/g, '').trim()
        const translationData = JSON.parse(cleanedContent)
        progress.push({ chunkIndex: i, data: translationData })
        res.write(
          `data: ${JSON.stringify({
            chunkIndex: i,
            data: translationData,
          })}\n\n`
        )
      } else {
        throw new Error('Response content is null')
      }
    } catch (error) {
      console.error(error)
      progress.push({ chunkIndex: i, error: (error as Error).message })
      res.write(
        `data: ${JSON.stringify({
          chunkIndex: i,
          error: (error as Error).message,
        })}\n\n`
      )
    }
  }

  res.write('data: {"done": true}\n\n')
  res.end()
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
