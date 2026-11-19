"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-h-[min(92dvh,100%)] overflow-y-auto border-3 border-black bg-party-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-left shadow-cartoon-xl rounded-t-3xl sm:rounded-3xl sm:p-6",
          maxWidths[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25 sm:hidden" aria-hidden="true" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 hover:bg-white/10 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h3 className="pr-12 text-xl font-black text-white font-cartoon tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="mt-1 mb-4 text-sm text-gray-300">{description}</p>
        )}

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
