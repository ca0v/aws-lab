// lambda.cjs

export async function handler(event) {
  // read the notes file from the bucket
  const notes = await s3
    .getObject({
      Bucket: process.env.NOTES_BUCKET,
      Key: "notes.json",
    })
    .promise()

  // return the notes
  return {
    statusCode: 200,
    body: notes.Body.toString(),
  }
}
