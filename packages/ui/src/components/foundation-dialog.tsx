"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
export function FoundationDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          Découvrir le projet <ArrowUpRight size={18} aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">
            Une ville plus accessible
          </Dialog.Title>
          <Dialog.Description>
            Le service est en préparation. Ce premier aperçu présente ses
            fondations ; aucun signalement ne peut encore être envoyé.
          </Dialog.Description>
          <div className="field">
            <Label htmlFor="preview-name">Texte de démonstration</Label>
            <Input
              id="preview-name"
              placeholder="Essayez la saisie"
              aria-describedby="preview-help"
              autoComplete="off"
            />
            <p id="preview-help" className="small">
              Champ de démonstration. Cette saisie n’est ni enregistrée ni
              envoyée.
            </p>
          </div>
          <Dialog.Close asChild>
            <Button>
              Fermer <X size={16} aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
