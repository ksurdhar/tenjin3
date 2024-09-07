import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello from Tenjin3 backend!')
})

app.get('/your-endpoint', (req, res) => {
  res.json({ message: 'Hello from the bajksdas!' })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
