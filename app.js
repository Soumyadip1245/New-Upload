var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var flutter = require('./routes/flutterproject')
var PORT = process.env.port || 8080
var app = express()
app.use(cors())
app.use(bodyParser.json())
app.use('/flutter', flutter)
app.listen(PORT, () => {
    console.log(`Port: ${PORT}`)
})
