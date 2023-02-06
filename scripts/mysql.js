// connect to the aws mysql database named "database-1"

const { createConnection } = require("../access_keys/create_connection")
var mysql = require("mysql")
var AWS = require("aws-sdk")
AWS.config.update({ region: "us-east-1" })

// connect to the database
var connection = createConnection()

connection.connect(function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log("connected")
    // create a name/value table
    connection.query(
      "CREATE TABLE IF NOT EXISTS names (name VARCHAR(255), value VARCHAR(255))",
      function (err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log("created")
        }
      }
    )

    // insert a row
    connection.query(
      "INSERT INTO names (name, value) VALUES ('foo', 'bar')",
      function (err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log("inserted")
        }
      }
    )

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
