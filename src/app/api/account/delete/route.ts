import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const input = z.object({ confirmation: z.literal("ELIMINAR") }).safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Confirmación inválida." }, { status: 400 });
  const admin = createAdminClient();
  const { data: subscription } = await admin.from("subscriptions").select("stripe_subscription_id,status").eq("user_id", user.id).maybeSingle();
  if (subscription?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(subscription.status)) {
    await getStripe().subscriptions.cancel(subscription.stripe_subscription_id);
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "No se pudo eliminar la cuenta." }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
