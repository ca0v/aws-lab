# AWS-LAB

Here I track my learning progress in Amazon Web Services.

## AWS - IAM

* Used identity and access management to create a user and give it access to the AWS console as well as S3 buckets.

* Created an S3 Bucket

* Wrote code to read and write "notes.txt" to the S3 bucket

## AWS - Lambda

* Created a lambda function and called it from local desktop (invoke_lambda.js)

## AWS - DBS (MySQL)

* Created a MySQL database in AWS RDS
* Got access to the database from my local desktop
* Was able to programmatically create a table and insert data into it
* Not sure where to put DB credentials

## Installed AWS CLI

    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install

The above installed aws in /usr/local/bin/aws
I then added the following to my .bashrc

    export PATH=$PATH:/usr/local/bin/aws

Next, I had to configuration a region using

    aws configure

For a default output format, I chose "json".  Other choices include "text" and "table".

I then received this error when attempting to start the database,

    An error occurred (AccessDenied) when calling the StartDBInstance operation: User: arn:aws:iam::255691332024:user/corey_01 is not authorized to perform: rds:StartDBInstance on resource: arn:aws:rds:us-east-1:255691332024:db:database-1 because no identity-based policy allows the rds:StartDBInstance action

I was able to resolve the "no identity-based policy allows the rds:StartDBInstance action" error by adding modifying the IAM user's policy to include the following,

    {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": [
            "rds:StartDBInstance",
            "rds:StopDBInstance"
        ],
        "Resource": "arn:aws:rds:us-east-1:255691332024:db:database-1"
    }

I did this by doing the following:

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

## AWS - billing

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
