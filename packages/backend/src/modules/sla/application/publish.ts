import {
  requirePermission,
  type Context,
} from "../../authorization/domain/policy";
import { validateTargets, type Target, type Scope } from "../domain/policy";
export interface SlaWriter {
  publish(
    org: string,
    scope: Scope,
    calendar: string,
    targets: readonly Target[],
  ): Promise<string>;
}
export async function publishSla(
  context: Context | null,
  org: string,
  scope: Scope,
  calendar: string,
  targets: readonly Target[],
  writer: SlaWriter,
) {
  requirePermission(context, "configuration.write", { organizationId: org });
  validateTargets(targets);
  return writer.publish(org, scope, calendar, targets);
}
