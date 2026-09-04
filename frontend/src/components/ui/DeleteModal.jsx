import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DeleteModal({
    open,
    title = "Delete Item?",
    description = "This Action cannot Be Undone.",
    itemName,
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onClose,
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-(--ink)/35 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.94,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.96,
                            y: 8,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-(--surface) border border-(--border) shadow-hover"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center text-(--ink-muted) hover:bg-(--surface-2) hover:text-(--ink) transition disabled:opacity-40"
                            aria-label="Close"
                        >
                            <X size={17} />
                        </button>

                        <div className="p-6">
                            {/* Warning icon */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-(--danger)/10 text-(--danger) mb-5">
                                <AlertTriangle size={23} />
                            </div>

                            {/* Heading */}
                            <h3
                                id="delete-modal-title"
                                className="font-display text-xl font-semibold tracking-tight text-(--ink)"
                            >
                                {title}
                            </h3>

                            {/* Description */}
                            <p className="mt-2 text-sm leading-6 text-(--ink-muted)">
                                {description}
                            </p>

                            {/* Item name */}
                            {itemName && (
                                <div className="mt-4 rounded-2xl bg-(--surface-2) border border-(--border) px-4 py-3">
                                    <p className="text-xs text-(--ink-muted) mb-0.5">
                                        You Are Deleting
                                    </p>

                                    <p className="font-medium text-sm text-(--ink) truncate">
                                        {itemName}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {cancelText}
                                </Button>

                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={onConfirm}
                                    disabled={loading}
                                >
                                    {loading && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}

                                    {!loading && <AlertTriangle size={14} />}

                                    {loading ? "Deleting..." : confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
