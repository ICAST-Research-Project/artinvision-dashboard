/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    return Response.json({ ok: true, session });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        name: e?.name,
        message: e?.message,
        stack: e?.stack,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
