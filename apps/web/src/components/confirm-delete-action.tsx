"use client";

import type * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteActionProps = {
  actionLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  description: string;
  disabled?: boolean;
  onConfirm: () => void;
  title: string;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerLabel?: React.ReactNode;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  Pick<React.ComponentProps<typeof Button>, "variant">;

export function ConfirmDeleteAction({
  actionLabel = "Delete",
  cancelLabel = "Cancel",
  children,
  description,
  disabled,
  onConfirm,
  title,
  triggerAriaLabel,
  triggerClassName,
  triggerLabel,
  size,
  variant = "destructive",
}: ConfirmDeleteActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          className={triggerClassName}
          disabled={disabled}
          aria-label={triggerAriaLabel}
        >
          {triggerLabel ?? children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20"
            onClick={onConfirm}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
