import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { S3 } from "@/lib/s3Client";

const prisma = new PrismaClient();

/* -------------------------- ENV + CONSTANTS -------------------------- */

const MAIN_BUCKET =
  process.env.S3_BUCKET_NAME || process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
const QR_BUCKET =
  process.env.S3_BUCKET_NAME_QR ||
  process.env.NEXT_PUBLIC_S3_BUCKET_NAME_QR ||
  MAIN_BUCKET;

const QR_PUBLIC_BASE =
  (
    process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3_QR ||
    process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3 ||
    ""
  ).replace(/\/+$/, "") +
  "/" +
  (process.env.NEXT_PUBLIC_S3_BUCKET_NAME_QR ||
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME);

const QR_TARGET_BASE =
  process.env.NEXT_PUBLIC_QR_TARGET_BASE ||
  (process.env.NEXT_PUBLIC_APP_BASE_URL
    ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/qr`
    : "https://example.com/qr");

/* ---------------------------- HELPERS -------------------------------- */

function makeQrTargetUrl(artworkId: string): string {
  const u = new URL(QR_TARGET_BASE);
  u.searchParams.set("aid", artworkId);
  return u.toString();
}

async function generateQrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: "M",
    width: 512,
    margin: 2,
    type: "png",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

async function uploadQrToS3(key: string, png: Buffer): Promise<string> {
  await S3.send(
    new PutObjectCommand({
      Bucket: QR_BUCKET,
      Key: key,
      Body: png,
      ContentType: "image/png",
      // If inline <img> renders as a download, remove ContentDisposition completely.
      // ContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
    })
  );
  return `${QR_PUBLIC_BASE}/${key}`;
}

/* ------------------------------ MAIN --------------------------------- */

type Mode = "regenerate" | "link";

async function backfill(mode: Mode, limit: number, ids?: string[]) {
  // 1) Choose targets
  let targets: { id: string }[];
  if (ids && ids.length) {
    targets = ids.map((id) => ({ id }));
  } else {
    targets = await prisma.artwork.findMany({
      where: { qrCodeUrl: null },
      select: { id: true },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  }

  console.log(
    `Starting backfill: mode=${mode}, targets=${targets.length}, bucket=${QR_BUCKET}`
  );

  let updated = 0;
  let failed = 0;

  // 2) Process sequentially (safe for serverless/db)
  for (const { id } of targets) {
    try {
      let url: string;

      if (mode === "link") {
        const key = `qr/artworks/${id}.png`;
        url = `${QR_PUBLIC_BASE}/${key}`;
      } else {
        const target = makeQrTargetUrl(id);
        const png = await generateQrPng(target);
        const key = `qr/artworks/${id}.png`;
        url = await uploadQrToS3(key, png);
      }

      await prisma.artwork.update({
        where: { id },
        data: { qrCodeUrl: url },
      });

      updated++;
      console.log(`OK ${id} -> ${url}`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${id}:`, e);
    }
  }

  console.log(
    `Done. scanned=${targets.length} updated=${updated} failed=${failed}`
  );
}

/* ---------------------------- CLI PARSE ------------------------------- */

function parseArgs(argv: string[]) {
  const map = new Map<string, string | true>();
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
    else if (a.startsWith("--")) map.set(a.slice(2), true);
  }
  return map;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const mode = (args.get("mode") as Mode) || "regenerate";
  const limit = Number(args.get("limit") || 200);
  const ids =
    typeof args.get("ids") === "string"
      ? (args.get("ids") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  if (!QR_PUBLIC_BASE || !QR_BUCKET) {
    console.error(
      "Missing env for QR public base or bucket. Check NEXT_PUBLIC_AWS_ENDPOINT_URL_S3(_QR), NEXT_PUBLIC_S3_BUCKET_NAME(_QR), S3_BUCKET_NAME_QR."
    );
    process.exit(1);
  }

  await backfill(mode, limit, ids);
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
