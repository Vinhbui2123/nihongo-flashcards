import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm?: () => void
    isDestructive?: boolean
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    confirmLabel,
    cancelLabel = "Hủy",
    onConfirm,
    isDestructive = false,
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal()
            }
        } else {
            if (dialog.open) {
                dialog.close()
            }
        }
    }, [isOpen])

    // Handle backdrop click to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <dialog
            ref={dialogRef}
            className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 open:animate-fade-in"
            onClick={handleBackdropClick}
            onCancel={onClose}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-slate-600">{children}</div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3 filter backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    >
                        {cancelLabel}
                    </button>
                    {onConfirm && (
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium shadow-sm ${isDestructive
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </dialog>
    )
}
