"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="cl-modal-root">
      <div className="cl-modal-backdrop" onClick={onClose} />
      <div
        className={`cl-modal-dialog cl-modal-${size}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="cl-modal-header">
          <h2 className="h5 fw-bold mb-0">{title}</h2>
          <button
            type="button"
            className="btn btn-sm btn-light d-flex align-items-center"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="cl-modal-body">{children}</div>
      </div>
    </div>
  );
}
