export async function loadDialogMessages(locale: string) {
  return locale === "en-GB"
    ? (await import("./en-GB/dialog.json")).default
    : (await import("./fr-FR/dialog.json")).default;
}
