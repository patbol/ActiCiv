import "server-only";
import { createObservability } from "./telemetry";
// Dedicated server transport. No vendor SDK and no analytics written to the log stream.
export const telemetry = createObservability(process.env, (line) => {
  process.stderr.write(line);
});
export { commandContext } from "./correlation";
export { authObserver, localeSaved } from "./telemetry";
export type { CommandContext } from "./correlation";
