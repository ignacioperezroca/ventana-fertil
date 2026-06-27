import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { getCloudState, upsertCurrentSnapshot } from "@/services/cloud-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    return NextResponse.json(await getCloudState(user.id), { headers: { "cache-control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "No pudimos cargar los datos sincronizados." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const entitlements = await getUserEntitlements(user.id);
    return NextResponse.json(await upsertCurrentSnapshot(user.id, await request.json(), entitlements.hasPremium));
  } catch {
    return NextResponse.json({ error: "No pudimos sincronizar los cambios." }, { status: 400 });
  }
}
