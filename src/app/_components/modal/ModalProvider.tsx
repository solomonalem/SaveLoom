"use client";

import { createContext, useCallback, useContext, useState } from "react";
import AppModal from "./AppModal";
import type { AlertOptions, ConfirmOptions, ModalContextValue, ModalVariant } from "./types";

const ModalContext = createContext<ModalContextValue | null>(null);

interface ActiveModal {
  type: "alert" | "confirm";
  title: string;
  message: string;
  variant: ModalVariant;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ActiveModal | null>(null);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setModal({
        type: "alert",
        title: options.title,
        message: options.message,
        variant: options.variant ?? "info",
        confirmLabel: options.confirmLabel ?? "OK",
        cancelLabel: "Cancel",
        resolve: () => resolve(),
      });
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModal({
        type: "confirm",
        title: options.title,
        message: options.message,
        variant: options.variant ?? "warning",
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        destructive: options.destructive,
        resolve,
      });
    });
  }, []);

  const handleCancel = () => {
    modal?.resolve(false);
    closeModal();
  };

  const handleConfirm = () => {
    if (!modal) return;
    modal.resolve(true);
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      {modal && (
        <AppModal
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          confirmLabel={modal.confirmLabel}
          cancelLabel={modal.cancelLabel}
          destructive={modal.destructive}
          showCancel={modal.type === "confirm"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useAppModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useAppModal must be used within ModalProvider");
  }
  return context;
}
