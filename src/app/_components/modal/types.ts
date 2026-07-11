export type ModalVariant = "success" | "error" | "warning" | "info";

export interface AlertOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmLabel?: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface ModalContextValue {
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  closeModal: () => void;
}
