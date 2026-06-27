import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { migrateSnapshot } from "@/services/cloud-data";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const entitlements = await getUserEntitlements(user.id);
    const result = await migrateSnapshot(user.id, await request.json(), entitlements.hasPremium);
    return NextResponse.json(result, { status: result.reason === "conflict" ? 409 : 200 });
  } catch {
    return NextResponse.json({ error: "No pudimos migrar los datos locales." }, { status: 400 });
  }
}
