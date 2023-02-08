import * as fs from "node:fs/promises"
import AdmZip from "adm-zip"

import AWS from "aws-sdk"

import { createConnection, db_name } from "../create_connection.mjs"

const s3 = new AWS.S3()
const iam = new AWS.IAM()
const rds = new AWS.RDS()
const lambda = new AWS.Lambda()

class AwsFacade {
  /**
   * @param {string} lambdaName
   * @param {Buffer} zipData
   */
  uploadLambda(lambdaName, zipData) {
    return lambda
      .updateFunctionCode({
        FunctionName: lambdaName,
        ZipFile: zipData,        
      })
      .promise()
  }
  /**
   * @param {string} lambdaName
   */
  downloadLambda(lambdaName) {
    return lambda
      .getFunction({
        FunctionName: lambdaName,
      })
      .promise()
  }
  async listLambdas() {
    return new Promise((resolve, reject) => {
      lambda.listFunctions({}, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Functions)
        }
      })
    })
  }

  /**
   * @param {string} lambdaName
   */
  async executeLambda(lambdaName) {
    return lambda
      .invoke({
        FunctionName: lambdaName,
      })
      .promise()
  }

  /**
   * @param {string} bucketName
   * @param {string} fileName
   */
  getFileFromBucket(bucketName, fileName) {
    // return the contents of the file in the s3 bucket
    const params = {
      Bucket: bucketName,
      Key: fileName,
    }
    return new Promise((resolve, reject) => {
      s3.getObject(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Body?.toString())
        }
      })
    })
  }
  /**
   * @param {string} groupName
   */
  createGroup(groupName) {
    return new Promise((resolve, reject) => {
      iam.createGroup(
        {
          GroupName: groupName,
        },
        function (err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
  }

  listUsers() {
    return new Promise((resolve, reject) => {
      iam.listUsers({}, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * @param {string} bucketName
   * @param {string} fileName
   * @param {string} fileContent
   */
  addFileToBucket(bucketName, fileName, fileContent) {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
    }
    return new Promise((resolve, reject) => {
      s3.upload(
        params,
        function (/** @type {any} */ err, /** @type {any} */ data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
  }

  // creates an s3 bucket
  /**
   * @param {any} bucketName
   */
  createS3Bucket(bucketName) {
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
  async listS3Buckets() {
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
  async listAllFilesInBucket(bucketName) {
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
   * @param {string} databaseName
   */
  getDatabaseStatus(databaseName) {
    console.log(`checking database status for "${databaseName}"`)
    // check the status of the database
    const params = {
      DBInstanceIdentifier: databaseName,
    }
    return new Promise((resolve, reject) => {
      rds.describeDBInstances(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * @param {string} databaseName
   */
  stopDatabase(databaseName) {
    console.log(`stopping database "${databaseName}"`)
    // stop the database
    const params = {
      DBInstanceIdentifier: databaseName,
    }
    return new Promise((resolve, reject) => {
      rds.stopDBInstance(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * @param {string} databaseName
   */
  async startDatabase(databaseName) {
    console.log(`starting database "${databaseName}"`)
    // start the database
    const params = {
      DBInstanceIdentifier: databaseName,
    }
    return new Promise((resolve, reject) => {
      rds.startDBInstance(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * @param {string} note
   */
  addNoteToDatabase(note) {
    // insert the note into the names table
    return new Promise((resolve, reject) => {
      const connection = createConnection()
      connection.connect(function (err) {
        const timestamp = new Date().toISOString()
        connection.query(
          `INSERT INTO names (name, value) VALUES ('${timestamp}', '${note}')`,
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

  /**
   * @returns {Promise<any[]|undefined>}
   */
  async queryDatabase() {
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

  /**
   * @param {string} user
   * @param {any} bucket
   * @param {any} file
   */
  async grantAccessToFile(user, bucket, file) {
    return this.applyPolicyToUser(user, bucket, {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PermissionForObjectOperations",
          Effect: "Allow",
          Action: ["s3:PutObject"],
          Resource: [`arn:aws:s3:::${bucket}/${file}`],
        },
      ],
    })
  }

  /**
   * @param {string} user
   * @param {any} bucket
   * @param {any} file
   */
  async revokeAccessToFile(user, bucket, file) {
    return this.applyPolicyToUser(user, bucket, {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PermissionForObjectOperations",
          Effect: "Deny",
          Action: ["s3:PutObject"],
          Resource: [`arn:aws:s3:::${bucket}/${file}`],
        },
      ],
    })
  }
  /**
   * @param {string} userName
   * @param {any} bucket
   * @param {{Version: string;Statement: {Sid: string;Effect: string;Action: string[];Resource: string[];}[];}} policy
   */
  async applyPolicyToUser(userName, bucket, policy) {
    return new Promise((resolve, reject) => {
      iam.putUserPolicy(
        {
          UserName: userName,
          PolicyName: `s3-policy-${bucket}`,
          PolicyDocument: JSON.stringify(policy),
        },
        function (err, data) {
          if (err) {
            reject(err)
          } else {
            console.log(
              `Successfully applied policy to user ${userName}: ${JSON.stringify(
                policy
              )}`
            )
            resolve(data)
          }
        }
      )
    })
  }
}

const api = new AwsFacade()

class ArgReader {
  index = 2
  read() {
    return process.argv[this.index++]
  }
}

async function main() {
  const argReader = new ArgReader()
  const [noun, verb] = (argReader.read() || "").split("-")

  const commands = [
    {
      noun: "bucket",
      verbs: {
        create: async () => {
          const bucketName = argReader.read()
          if (!bucketName) {
            console.log("Please provide a bucket name")
            return
          }
          api.createS3Bucket(bucketName)
        },
        list: async () => {
          const buckets = await api.listS3Buckets()
          console.log({ buckets })
        },
        "add-file": async () => {
          const bucketName = argReader.read()
          const fileName = argReader.read()
          if (!bucketName) {
            console.log("Please provide a bucket name")
            return
          }
          if (!fileName) {
            console.log("Please provide a file name")
            return
          }
          const fileContent = "Hello World!"
          await api.addFileToBucket(bucketName, fileName, fileContent)
        },
        "list-files": async () => {
          const bucketName = argReader.read()
          if (!bucketName) {
            console.log("Please provide a bucket name")
            return
          }
          const files = await api.listAllFilesInBucket(bucketName)
          console.log({ files })
        },
        "show-file": async () => {
          const bucketName = argReader.read()
          const fileName = argReader.read()
          if (!bucketName) {
            console.log("Please provide a bucket name")
            return
          }
          if (!fileName) {
            console.log("Please provide a file name")
            return
          }
          const fileContent = await api.getFileFromBucket(bucketName, fileName)
          console.log({ fileContent })
        },
      },
    },
    {
      noun: "database",
      verbs: {
        start: async () => {
          await api.startDatabase(db_name)
        },
        status: async () => {
          const status = await api.getDatabaseStatus(db_name)
          console.log(JSON.stringify(status, null, "  "))
        },
        stop: async () => {
          await api.stopDatabase(db_name)
        },
        note: async () => {
          const note = argReader.read()
          if (!note) {
            console.log("Please provide a note")
            return
          }
          await api.addNoteToDatabase(note)
        },
        query: async () => {
          const rows = await api.queryDatabase()
          console.log({ rows })
        },
      },
    },
    {
      noun: "user",
      verbs: {
        list: async () => {
          const users = await api.listUsers()
          console.log(JSON.stringify(users, null, "  "))
        },
        "revoke-access": async () => {
          const user = argReader.read()
          if (!user) {
            console.log("Please provide a user name")
            return
          }
          const bucket = argReader.read()
          if (!bucket) {
            console.log("Please provide a bucket name")
            return
          }

          const file = argReader.read()
          if (!file) {
            console.log("Please provide a file name")
            return
          }
          await api.revokeAccessToFile(user, bucket, file)
        },
        "grant-access": async () => {
          const user = argReader.read()
          if (!user) {
            console.log("Please provide a user name")
            return
          }
          const bucket = argReader.read()
          if (!bucket) {
            console.log("Please provide a bucket name")
            return
          }

          const file = argReader.read()
          if (!file) {
            console.log("Please provide a file name")
            return
          }
          await api.grantAccessToFile(user, bucket, file)
        },
      },
    },
    {
      noun: "lambda",
      verbs: {
        list: async () => {
          const lambdas = await api.listLambdas()
          console.log(JSON.stringify(lambdas, null, "  "))
        },
        execute: async () => {
          const lambdaName = argReader.read()
          if (!lambdaName) {
            console.log("Please provide a lambda name")
            return
          }
          const result = await api.executeLambda(lambdaName)
          console.log(JSON.stringify(result, null, "  "))
        },
        download: async () => {
          const lambdaName = argReader.read()
          if (!lambdaName) {
            console.log("Please provide a lambda name")
            return
          }
          const result = await api.downloadLambda(lambdaName)
          console.log(JSON.stringify(result, null, "  "))
          const location = result.Code?.Location
          if (!location) {
            console.log("No code found")
            return
          }
          // download the actual code
          const code = await fetch(location)
          const zipData = await code.arrayBuffer()

          // write the data to a file
          await fs.writeFile(`${lambdaName}.zip`, Buffer.from(zipData))

          // unzip the file
          const zip = new AdmZip(`${lambdaName}.zip`)
          zip.extractAllTo(`./${lambdaName}`, true)

          console.log(`"${lambdaName}" downloaded to ./${lambdaName} folder`)
        },
        upload: async () => {
          const lambdaName = argReader.read()
          if (!lambdaName) {
            console.log("Please provide a lambda name")
            return
          }
          const zip = new AdmZip()
          zip.addLocalFolder(`./${lambdaName}`)
          const zipData = zip.toBuffer()

          // write zipData to file
          await fs.writeFile(`${lambdaName}.zip`, zipData)

          const result = await api.uploadLambda(lambdaName, zipData)
          console.log(JSON.stringify(result, null, "  "))
        },
      },
    },
  ]

  // print help
  if (!noun) {
    console.log("Please provide a noun")
    console.log(
      `try one of these:\n${commands
        .map((c) => {
          const noun = c.noun
          const verbs = Object.keys(c.verbs)
          const returnCommand = verbs.map((v) => `${noun}-${v}\n`).join("")
          return returnCommand
        })
        .sort()
        .join("")}`
    )
    return
  }

  const command = commands.find((c) => c.noun === noun)
  if (!command) {
    console.log(`Unknown noun: ${noun || ""}`)
    console.log(`try one of these: ${commands.map((c) => c.noun).join(", ")}`)
    return
  }

  // @ts-ignore
  const doit = command.verbs[verb]
  if (!doit) {
    console.log(`Unknown verb: ${verb || ""}`)
    console.log(
      `try one of these: ${Object.keys(command.verbs)
        .map((v) => `${noun}-${v}`)
        .join(", ")}`
    )
    return
  }

  await doit()
}

main()
