const express = require('express')
const morgan = require('morgan')
// const cors = require('cors')
const app = express()

morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
morgan.token('date', function (req, res) { return new Date().toString() })

// var corsOptions = {
//   origin: 'http://localhost:5174',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

app.use(express.json())
app.use(express.static('dist'))
// app.use(cors(corsOptions))
// app.use(morgan('tiny'))
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content :date'))
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'))

let phonebook = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get(`/api/persons`, (request, response) => {
  console.log("---Request headers:", request.headers)
  response.status(200).json(phonebook)
})

app.get(`/info`, (request, response) => {
  console.log(request.headers)
  response.send(
    `<p>Phonebook has info for ${phonebook.length} people</p>
     <p>${new Date().toString()}</p>
    `
  )
})

app.get(`/api/persons/:id`, (request, response) => {
  const id = request.params.id
  const entry = phonebook.find(item => item?.id === id)
  if (entry === undefined) {
    // response.statusMessage = `Entry ${id} doesn't exist on the server`;
    return response.status(404).end()
  }
  console.log(`---Found entry ${id}`)
  response.status(200).json(entry)
})

app.delete(`/api/persons/:id`, (request, response) => {
  const id = request.params.id
  phonebook = phonebook.filter(item => item?.id !== id)
  // if (entry === undefined) {
  //   return response.status(404).end()
  // }
  response.status(204).end()
})

app.post(`/api/persons`, (request, response) => {
  // console.log("---Post request headers: = ", request.headers)
  console.log("---Post request headers: host = ", request.get("host"))
  console.log("---Post request headers: origin = ", request.get("origin"))
  console.log("---Post request headers: referer = ", request.get("referer"))
  console.log("---Post request headers: content-length = ", request.headers["content-length"])
  console.log("---Post request headers: content-type = ", request.get("content-type"))
  console.log("----Post request body = ", request.body)
  const name = request?.body?.name
  if (!name) {
    return response.status(400).json({error: 'request must contain name'})
  }
  if (!request?.body?.number) {
    return response.status(400).json({error: 'request must contain number'})
  }
  if (phonebook.some(item => item.name === name)) {
    return response.status(400).json({error: 'name must be unique'})
  }
  
  const id = parseInt(Math.random()*1000)
  const entry = {
    name: name,
    number: request.body.number,
    id: String(id)
  }
  phonebook = phonebook.concat(entry)
  response.status(200).json(entry)
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})