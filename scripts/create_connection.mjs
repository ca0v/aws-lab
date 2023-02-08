import * as DOTENV from "dotenv"
DOTENV.config({
  path: "../../access_keys/.env",
  debug: true,
})

import { createConnection as _createConnection } from "mysql"
import pkg from "aws-sdk"
const { config } = pkg
config.update({ region: "us-east-1" })

const db_name = process.env.AWS_DBS_DATABASE_01_NAME || ""
const db_host = process.env.AWS_DBS_DATABASE_01_HOST || ""
const db_user = process.env.AWS_DBS_DATABASE_01_ADMIN_USER
const db_password = process.env.AWS_DBS_DATABASE_01_ADMIN_PASSWORD

function createConnection() {
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

export { createConnection, db_name, db_host }
