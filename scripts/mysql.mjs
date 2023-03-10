// connect to the aws mysql database named "database-1"

import { createConnection } from "../access_keys/create_connection.mjs"

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
