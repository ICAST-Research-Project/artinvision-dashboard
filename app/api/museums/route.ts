import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.museumAdmin.findMany({
    select: {
      id: true,
      museumName: true,
      address: true,
      user: {
        select: {
          image: true,
        },
      },
    },
  });
  const museums = rows.map((m) => ({
    id: m.id,
    museumName: m.museumName,
    address: m.address,
    image: m.user.image,
  }));

  return NextResponse.json(museums);
}
