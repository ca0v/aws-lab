// Rotate the access keys for a given user
//
// PRE: There may be 0-2 access keys for the given user
// If no access keys exist, create one.
// If one access key exists, create a new one before deleting the old one.
// If two access keys exist, delete one, create one, delete one.
//
// POST: There will only be one access key once complete
//
// Requirements:
// to run this utility, you need to have the aws cli installed
// https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html

child_process = require("child_process")

function main() {
  // get the user name from the command line
  const userName = process.argv[2]
  if (!userName) throw new Error("ERROR: no user name provided")

  // get the access keys for the given user
  let accessKeys = getAccessKeys(userName)

  // if there are two access keys, delete the oldest one
  if (accessKeys.length == 2) {
    // get the newest access key
    let keepThisKey = accessKeys[0]
    let deleteThisKey = accessKeys[1]
    if (accessKeys[0].CreateDate < accessKeys[1].CreateDate) {
      keepThisKey = accessKeys[1]
      deleteThisKey = accessKeys[0]
    }

    // if the newest is Inactive, delete that one instead
    if (keepThisKey.Status == "Inactive") {
      // swap the access keys
      const temp = keepThisKey
      keepThisKey = deleteThisKey
      deleteThisKey = temp
    }

    // update the credentials file with the newest access key
    updateCredentialsFile(keepThisKey)

    // delete the oldest access key
    deleteAccessKey(deleteThisKey)
    accessKeys = getAccessKeys(userName)
  }

  if (accessKeys.length == 1) {
    const deleteThisKey = accessKeys[0]
    // create a new access key
    const newAccessKey = createAccessKey(userName)

    // update the credentials file with the new access key
    updateCredentialsFile(newAccessKey)

    // delete the old access key
    deleteAccessKey(deleteThisKey)
    accessKeys = getAccessKeys(userName)
  }

  // if there are no access keys, create one
  if (accessKeys.length == 0) {
    const newAccessKey = createAccessKey(userName)
    // update the credentials file with the new access key
    updateCredentialsFile(userName, newAccessKey)
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

function deleteAccessKey(accessKey) {
  const userName = accessKey.UserName
  const cmd = `aws iam delete-access-key --user-name ${userName} --access-key-id ${accessKey.AccessKeyId}`
  runCommand(cmd)
}

function createAccessKey(userName) {
  const cmd = `aws iam create-access-key --user-name ${userName}`
  const result = runCommand(cmd)
  return JSON.parse(result).AccessKey
}

function updateCredentialsFile(accessKey) {
  const userName = accessKey.UserName
  runCommand(
    `aws --profile ${userName} configure set aws_access_key_id ${accessKey.AccessKeyId}`
  )
  if (accessKey.SecretAccessKey) {
    runCommand(
      `aws  --profile ${userName} configure set aws_secret_access_key ${accessKey.SecretAccessKey}`
    )
  }
}

function runCommand(cmd) {
  console.log(cmd)
  var result = child_process.execSync(cmd)
  return result.toString()
}

main()
