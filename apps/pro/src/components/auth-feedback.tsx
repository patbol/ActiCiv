"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function AuthHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    // A late mount after an RSC refresh must not steal locale-control focus.
    if (document.activeElement?.id !== "locale-preference")
      ref.current?.focus();
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1}>
      {children}
    </h1>
  );
}
export function AuthMessage({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    // A late mount after an RSC refresh must not steal locale-control focus.
    if (document.activeElement?.id !== "locale-preference")
      ref.current?.focus();
  }, [error]);
  return (
    <p
      id={error ? "auth-error" : "auth-status"}
      ref={ref}
      tabIndex={-1}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
