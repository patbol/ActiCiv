export const priorities = ["normal", "important", "urgent"] as const;
export type Priority = (typeof priorities)[number];
export function isPriority(value: unknown): value is Priority {
  return (
    typeof value === "string" &&
    (priorities as readonly string[]).includes(value)
  );
}
