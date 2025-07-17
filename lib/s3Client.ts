// import { S3Client } from "@aws-sdk/client-s3";

// export const S3 = new S3Client({
//   region: "auto",
//   endpoint: "https://t3.storage.dev",
//   forcePathStyle: false,
// });

import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});
