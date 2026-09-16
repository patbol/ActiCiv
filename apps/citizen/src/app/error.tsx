"use client";
import { Button } from "@acticiv/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="shell">
      <h1>La page n’a pas pu s’afficher.</h1>
      <p>Vous pouvez réessayer.</p>
      <Button onClick={reset}>Réessayer</Button>
    </main>
  );
}
