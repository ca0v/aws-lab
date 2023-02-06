// import child_process from "child_process"
child_process = require("child_process")

// this utility will rotate the access keys for a given user
// this means it will create a new access key and then delete the old one
// if there are already two access keys, it will delete the oldest one 1st
// If it deletes the access key that is currently being used, it will
// update the credentials file with the newer access key before deleting

// to run this utility, you need to have the aws cli installed
// https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html

function main() {
  // get the user name from the command line
  var userName = process.argv[2]
  if (!userName) throw new Error("ERROR: no user name provided")

  // get the access keys for the given user
  var accessKeys = getAccessKeys(userName)

  // if there are two access keys, delete the oldest one
  if (accessKeys.length == 2) {
    // get the newest access key
    var keepThisKey = accessKeys[0]
    var deleteThisKey = accessKeys[1]
    if (accessKeys[0].CreateDate < accessKeys[1].CreateDate) {
      keepThisKey = accessKeys[1]
      deleteThisKey = accessKeys[0]
    }

    // if the newest is Inactive, delete that one instead
    if (keepThisKey.Status == "Inactive") {
      // swap the access keys
      var temp = keepThisKey
      keepThisKey = deleteThisKey
      deleteThisKey = temp
    }

    // update the credentials file with the newest access key
    updateCredentialsFile(userName, keepThisKey)

    // delete the oldest access key
    deleteAccessKey(userName, deleteThisKey)
    accessKeys = getAccessKeys(userName)
  }

  if (accessKeys.length == 1) {
    var deleteThisKey = accessKeys[0]
    // create a new access key
    var newAccessKey = createAccessKey(userName)

    // update the credentials file with the new access key
    updateCredentialsFile(userName, newAccessKey)

    // delete the old access key
    deleteAccessKey(userName, deleteThisKey)
    accessKeys = getAccessKeys(userName)
  }

  // if there are no access keys, create one (but how?!)
  if (accessKeys.length == 0) {
    var newAccessKey = createAccessKey(userName)
  }

  // assert there is exactly one access key now
  if (accessKeys.length != 1) {
    accessKeys = getAccessKeys(userName)
    console.error("ERROR: there should be exactly one access key now")
  }
}

function getAccessKeys(userName) {
  const cmd = `aws iam list-access-keys --user-name ${userName}`
  const result = runCommand(cmd)
  const accessKeys = JSON.parse(result).AccessKeyMetadata
  return accessKeys
}

function deleteAccessKey(userName, accessKeyId) {
  const cmd = `aws iam delete-access-key --user-name ${userName} --access-key-id ${accessKeyId.AccessKeyId}`
  runCommand(cmd)
}

function createAccessKey(userName) {
  var cmd = "aws iam create-access-key --user-name " + userName
  var result = runCommand(cmd)
  var accessKey = JSON.parse(result).AccessKey
  return accessKey
}

function updateCredentialsFile(userName, accessKey) {
  var cmd = `aws --profile ${userName} configure set aws_access_key_id ${accessKey.AccessKeyId}`
  runCommand(cmd)
  if (accessKey.SecretAccessKey) {
    cmd = `aws  --profile ${userName} configure set aws_secret_access_key ${accessKey.SecretAccessKey}`
    runCommand(cmd)
  }
}

function runCommand(cmd) {
  console.log(cmd)
  var result = child_process.execSync(cmd)
  return result.toString()
}

main()
