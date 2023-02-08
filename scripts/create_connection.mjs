import { createConnection as _createConnection } from "mysql"
import pkg from "aws-sdk"
const { config } = pkg

// secret configuration data is best stored in a separate file.
// this file is not included in the repository.
import { db_host, db_user, db_password } from "../access_keys/access_keys.mjs"

function createConnection() {
  // get the region from the environment variable
  const region = process.env.AWS_REGION
  console.log({ region })

  config.update({ region: "us-east-1" })

  // connect to the database
  var connection = _createConnection({
    host: db_host,
    port: 3306,
    user: db_user,
    password: db_password,
    database: "test",
  })

  return connection
}

export { createConnection }
