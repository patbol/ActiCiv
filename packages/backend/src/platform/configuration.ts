import "server-only";
import { z } from "zod";
import { priorities } from "../modules/catalog/domain/category";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfessionalContext } from "../modules/authorization/application/context";
import { supabaseContext } from "../modules/authorization/infrastructure/supabase-context";
import { publishSchedule } from "../modules/schedules/application/schedules";
import { publishSla } from "../modules/sla/application/publish";
import { inviteProfessional } from "../modules/auth/application/invite";
import { invitationAdapters } from "../modules/auth/infrastructure/invitations";
import { zonedTime } from "../modules/schedules/infrastructure/temporal";
import { scheduleWriter, slaWriter, rpc } from "./commands";
import { administration } from "./administration";
import {
  changeMember,
  saveService,
  setServiceMember,
} from "../modules/organizations/application/administration";
const uuid = z.guid(),
  org = { organizationId: uuid };
const role = z.enum(["agent", "supervisor", "client_admin"]);
const priority = z.enum(priorities);
const nonempty = z.string().trim().min(1).max(200);
const command = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("service.save"),
    ...org,
    code: nonempty,
    name: nonempty,
    status: z.enum(["active", "inactive", "archived"]),
  }),
  z.object({
    action: z.literal("member.change"),
    ...org,
    memberId: uuid,
    role,
    active: z.boolean(),
  }),
  z.object({
    action: z.literal("service.member"),
    ...org,
    memberId: uuid,
    serviceId: uuid,
    active: z.boolean(),
  }),
  z.object({
    action: z.literal("invitation.send"),
    ...org,
    email: z.email(),
    role,
    services: z.array(uuid).max(100),
    key: uuid,
  }),
  z.object({
    action: z.literal("schedule.publish"),
    ...org,
    serviceId: uuid.nullable(),
    schedule: z.object({
      timezone: nonempty,
      mode: z.enum(["weekly", "always_open"]),
      days: z.array(
        z.object({
          weekday: z.number().int(),
          open: z.boolean(),
          windows: z.array(z.tuple([z.number().int(), z.number().int()])),
        }),
      ),
    }),
  }),
  z.object({
    action: z.literal("sla.publish"),
    ...org,
    serviceId: uuid.nullable(),
    categoryId: uuid.nullable(),
    calendarId: uuid,
    targets: z.array(
      z.object({
        kind: z.enum(["acknowledgment", "intervention", "resolution"]),
        durationSeconds: z.number().int(),
        countingMode: z.enum(["elapsed", "business_hours"]),
        pauseReasons: z.array(uuid),
      }),
    ),
  }),
  z.object({
    action: z.literal("category.configure"),
    ...org,
    categoryId: uuid,
    active: z.boolean(),
    priority: priority.nullable(),
  }),
  z.object({
    action: z.literal("hold.save"),
    ...org,
    code: nonempty,
    label: nonempty,
    active: z.boolean(),
  }),
]);
export async function configure(
  client: SupabaseClient,
  input: unknown,
  env: Record<string, string | undefined>,
  origin: string,
) {
  const value = command.parse(input);
  const context = await getProfessionalContext(supabaseContext(client));
  if (
    !context ||
    context.role !== "client_admin" ||
    context.organizationId !== value.organizationId
  )
    throw new Error("Accès refusé");
  const port = administration(client);
  switch (value.action) {
    case "service.save":
      return saveService(
        context,
        value.organizationId,
        value.code,
        value.name,
        value.status,
        port,
      );
    case "member.change":
      return changeMember(
        context,
        value.organizationId,
        value.memberId,
        value.role,
        value.active,
        port,
      );
    case "service.member":
      return setServiceMember(
        context,
        value.organizationId,
        value.memberId,
        value.serviceId,
        value.active,
        port,
      );
    case "invitation.send": {
      const { repository, provider } = invitationAdapters(client, env, origin);
      return inviteProfessional(
        context,
        value.organizationId,
        value.email,
        value.role,
        value.services,
        value.key,
        repository,
        provider,
      );
    }
    case "schedule.publish":
      return publishSchedule(
        context,
        value.organizationId,
        value.serviceId,
        value.schedule,
        scheduleWriter(client),
        zonedTime,
      );
    case "sla.publish":
      return publishSla(
        context,
        value.organizationId,
        { serviceId: value.serviceId, categoryId: value.categoryId },
        value.calendarId,
        value.targets,
        slaWriter(client),
      );
    case "category.configure":
      return rpc(client, "configure_category", {
        p_org: value.organizationId,
        p_category: value.categoryId,
        p_active: value.active,
        p_priority: value.priority,
      });
    case "hold.save":
      return rpc(client, "save_hold_reason", {
        p_org: value.organizationId,
        p_code: value.code,
        p_label: value.label,
        p_active: value.active,
      });
  }
}
