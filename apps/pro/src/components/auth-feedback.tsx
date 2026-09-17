"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function AuthHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [children]);
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
    ref.current?.focus();
  }, [children]);
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
