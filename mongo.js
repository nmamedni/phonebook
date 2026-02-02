const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

if (process.argv.length === 4) {
  console.log(`one more argument (phone number) is expected to add "${process.argv[3]}" to the phonebook`)
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://natalimamedniyazova_db_user:${password}@cluster0.461zzem.mongodb.net/personsApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 4) {
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({ name, number })

  person.save().then(result => {
    console.log(`added ${result?.name} number ${result?.number} to phonebook`)
    mongoose.connection.close()
  })
}
else {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person?.name} ${person?.number}`)
    })
    mongoose.connection.close()
  })
}