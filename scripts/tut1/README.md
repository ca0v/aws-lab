# Tutorial 1: Getting Started

Creates a DSL to play with the AWS S3, RDS and IAM services.

## Concerns

### Where to store sensitive data?

The AWS CLI stores sensitive data in the `~/.aws/credentials` file.
The AWS CLI also stores data in the `~/.aws/config` file.
The AWS CLI also looks for certain environment variables, such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION`.

I am trying to understand the best way to retrieve this information so as to not store it in code.

These are the best practices for accessing data in the `~/.aws/credentials` file:

Example of accessing using the SDK:

```javascript
const AWS = require('aws-sdk');
const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
```

Example of accessing using the CLI:

```bash
>aws s3 ls --profile default
```

AWS DBS also has credentials that can be stored in the `~/.aws/credentials` file.  To store the master-user-password in ~/.aws.credential, run the following AWS CLI command:

```bash
>aws rds modify-db-instance --db-instance-identifier ca0v0001 --master-user-password <password>
```

## Commands

bucket-create
bucket-list
bucket-add-file
bucket-list-files
bucket-show-file
database-start
database-status
database-stop
database-note
database-query
lambda-list
lambda-execute
lambda-download
lambda-upload
user-list
user-revoke-access
user-grant-access

These commands are implemented in [index.mjs](./index.mjs) and I used Copilot to generate them.

### database-* commands

The `DBInstanceIdentifier` is not the same as the `DBName`.  For this tutorial, the identifier is `?`.

## TODO For this Tutorial

* Integrate with AWS Lambda
  * Create a lambda function
  * Create a REST API to access the lambda function
  * Apply access control to the REST API

## Future Tuts

### Explore AWS API Gateway (see [this](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html))

The AWS API Gateway is a service that allows you to create REST APIs that can be used to access AWS Lambda functions.

### Explore AWS CloudFormation (see [this](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html))

The AWS CloudFormation is a service that allows you to create templates that can be used to create AWS resources.

### Explore AWS CloudWatch (see [this](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html))

The AWS CloudWatch is a service that allows you to monitor AWS resources.

### Explore AWS CloudTrail (see [this](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html))

The AWS CloudTrail is a service that allows you to monitor AWS API calls.

### Explore AWS CloudFront (see [this](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html))

The AWS CloudFront is a service that allows you to create a CDN.

### Explore AWS CloudSearch (see [this](https://docs.aws.amazon.com/cloudsearch/latest/developerguide/what-is-cloudsearch.html))

The AWS CloudSearch is a service that allows you to create a search engine.

### Explore AWS CloudHSM (see [this](https://docs.aws.amazon.com/cloudhsm/latest/userguide/what-is-cloudhsm.html))

The AWS CloudHSM is a service that allows you to create a hardware security module.

### Explore AWS Cloud9 (see [this](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html))

The AWS Cloud9 is a service that allows you to create a cloud-based IDE.

### Explore AWS CloudDirectory (see [this](https://docs.aws.amazon.com/clouddirectory/latest/developerguide/what_is_cloud_directory.html))

The AWS CloudDirectory is a service that allows you to create a cloud-based directory.
