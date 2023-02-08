# AWS-LAB

Here I track my learning progress in Amazon Web Services.

## AWS - IAM

* Created [AWS_IAM.md](docs/AWS_IAM.md) to document IAM.
* A "principal" is a user
* Used identity and access management to create a user and give it access to the AWS console as well as S3 buckets.
* Created and admin super-user using IAM Identity Center
* Created CLI_BOSS user for the AWS CLI (default)

## AWS - S3

* Created an S3 Bucket
* Wrote code to read and write "notes.txt" to the S3 bucket
* CLI to view content of a bucket object notes.txt:

    >aws s3api get-object --bucket ca0v0001 --key notes.txt notes.txt
    >aws --profile corey_01 s3api get-object --bucket ca0v0005 --key test.txt test.txt

### S3 Concepts

* Buckets have folders
* Folders have objects
* IAM resource policy applies to buckets and folders and objects

## AWS - Lambda

* Created a lambda function and called it from local desktop (invoke_lambda.js)
* I put credentials in ~/.aws/credentials
* I used the following command to invoke the lambda function:

    >aws lambda invoke --function-name Notes output.txt

* I received the following error, "An error occurred (InvalidSignatureException) when calling the Invoke operation: Signature expired"
* I checked my system time (WSL) using the following command:

    >date

* The clock was off by 45 minutes, so I fixed it by running the following command in wsl bash:

    >sudo ntpdate pool.ntp.org

* I got the link to the lambda function using:

    >aws lambda get-function --function-name Notes --query 'Code.Location' --output text > lambda.url

* I then used curl to download the lambda function using:

    >curl -o lambda.zip $(cat lambda.url)

* This can be done in one step:

    >curl -o lambda.zip $(aws lambda get-function --function-name Notes --query 'Code.Location' --output text)

* I then unzipped the lambda function using:

    >unzip lambda.zip

* I am able to modify the lambda locally and run it on aws using the following commands:

    >zip lambda.zip lambda.js
    >aws lambda update-function-code --function-name Notes --zip-file fileb://lambda.zip

* I also moved the lambda function to S3 via the AWS CLI

    >aws s3 cp lambda.zip s3://ca0v0001

* I can list all the files on the S3 bucket using:

    >aws s3 ls s3://ca0v0001

## AWS - DBS (MySQL)

* Created a MySQL database in AWS RDS
* Got access to the database from my local desktop
* Was able to programmatically create a table and insert data into it
* Not sure where to put DB credentials
* [this test](http://localhost:3000/api) queries the database and returns the results

## Installed AWS CLI

    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install

The above installed aws in /usr/local/bin/aws
I then added the following to my .bashrc

    PATH=$PATH:/usr/local/bin/aws

To generate aws.txt:

    >aws help | sed -i 's/.\x08//g' aws.txt

Next, I had to configuration a region using

    aws configure

For a default output format, I chose "json".  Other choices include "text" and "table".

I then received this error when attempting to start the database,

    An error occurred (AccessDenied) when calling the StartDBInstance operation: User: arn:aws:iam::255691332024:user/corey_01 is not authorized to perform: rds:StartDBInstance on resource: arn:aws:rds:us-east-1:255691332024:db:database-1 because no identity-based policy allows the rds:StartDBInstance action

I was able to resolve the "no identity-based policy allows the rds:StartDBInstance action" error by giving user full access to RDS.  I did this by doing the following:

* Go to the IAM console
* Click on the user
* Click on the "Permissions" tab
* Click on the "Add permissions" button
* Click on the "Attach existing policies directly" button
* Search for "rds" and select the "AmazonRDSFullAccess" policy
* Click on the "Attach policy" button

Now I can start and stop the database from the command line

    aws rds start-db-instance --db-instance-identifier database-1
    aws rds stop-db-instance --db-instance-identifier database-1

It can take a while to start/stop so check status using:

    aws rds describe-db-instances --db-instance-identifier database-1

You can even reboot the server using:

    aws rds reboot-db-instance --db-instance-identifier database-1

For a list off all the commands, see [https://docs.aws.amazon.com/cli/latest/reference/rds/index.html](https://docs.aws.amazon.com/cli/latest/reference/rds/index.html) or execute the following command:

    aws rds help

If you want to generate docs from the command line, you can do the following:

    aws rds help > rds.txt

But then the document has a lot of "" characters, so you need to apply them or you'll get duplicate letters.  I tried this by deleting the character before "" using the following script:

        #!/bin/bash
    
        sed -i 's///g' rds.txt

The escape code for  is 0x08.  You can see this by doing the following:

    echo -e "tes\x08st"

So use that in the sed regex:

    sed -i 's/\x08//g' rds.txt

But the regex which replaces the escape code and the character before the escape code is:

    sed -i 's/.\x08//g' rds.txt

And so, putting it all together into a single command:

    aws rds help | sed -i 's/.\x08//g' rds.txt

The DBInstanceStatus will indicate "available" when the database is ready to use or "stopped" when it is stopped.

Use this command to only show the status:

    aws rds describe-db-instances --db-instance-identifier database-1 --query "DBInstances[*].DBInstanceStatus"

When you run an aws command, the CLI seems to be in VI?  To exit, press "q"

After using the CLI for a time as the admin user, I was receiving "The security token included in the request is expired" error.

As I did not know what to do, I created a new "CLI_BOSS" user, modified the ~/.aws/credentials \[DEFAULT\] user but was still unable to use those credentials without explicitly specifying the default profile:

    >aws --profile default sts get-session-token

What is going on?  Well, I exported some AWS variables when I setup the admin user.  You can list all exported variables via:

    >export -p

You can delete a variable via:

    >unset AWS_ACCESS_KEY_ID
    >unset AWS_SECRET_ACCESS_KEY
    >unset AWS_SESSION_TOKEN

Once I did that, the above command worked. Now I can run the following command to get the default user:

    >aws sts get-caller-identity

Which reported the proper user (CLI_BOSS).  I believe this will work indefinitely, which is probably not what I want.  I should rotate the keys.

The keys can be rotated using the following tooling:

    >aws iam list-access-keys --user-name CLI_BOSS
    >aws iam create-access-key --user-name CLI_BOSS
    >aws iam delete-access-key --user-name CLI_BOSS --access-key-id [key-provided-via-list]

The idea being to create a new key, delete the old key, and use list for observational purposes.

## AWS - Billing (HERE I AM)

To check your billing using AWS CLI for month-to-date, use the following command:

    aws ce get-cost-and-usage --time-period Start=2021-01-01,End=2021-01-31 --granularity MONTHLY --metrics "BlendedCost" --group-by Type=DIMENSION,Key=SERVICE

It did not work so I give the user the ce:GetCostAndUsage permission:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ce:*"
                ],
                "Resource": [
                    "*"
                ]
            }
        ]
    }

But it still did not work.  Now I am seeing "An error occurred (AccessDeniedException) when calling the GetCostAndUsage operation: User not enabled for cost explorer access".  I have not yet figured out how to enable cost explorer access.

## Podman

I am using a windows ARM processor, which may be why I could not get Docker working, and so I installed podman.  

The goal is to debug the lambda function locally and since podman is replacing docker, I had to create an alias:

    alias docker=podman

But this seems incompatible with AWS.  I receive, "Error: Running AWS SAM projects locally requires Docker. Have you got it installed and running?"

## Debugging Lambda Locally

This will not be possible without Docker (or Podman), neither of which is working with SAM.
Will try again on MacBook.

## Notes

List all IAM users:
    > aws iam list-users

List current user:
    > aws sts get-caller-identity
