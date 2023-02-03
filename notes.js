/* read from an aws s3 bucket ca0v0001 */
var fs = require("fs")
var AWS = require("aws-sdk")
var s3 = new AWS.S3()
var bucketName = "ca0v0001"
var keyName = "notes.txt"
var params = { Bucket: bucketName, Key: keyName }

// to generate aws access key id and secret access key you need to
// create a user in aws console and then generate the keys
// https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html
// https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

// get the 1st argument from the command line
var arg = process.argv[2]

// if the argument is "read" then read from the s3 bucket
if (arg == "read") {
  s3.getObject(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      console.log(data.Body.toString("utf-8"))
      // save to local file
      fs.writeFile("notes.txt", data.Body.toString("utf-8"), function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully saved to file")
        }
      })
    }
  })
}

// if the argument is "write" then write to the s3 bucket
if (arg == "write") {
  // read notes.txt file
  var body = fs.readFileSync("notes.txt", "utf-8")
  params.Body = body
  s3.putObject(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      console.log("Successfully uploaded data to " + bucketName + "/" + keyName)
    }
  })
}
