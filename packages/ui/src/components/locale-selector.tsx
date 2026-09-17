"use client";
import { useState, useTransition } from "react";
export type LocaleSelectorLabels = {
  label: string;
  inherit: string;
  saved: string;
  failed: string;
  saving: string;
};
export function LocaleSelector({
  value,
  inherit,
  labels,
  onChange,
}: {
  value: string;
  inherit: boolean;
  labels: LocaleSelectorLabels;
  onChange: (locale: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"saved" | "failed" | null>(null);
  return (
    <section className="shell locale-preference" aria-label={labels.label}>
      <label htmlFor="locale-preference">{labels.label}</label>{" "}
      <select
        id="locale-preference"
        value={value}
        aria-busy={pending}
        onChange={(event) => {
          const next = event.target.value;
          setStatus(null);
          startTransition(async () => {
            try {
              await onChange(next);
              setStatus("saved");
            } catch {
              setStatus("failed");
            }
          });
        }}
      >
        {inherit && <option value="inherit">{labels.inherit}</option>}
        <option value="fr-FR" lang="fr">
          Français
        </option>
        <option value="en-GB" lang="en">
          English
        </option>
      </select>
      <p role="status" aria-atomic="true">
        {pending ? labels.saving : status ? labels[status] : ""}
      </p>
    </section>
  );
}
