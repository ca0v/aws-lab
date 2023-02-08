import AWS from "aws-sdk"
import { createConnection } from "../../access_keys/create_connection.mjs"

const s3 = new AWS.S3()
const iam = new AWS.IAM()

class AwsFacade {
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

async function main() {
  const noun = process.argv[2]
  const verb = process.argv[3]

  const commands = [
    {
      noun: "bucket",
      verbs: {
        create: async () => {
          const bucketName = process.argv[4]
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
          const bucketName = process.argv[4]
          const fileName = process.argv[5]
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
          const bucketName = process.argv[4]
          if (!bucketName) {
            console.log("Please provide a bucket name")
            return
          }
          const files = await api.listAllFilesInBucket(bucketName)
          console.log({ files })
        },
        "show-file": async () => {
          const bucketName = process.argv[4]
          const fileName = process.argv[5]
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
          const user = process.argv[4]
          if (!user) {
            console.log("Please provide a user name")
            return
          }
          const bucket = process.argv[5]
          if (!bucket) {
            console.log("Please provide a bucket name")
            return
          }

          const file = process.argv[6]
          if (!file) {
            console.log("Please provide a file name")
            return
          }
          await api.revokeAccessToFile(user, bucket, file)
        },
        "grant-access": async () => {
          const user = process.argv[4]
          if (!user) {
            console.log("Please provide a user name")
            return
          }
          const bucket = process.argv[5]
          if (!bucket) {
            console.log("Please provide a bucket name")
            return
          }

          const file = process.argv[6]
          if (!file) {
            console.log("Please provide a file name")
            return
          }
          await api.grantAccessToFile(user, bucket, file)
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
    console.log(`try one of these: ${Object.keys(command.verbs).join(", ")}`)
    return
  }

  await doit()
}

main()
