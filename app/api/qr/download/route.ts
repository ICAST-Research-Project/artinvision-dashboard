import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/s3Client";

const QR_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_QR;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const aid = url.searchParams.get("aid");
    if (!aid) {
      return NextResponse.json(
        { error: "Missing 'aid' param" },
        { status: 400 }
      );
    }

    const key = `qr/artworks/${aid}.png`;
    const cmd = new GetObjectCommand({
      Bucket: QR_BUCKET,
      Key: key,
      ResponseContentType: "image/png",
      ResponseContentDisposition: `attachment; filename="artwork-${aid}-qr.png"`,
    });

    const signed = await getSignedUrl(S3, cmd, { expiresIn: 60 }); // 60s is plenty
    return NextResponse.redirect(signed, 302);
  } catch (e) {
    console.error("qr download route error:", e);
    return NextResponse.json(
      { error: "Failed to create download link" },
      { status: 500 }
    );
  }
}
