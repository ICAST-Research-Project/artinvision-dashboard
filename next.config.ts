import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "iam.amazonaws.com",
      "s3.us-east-2.amazonaws.com",
      "t3.storage.dev",
    ],
  },
};

export default nextConfig;
