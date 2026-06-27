import { buildPersonalShareMessage, buildGenericShareMessage } from "@/lib/shareTemplates";
import type { SimulationResult } from "@/types";

export function buildResultCopyText(simulation: SimulationResult) {
  return buildPersonalShareMessage(simulation);
}

export function buildPublicAppShareText() {
  return buildGenericShareMessage();
}
