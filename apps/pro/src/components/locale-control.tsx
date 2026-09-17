"use client";
import { useRouter } from "next/navigation";
import { LocaleSelector, type LocaleSelectorLabels } from "@acticiv/ui";
export function LocaleControl(props: {
  value: string;
  inherit: boolean;
  labels: LocaleSelectorLabels;
}) {
  const router = useRouter();
  return (
    <LocaleSelector
      {...props}
      onChange={async (value) => {
        const response = await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: value === "inherit" ? null : value }),
        });
        if (!response.ok) throw new Error("Locale update failed");
        router.refresh();
      }}
    />
  );
}
