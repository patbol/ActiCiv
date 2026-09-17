import { saveCatalogTranslation } from "../modules/locales/application/translations";
import { translationWriter } from "../modules/locales/infrastructure/translations";
import "server-only";
import { z } from "zod";
import { priorities } from "../modules/catalog/domain/category";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rpc } from "./commands";
import { geographicCandidates } from "../modules/coverage/application/candidates";
import { coverageReader } from "../modules/coverage/infrastructure/supabase";
import {
  saveContract,
  saveTerritory,
  setContractScope,
} from "../modules/coverage/application/administration";
import { coverageAdministration } from "../modules/coverage/infrastructure/administration";
import {
  saveOrganization,
  recoverOrganization,
} from "../modules/organizations/application/platform";
import { organizationPlatform } from "../modules/organizations/infrastructure/platform";
const uuid = z.guid(),
  text = z.string().trim().min(1).max(200);
const schema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("translation.catalog"),
    kind: z.enum(["vertical", "category"]),
    entityId: uuid,
    locale: z.enum(["fr-FR", "en-GB"]),
    label: text,
  }),
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
    priority: z.enum(priorities),
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
    "translation.catalog": "catalog.manage",
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
  const context = {
    userId: user.id,
    capabilities: platform.capabilities as string[],
  };
  switch (value.action) {
    case "translation.catalog":
      return saveCatalogTranslation(
        context,
        value.kind,
        value.entityId,
        value.locale,
        value.label,
        translationWriter(client),
      );
    case "organization.save":
      return saveOrganization(context, value, organizationPlatform(client));
    case "organization.recover":
      return recoverOrganization(context, value, organizationPlatform(client));
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
      return saveTerritory(context, value, coverageAdministration(client));
    case "contract.save":
      return saveContract(context, value, coverageAdministration(client));
    case "scope.set":
      return setContractScope(context, value, coverageAdministration(client));
    case "coverage.read":
      return geographicCandidates(
        value.longitude,
        value.latitude,
        value.categoryId,
        coverageReader(client),
      );
  }
}
