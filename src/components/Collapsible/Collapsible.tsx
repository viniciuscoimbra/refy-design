"use client";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { DisclosureRegion } from "../../lib/DisclosureRegion";
import { Button } from "../Button";
export interface CollapsibleProps {
  title: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}
export function Collapsible({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
}: CollapsibleProps) {
  const [internal, setInternal] = useState(defaultOpen),
    id = useId(),
    expanded = open ?? internal;
  return (
    <div>
      <Button
        id={`${id}-trigger`}
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => {
          if (open === undefined) setInternal(!expanded);
          onOpenChange?.(!expanded);
        }}
      >
        {title} {expanded ? "−" : "+"}
      </Button>
      <DisclosureRegion
        open={expanded}
        id={id}
        aria-labelledby={`${id}-trigger`}
      >
        <div style={{ paddingBlock: "var(--space-4)" }}>{children}</div>
      </DisclosureRegion>
    </div>
  );
}
