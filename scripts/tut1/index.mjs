import AWS from "aws-sdk"
import { createConnection } from "../../access_keys/create_connection.mjs"

const s3 = new AWS.S3()

// creates an s3 bucket
/**
 * @param {any} bucketName
 */
function createS3Bucket(bucketName) {
  s3.createBucket(
    {
      Bucket: bucketName,
      ACL: "public-read",
    },
    function (err, data) {
      if (err) {
        console.log("Error", err)
      } else {
        console.log("Success", data.Location)
      }
    }
  )
}

/**
 * @return {Promise<AWS.S3.Buckets|undefined>}
 */
async function listS3Buckets() {
  return new Promise((resolve, reject) => {
    s3.listBuckets(function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.Buckets)
      }
    })
  })
}

/**
 *
 * @param {*} bucketName
 * @returns {Promise<AWS.S3.Object[]|undefined>}
 */
async function listAllFilesInBucket(bucketName) {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(
      {
        Bucket: bucketName,
      },
      function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Contents)
        }
      }
    )
  })
}

/**
 * @returns {Promise<any[]|undefined>}
 */
async function queryDatabase() {
  return new Promise((resolve, reject) => {
    // connect to the mysql database
    const connection = createConnection()
    connection.connect(function (err) {
      connection.query("SELECT * FROM names", function (err, result) {
        connection.end()
        if (err) {
          reject(err)
          return
        }
        resolve(result)
        return
      })
    })
  })
}

async function main() {
  // read the bucket name from args
  const bucketName = process.argv[2]
  if (!bucketName) {
    console.log("Please provide a bucket name")
    return
  }

  const buckets = await listS3Buckets()
  if (!buckets?.find((b) => b.Name === bucketName)) {
    console.log("Bucket not found, creating new bucket")
    createS3Bucket(bucketName)
  }

  const files = await listAllFilesInBucket(bucketName)
  console.log({ files })

  // read rows from the database
  const rows = await queryDatabase()
  console.log({ rows })
  if (!rows) return
  // convert the rows to csv and write them to the s3 bucket
  const csv = rows
    .map((row) => {
      const values = Object.values(row)
      console.log(JSON.stringify(row))
      return values.join(",")
    })
    .join("\n")
  console.log({ csv })

  // write the csv to the s3 bucket

  await s3
    .putObject({
      Bucket: bucketName,
      Key: "data.csv",
      Body: csv,
    })
    .promise()

  // read the csv from the s3 bucket
  const data = await s3
    .getObject({
      Bucket: bucketName,
      Key: "data.csv",
    })
    .promise()

  // read the body from data
  const body = data.Body?.toString()
  console.log({ body })

  // inject the current date into the database
  const date = new Date().toISOString()
  await new Promise((resolve, reject) => {
    const connection = createConnection()
    connection.connect(function (err) {
      if (err) {
        reject(err)
        return
      }

      connection.query(
        `INSERT INTO names (name, value) VALUES ('${date}', '${date}')`,
        function (err, result) {
          connection.end()
          if (err) {
            reject(err)
            return
          }
          resolve(result)
          return
        }
      )
    })
  })
}

main()
