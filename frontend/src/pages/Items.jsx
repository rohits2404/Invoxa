import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Package, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useItems, useItemMutations } from "@/hooks/useFeatures";
import { formatMoney } from "@/lib/utils";
import { DeleteModal } from "@/components/ui/DeleteModal";

export default function Items() {
    const { data: items, isLoading } = useItems();
    const [modal, setModal] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const { remove } = useItemMutations();

    function onDelete(e, item) {
        e.stopPropagation();
        setDeleteItem(item);
    }

    async function confirmDelete() {
        if (!deleteItem) return;

        try {
            await remove.mutateAsync(deleteItem.id);
            setDeleteItem(null);
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    }

    return (
        <div>
            <PageHeader
                title="Items & Services"
                description="Reusable Products And Services You Can Drop Into Any Invoice."
                actions={
                    <Button variant="accent" onClick={() => setModal({})}>
                        <Plus size={16} /> Add Item
                    </Button>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-30 rounded-3xl" />
                    ))}
                </div>
            ) : !items?.length ? (
                <EmptyState
                    icon={Package}
                    title="No Items Yet"
                    description="Save Your Common Services And Their Rates To Speed Up Invoicing."
                    action={
                        <Button variant="accent" onClick={() => setModal({})}>
                            <Plus size={16} /> Add Item
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <Card
                            key={item.id}
                            padding="lg"
                            className="group cursor-pointer"
                            onClick={() => setModal(item)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-semibold text-(--ink) truncate">
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-(--ink-muted) mt-1 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setModal(item);
                                        }}
                                        className="h-7 w-7 rounded-full flex items-center justify-center text-(--ink-muted) hover:bg-(--surface-2) hover:text-(--ink)"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={(e) => onDelete(e, item)}
                                        className="h-7 w-7 rounded-full flex items-center justify-center text-(--ink-muted) hover:bg-(--surface-2) hover:text-(--danger)"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="font-display text-xl font-semibold tabular text-(--accent-strong)">
                                    {formatMoney(item.rate)}
                                </span>
                                {item.unit && (
                                    <span className="text-xs text-(--ink-muted)">
                                        / {item.unit}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ItemModal
                open={!!modal}
                item={modal?.id ? modal : null}
                onClose={() => setModal(null)}
            />
            <DeleteModal
                open={!!deleteItem}
                title="Delete Item?"
                description="This Item Will Be Permanently Removed From Your Saved Products and Services."
                itemName={deleteItem?.name}
                confirmText="Delete Item"
                loading={remove.isPending}
                onConfirm={confirmDelete}
                onClose={() => {
                    if (!remove.isPending) {
                        setDeleteItem(null);
                    }
                }}
            />
        </div>
    );
}

const EMPTY = { name: "", description: "", rate: 0, unit: "" };

function ItemModal({ open, item, onClose }) {
    const isEdit = !!item;
    const { create, update } = useItemMutations();
    const [form, setForm] = useState(EMPTY);
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(
                item
                    ? {
                          name: item.name,
                          description: item.description || "",
                          rate: item.rate,
                          unit: item.unit || "",
                      }
                    : EMPTY,
            );
            setErr("");
        }
    }, [open, item]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) return setErr("Name Is Required");
        setSaving(true);
        setErr("");
        try {
            const payload = { ...form, rate: Number(form.rate) || 0 };
            if (isEdit) await update.mutateAsync({ id: item.id, payload });
            else await create.mutateAsync(payload);
            onClose();
        } catch (ex) {
            setErr(ex.message || "Couldn't Save Item");
        } finally {
            setSaving(false);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-(--ink)/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.form
                        onSubmit={onSubmit}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-115 rounded-3xl bg-(--surface) border border-(--border) shadow-hover p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-display text-lg font-semibold tracking-tight">
                                {isEdit ? "Edit item" : "Add item"}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-(--ink-muted) hover:bg-(--surface-2)"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Name *">
                                <Input
                                    value={form.name}
                                    onChange={set("name")}
                                    placeholder="Frontend development"
                                />
                            </Field>
                            <Field label="Description">
                                <Input
                                    value={form.description}
                                    onChange={set("description")}
                                    placeholder="Short description"
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Rate">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.rate}
                                        onChange={set("rate")}
                                        className="tabular"
                                    />
                                </Field>
                                <Field label="Unit">
                                    <Input
                                        value={form.unit}
                                        onChange={set("unit")}
                                        placeholder="hour / project"
                                    />
                                </Field>
                            </div>
                        </div>
                        {err && (
                            <p className="text-sm text-(--danger) mt-3">
                                {err}
                            </p>
                        )}
                        <div className="flex items-center justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="accent"
                                disabled={saving}
                            >
                                {saving && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                )}
                                {isEdit ? "Save" : "Add Item"}
                            </Button>
                        </div>
                    </motion.form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-(--ink-muted) mb-1.5">
                {label}
            </span>
            {children}
        </label>
    );
}
