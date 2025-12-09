declare module 'react-toastify' {
  import * as React from 'react';

  export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';

  export interface ToastOptions {
    autoClose?: number;
    type?: ToastType;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    progress?: number;
    newestOnTop?: boolean;
    pauseOnFocusLoss?: boolean;
    rtl?: boolean;
    // Allow style prop here
    style?: React.CSSProperties;
  }

  export interface ToastFunction {
    (message: string, options?: ToastOptions): void;
    success(message: string, options?: ToastOptions): void;
    error(message: string, options?: ToastOptions): void;
    info(message: string, options?: ToastOptions): void;
    warn(message: string, options?: ToastOptions): void;
  }

  export const toast: ToastFunction;

  export const ToastContainer: React.FC<ToastOptions>; // Ensure that ToastContainer accepts ToastOptions
}
