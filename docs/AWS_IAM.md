# AWS IAM

AWS Security services assist in safeguarding data and resources in the cloud. AWS Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources. You can use IAM to create and manage AWS users and groups, and use permissions to allow and deny their access to AWS resources.
It addition to IAM there is Amazon GuardDuty (log analysis), Amazon Macie (white-hat hacker), AWS Config (config) and AWS CloudTrail (network logging).  More on these other services once I understand the foundations of IAM.

## IAM Concepts

It is critical to understand the following concepts when working with IAM:

* Compliance is built-in (physical security, encryption, access control, logging, etc.)
* No AWS service has access to another AWS service without your permission.
* IAM is used to create users, groups, roles and policies.
* IAM users are not end users, they are people or applications that interact with AWS.
* Temporary permissions are granted to users via roles.
* Roles get token keys for less than a day.
* Automation can be used to monitor and manage IAM users.

## IAM Users

The root user is not an IAM user, it is the user that created the AWS account. Only root user can view billing information.  See [AWS Account Management Reference Guide](https://docs.aws.amazon.com/accounts/latest/reference/root-user-tasks.html) for details.

The root users first task is to create an administrative user.  This user will have full access to all AWS services.  This user will be used to create other users and groups and will not be used to perform day-to-day tasks.

IAM users are the entities that you create in AWS IAM to represent the people or applications that interact with AWS. You can use IAM users to control who has access to your AWS resources and what type of access they have. You can create and manage your own AWS users or you can allow AWS to create and manage them for you.

IAM Users have a name and credentials.

### Principals

A principal is an entity that can be authenticated and authorized to access AWS resources. A principal can be an IAM user, an IAM role, an AWS account, an AWS service, or an AWS federated user. A principal can also be an AWS account root user, but you should not use the root user for day-to-day tasks. Instead, you should create IAM users and use them to perform day-to-day tasks.

### Authentication

Authentication is the process of verifying the identity of a user or process. AWS supports several different methods of authentication, including the following:

* AWS Identity and Access Management (IAM) users
* AWS Single Sign-On (SSO)
* AWS Directory Service for Microsoft Active Directory
* And many, many more

### Request

A request is a request to access a resource. Requests are made by principals. For example, a user might make a request to access an Amazon S3 bucket. The request is made by the user, but the request is for the bucket.

### Authorization

Authorization is the process of determining whether a principal is allowed to perform an action on a resource. Authorization is performed by AWS services. For example, Amazon S3 might authorize a user to access a bucket.

### Actions

An action is a request to perform an operation on a resource. For example, a user might request to list the objects in an Amazon S3 bucket. The action is to list the objects.

### Resources

A resource is an object that is protected by AWS. For example, an Amazon S3 bucket is a resource. A user might request to list the objects in a bucket. The bucket is the resource.  No resource may communicate with another resource without permission.

## IAM Roles

IAM roles are a secure way to grant permissions to code that runs on AWS resources. You can use roles to delegate access to users, applications, or services that don't normally have access to your AWS resources. For example, you might want to allow a user in one AWS account to access resources in another AWS account. Or you might want to allow an application in an EC2 instance to access resources in an Amazon S3 bucket.

Think of an IAM Role as an IAM user with temporary permissions.  A trust policy is used to grant permissions to the role.  The role is then attached to an AWS resource.  The resource can then assume the role and use the permissions granted by the trust policy.  The trust policy can be attached to multiple roles and the roles can be attached to multiple resources.

Concepts:

    * A role is a permission policy that can be assumed by an AWS service or a user.
    * There are no long-term credentials associated with a role.
    * A user "takes-on" a role to gain temporary access to AWS resources via token service.
    * Users to not "normally" have access to resources, they are temporarily granted access via roles.
    * Users must establish a trust relationship to "take-on" a role.
    * User must sts:AssumeRole to take-on a role.

Finally, an example of a role would be to allow an EC2 instance to access an S3 bucket.  The EC2 instance would assume the role and then have access to the S3 bucket.  Code running on this EC2 instance will be able to access to the S3 bucket.

## IAM Policies

IAM policies are documents that define one or more permissions. Policies are associated with IAM identities (users or roles) or AWS resources. When you create a policy, you specify one or more permissions and the effect that this permission has. This effect is Allow or Deny. You can also specify a condition that must be met for the permission to be effective. For example, you might want to allow access to an Amazon S3 bucket only if the request includes a specific header that provides a secret password.

A resource-based policy is not attached to a user but to a resource. For example, you might create a policy that allows access to an Amazon S3 bucket. Then you attach the policy to the bucket. Any user who has access to the bucket can perform the actions that are defined in the policy.

## IAM Groups

IAM groups are a collection of IAM users. You can use groups to specify permissions for multiple users at one time. For example, you might create a group of users who need access to your Amazon S3 bucket. Then you can add or remove users from the group as needed, and all the members of the group automatically have access to the Amazon S3 bucket.

Best practice would be to assign permissions to groups and not users.  This allows you to add and remove users from groups as needed.  Groups are not hierarchical.


## IAM Tooling

### AWS Security Hub

AWS Security Hub is a service that helps you to consolidate your findings from AWS security services and third-party security solutions. It also provides you with a comprehensive view of your security state within AWS and helps you to prioritize your remediation efforts.

