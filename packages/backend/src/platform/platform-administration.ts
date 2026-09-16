import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rpc } from "./commands";
import { geographicCandidates } from "../modules/coverage/application/candidates";
import { coverageReader } from "../modules/coverage/infrastructure/supabase";
const uuid = z.guid(),
  text = z.string().trim().min(1).max(200);
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("organization.save"),
    code: text,
    name: text,
    status: z.enum(["active", "inactive", "archived"]),
  }),
  z.object({
    action: z.literal("organization.recover"),
    organizationId: uuid,
    userId: uuid,
    name: text,
  }),
  z.object({
    action: z.literal("vertical.save"),
    code: text,
    name: text,
    active: z.boolean(),
  }),
  z.object({
    action: z.literal("category.save"),
    verticalId: uuid,
    code: text,
    name: text,
    priority: z.enum(["normal", "important", "urgent"]),
    active: z.boolean(),
  }),
  z.object({
    action: z.literal("territory.save"),
    code: text,
    name: text,
    kind: text,
    geometry: z.record(z.string(), z.unknown()),
    parentId: uuid.nullable(),
  }),
  z.object({
    action: z.literal("contract.save"),
    organizationId: uuid,
    reference: text,
    status: z.enum(["draft", "active", "expired", "cancelled"]),
    from: z.iso.datetime(),
    until: z.iso.datetime().nullable(),
    plan: text,
  }),
  z.object({
    action: z.literal("scope.set"),
    contractId: uuid,
    territoryId: uuid,
    categories: z.array(uuid),
    services: z.array(uuid),
  }),
  z.object({
    action: z.literal("coverage.read"),
    longitude: z.number(),
    latitude: z.number(),
    categoryId: uuid,
  }),
]);
export async function platformAdministration(
  client: SupabaseClient,
  input: unknown,
) {
  const value = schema.parse(input);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error("Accès refusé");
  const { data: platform } = await client
    .from("platform_admins")
    .select("capabilities")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();
  const capabilities: Record<typeof value.action, string> = {
    "organization.save": "organizations.manage",
    "organization.recover": "organizations.recover",
    "vertical.save": "catalog.manage",
    "category.save": "catalog.manage",
    "territory.save": "territories.manage",
    "contract.save": "contracts.manage",
    "scope.set": "contracts.manage",
    "coverage.read": "contracts.manage",
  };
  if (!platform?.capabilities.includes(capabilities[value.action]))
    throw new Error("Accès refusé");
  switch (value.action) {
    case "organization.save":
      return rpc(client, "save_organization", {
        p_code: value.code,
        p_name: value.name,
        p_status: value.status,
      });
    case "organization.recover":
      return rpc(client, "recover_organization", {
        p_org: value.organizationId,
        p_user: value.userId,
        p_name: value.name,
      });
    case "vertical.save":
      return rpc(client, "save_vertical", {
        p_code: value.code,
        p_name: value.name,
        p_active: value.active,
      });
    case "category.save":
      return rpc(client, "save_category", {
        p_vertical: value.verticalId,
        p_code: value.code,
        p_name: value.name,
        p_priority: value.priority,
        p_active: value.active,
      });
    case "territory.save":
      return rpc(client, "save_territory", {
        p_code: value.code,
        p_name: value.name,
        p_kind: value.kind,
        p_geometry: value.geometry,
        p_parent: value.parentId,
      });
    case "contract.save":
      return rpc(client, "save_contract", {
        p_org: value.organizationId,
        p_reference: value.reference,
        p_status: value.status,
        p_from: value.from,
        p_until: value.until,
        p_plan: value.plan,
      });
    case "scope.set":
      return rpc(client, "set_contract_scope", {
        p_contract: value.contractId,
        p_territory: value.territoryId,
        p_categories: value.categories,
        p_services: value.services,
      });
    case "coverage.read":
      return geographicCandidates(
        value.longitude,
        value.latitude,
        value.categoryId,
        coverageReader(client),
      );
  }
}
