// invokes this aws lambda function:
// arn:aws:lambda:us-east-1:255691332024:function:Notes

var AWS = require("aws-sdk")
AWS.config.update({ region: "us-east-1" })

function invokeLambda() {
  var lambda = new AWS.Lambda()
  var params = {
    FunctionName: "Notes",
    InvocationType: "RequestResponse",
    LogType: "Tail",
  }
  lambda.invoke(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      console.log(data)
    }
  })
}

invokeLambda()
