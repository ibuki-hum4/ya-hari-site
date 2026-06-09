"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
import { ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps {
    children: ReactNode;
    className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay
                className="fixed inset-0 z-[9998] bg-ink/40 backdrop-blur-sm transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
            />
            <DialogPrimitive.Content
                className={`fixed left-1/2 top-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl outline-none transition-all duration-200 data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 ${className}`}
            >
                {children}
                <DialogPrimitive.Close
                    className="absolute right-4 top-4 text-muted hover:opacity-70 transition-opacity"
                    aria-label="閉じる"
                >
                    <FiX size={20} />
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <DialogPrimitive.Title className={`text-lg font-bold text-ink mb-2 pr-6 ${className}`}>
            {children}
        </DialogPrimitive.Title>
    );
}

export function DialogDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <DialogPrimitive.Description className={`text-sm text-muted leading-relaxed ${className}`}>
            {children}
        </DialogPrimitive.Description>
    );
}
