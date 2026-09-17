"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
export type DialogLabels = {
  trigger: string;
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  help: string;
  close: string;
};
export function FoundationDialog({ labels }: { labels: DialogLabels }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          {labels.trigger} <ArrowUpRight size={18} aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">{labels.title} </Dialog.Title>
          <Dialog.Description>{labels.description} </Dialog.Description>
          <div className="field">
            <Label htmlFor="preview-name">{labels.inputLabel} </Label>
            <Input
              id="preview-name"
              placeholder={labels.placeholder}
              aria-describedby="preview-help"
              autoComplete="off"
            />
            <p id="preview-help" className="small">
              {labels.help}{" "}
            </p>
          </div>
          <Dialog.Close asChild>
            <Button>
              {labels.close} <X size={16} aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
