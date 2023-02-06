export const handler = async(event) => {
    // read the contents of the Notes.txt file in the S3 bucket
    

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
