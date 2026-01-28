require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
// const cors = require('cors')
const Person = require('./models/person')

const app = express()

// app.use((req, res, next) => {
//   res.set({
//       "Content-Security-Policy": "default-src *",
//   })
//   next();
// });

morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
morgan.token('date', function (req, res) { return new Date().toString() })

app.use(express.static('dist'))
app.use(express.json())
// var corsOptions = {
//   origin: 'http://localhost:5174',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
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
  Person.find({})
  .then(people => {
    console.log("people=", people)
    response.status(200).json(people)  
  })
})

app.get(`/info`, (request, response) => {
  console.log("--- get Info request headers:", request.headers)
  Person.countDocuments({})
  .then(count => {
    console.log("count", count)
    response.send(
      `<p>Phonebook has info for ${count} people</p>
       <p>${new Date().toString()}</p>
      `
    )
  })
})

app.get(`/api/persons/:id`, (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        console.log(`---Found entry ${person?.id}`)
        response.status(200).json(person)
      }
      else {
        // response.statusMessage = `Entry ${request.params.id} doesn't exist on the server`;
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete(`/api/persons/:id`, (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put(`/api/persons/:id`, (request, response, next) => {
  const name = request?.body?.name
  const number = request?.body?.number
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }
      person.name = name
      person.number = number
      return person.save()
            .then(updatedPerson => {
              response.json(updatedPerson)
            })
    })
    .catch(error => next(error))
})

app.post(`/api/persons`, (request, response, next) => {
  console.log("---Post request headers: host = ", request.get("host"))
  console.log("---Post request headers: origin = ", request.get("origin"))
  console.log("---Post request headers: referer = ", request.get("referer"))
  console.log("---Post request headers: content-length = ", request.headers["content-length"])
  console.log("---Post request headers: content-type = ", request.get("content-type"))
  console.log("----Post request body = ", request.body)
  const name = request?.body?.name
  const number = request?.body?.number
  if (!name) {
    return response.status(400).json({error: 'request must contain name'})
  }
  if (!number) {
    return response.status(400).json({error: 'request must contain number'})
  }
  // if (phonebook.some(item => item.name === name)) {
  //   return response.status(400).json({error: 'name must be unique'})
  // }
  
  const person = new Person({ name, number })
  person.save()
  .then(savedPerson => {
    response.status(200).json(savedPerson)
  })
  .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === "CastError") {
    return response.status(400).send({error: "malformatted id"})
  }

  next(error)
}
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})