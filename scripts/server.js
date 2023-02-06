// configure an express app
const { createConnection } = require("./create_connection.js")

var express = require("express")
var app = express()

const DEFAULT_PORT = 3000

/* 
The environment variable PORT is set from bash by running the following command:

>export PORT=3000

You can check the environment variable PORT by running the following command:

>echo $PORT

You can see all environment variables by running the following command:

>env

*/
const PORT = process.env.PORT || DEFAULT_PORT

// serve static files from the "public" folder
app.use(express.static("public"))

// query the database
app.get("/api", function (req, res) {
  // connect to the aws mysql database named "database-1"
  const connection = createConnection()
  connection.connect(function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log("connected")

      // query the names table
      connection.query("SELECT * FROM names", function (err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log("queried")
          res.send(result)
        }
      })

      // disconnect
      connection.end(function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("disconnected")
        }
      })
    }
  })
})

// serve the index.html file for all other requests
app.get("*", function (req, res) {
  res.sendFile(__dirname + "/public/index.html")
})

// start an express app on port 3000
app.listen(PORT, function () {
  console.log(`server started on port ${PORT}`)
})
