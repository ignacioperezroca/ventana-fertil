import { getAuthenticatedUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { getCloudState } from "@/services/cloud-data";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "No autorizado." }, { status: 401 });
  const entitlements = await getUserEntitlements(user.id);
  if (!entitlements.features.dataExport) return Response.json({ error: "La exportación en la nube requiere Premium." }, { status: 403 });
  const data = await getCloudState(user.id);
  return new Response(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": "attachment; filename=ventana-fertil-datos.json", "cache-control": "private, no-store" },
  });
}
