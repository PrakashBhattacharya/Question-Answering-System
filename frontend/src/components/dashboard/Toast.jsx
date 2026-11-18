import React from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import styles from './Toast.module.css'

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isWarning = toast.type === 'warning'
        const isInfo = toast.type === 'info'
        const isSuccess = !isError && !isInfo && !isWarning

        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${
              isError
                ? styles.toastError
                : isWarning
                ? styles.toastWarning
                : isInfo
                ? styles.toastInfo
                : styles.toastSuccess
            }`}
            role="status"
          >
            <div className={styles.toastIcon}>
              {isSuccess && <CheckCircle2 size={15} />}
              {isError && <AlertCircle size={15} />}
              {isWarning && <AlertTriangle size={15} />}
              {isInfo && <Info size={15} />}
            </div>
            <div className={styles.toastBody}>
              {toast.title && <div className={styles.toastTitle}>{toast.title}</div>}
              <div className={styles.toastMsg}>{toast.message}</div>
            </div>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
