import { getLocale } from "next-intl/server";
import { FoundationDialog } from "@acticiv/ui/foundation-dialog";
import { loadDialogMessages } from "@acticiv/shared/demo-messages";
import "@acticiv/ui/demo.css";
export async function FoundationPreview() {
  const labels = await loadDialogMessages(await getLocale());
  return <FoundationDialog labels={labels} />;
}
