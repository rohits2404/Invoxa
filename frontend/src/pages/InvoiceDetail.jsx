import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Download,
    Loader2,
    Send,
    CheckCircle2,
    Undo2,
    Sparkles,
    Copy,
    Check,
    Mail,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import {
    useInvoice,
    useSetInvoiceStatus,
    useDeleteInvoice,
} from "@/hooks/useInvoices";
import { useSettings } from "@/hooks/useSettings";
import { aiApi } from "@/api/ai";
import { formatMoney, formatDate, cn } from "@/lib/utils";

export default function InvoiceDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const { data: invoice, isLoading, error } = useInvoice(id);
    const { data: settings } = useSettings();
    const setStatus = useSetInvoiceStatus();
    const del = useDeleteInvoice();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-(--ink-muted)">
                <Loader2 className="animate-spin" size={20} />
            </div>
        );
    }
    if (error || !invoice) {
        return (
            <EmptyState
                icon={Mail}
                title="Invoice Not Found"
                description="It May Have Been Deleted."
            />
        );
    }

    const st = invoice.effective_status;
    const isPaid = invoice.status === "paid";

    async function onDelete() {
        if (!window.confirm(`Delete Invoice ${invoice.invoice_number}?`))
            return;
        await del.mutateAsync(id);
        nav("/invoices");
    }

    return (
        <div className="max-w-275">
            {/* header */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => nav("/invoices")}
                        className="h-9 w-9 rounded-full flex items-center justify-center border border-(--border) bg-(--surface) text-(--ink-muted) hover:text-(--ink) shadow-card"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-2xl font-semibold tracking-tight">
                                {invoice.invoice_number}
                            </h2>
                            <StatusBadge status={st} />
                        </div>
                        <p className="text-sm text-(--ink-muted)">
                            {invoice.client_name || "No Client"} ·{" "}
                            {formatMoney(invoice.total, invoice.currency)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <PDFDownloadLink
                        document={
                            <InvoiceDocument
                                invoice={invoice}
                                settings={settings}
                            />
                        }
                        fileName={`${invoice.invoice_number}.pdf`}
                    >
                        {({ loading }) => (
                            <span
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "md",
                                })}
                            >
                                {loading ? (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Download size={15} />
                                )}
                                PDF
                            </span>
                        )}
                    </PDFDownloadLink>
                    <Button
                        variant="outline"
                        onClick={() => nav(`/invoices/${id}/edit`)}
                    >
                        <Pencil size={15} /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onDelete}
                        className="text-(--danger) hover:bg-(--danger)/10"
                    >
                        <Trash2 size={15} />
                    </Button>
                </div>
            </div>

            {/* status controls */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs text-(--ink-muted) mr-1">
                    Mark as:
                </span>
                <StatusButton
                    active={invoice.status === "draft"}
                    onClick={() => setStatus.mutate({ id, status: "draft" })}
                    icon={Undo2}
                    label="Draft"
                />
                <StatusButton
                    active={invoice.status === "sent"}
                    onClick={() => setStatus.mutate({ id, status: "sent" })}
                    icon={Send}
                    label="Sent"
                />
                <StatusButton
                    active={isPaid}
                    onClick={() => setStatus.mutate({ id, status: "paid" })}
                    icon={CheckCircle2}
                    label="Paid"
                    tone="success"
                />
                {setStatus.isPending && (
                    <Loader2
                        size={14}
                        className="animate-spin text-(--ink-muted)"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Invoice preview */}
                <div className="lg:col-span-2">
                    <InvoicePreview invoice={invoice} settings={settings} />
                </div>

                {/* Side: reminder + client */}
                <div className="space-y-5">
                    {!isPaid && <PaymentReminderCard invoiceId={id} />}
                    <ClientCard invoice={invoice} />
                </div>
            </div>
        </div>
    );
}

function StatusButton({ active, onClick, icon: Icon, label, tone }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-colors",
                active
                    ? tone === "success"
                        ? "bg-(--success)/12 text-(--success) border-transparent"
                        : "bg-(--ink) text-(--bg) border-transparent"
                    : "bg-(--surface) text-(--ink-muted) border-(--border) hover:text-(--ink)",
            )}
        >
            <Icon size={13} />
            {label}
        </button>
    );
}

function InvoicePreview({ invoice, settings }) {
    const s = settings || {};
    const currency = invoice.currency;
    return (
        <Card padding="lg">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-(--border)">
                <div>
                    {s.logo_url ? (
                        <img
                            src={s.logo_url}
                            alt=""
                            className="h-12 w-12 object-contain mb-2 rounded"
                        />
                    ) : null}
                    <div className="font-display text-lg font-semibold text-(--ink)">
                        {s.company_name || "Your Company"}
                    </div>
                    {s.address && (
                        <div className="text-xs text-(--ink-muted) max-w-55">
                            {s.address}
                        </div>
                    )}
                    {s.email && (
                        <div className="text-xs text-(--ink-muted)">
                            {s.email}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="font-display text-2xl font-bold tracking-wide text-(--accent-strong)">
                        INVOICE
                    </div>
                    <div className="text-sm text-(--ink-muted) mt-1 tabular">
                        {invoice.invoice_number}
                    </div>
                </div>
            </div>

            <div className="flex items-start justify-between gap-4 py-6">
                <div>
                    <div className="text-[10px] uppercase tracking-wider text-(--ink-muted) font-semibold mb-1">
                        Bill To
                    </div>
                    <div className="text-sm font-semibold text-(--ink)">
                        {invoice.client_name || "—"}
                    </div>
                    {invoice.client_company && (
                        <div className="text-xs text-(--ink-muted)">
                            {invoice.client_company}
                        </div>
                    )}
                    {invoice.client_email && (
                        <div className="text-xs text-(--ink-muted)">
                            {invoice.client_email}
                        </div>
                    )}
                </div>
                <div className="text-right text-sm space-y-1">
                    <MetaLine
                        label="Issued"
                        value={formatDate(invoice.issue_date)}
                    />
                    <MetaLine
                        label="Due"
                        value={formatDate(invoice.due_date)}
                    />
                </div>
            </div>

            {/* items */}
            <div className="grid grid-cols-[1fr_60px_90px_90px] gap-3 pb-2 border-b border-(--ink) text-[10px] uppercase tracking-wider text-(--ink-muted) font-semibold">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
            </div>
            {(invoice.items || []).map((it, i) => (
                <div
                    key={i}
                    className="grid grid-cols-[1fr_60px_90px_90px] gap-3 py-2.5 border-b border-(--border) text-sm"
                >
                    <span className="text-(--ink)">
                        {it.description || "—"}
                    </span>
                    <span className="text-right tabular text-(--ink-muted)">
                        {Number(it.quantity)}
                    </span>
                    <span className="text-right tabular text-(--ink-muted)">
                        {formatMoney(it.rate, currency)}
                    </span>
                    <span className="text-right tabular text-(--ink) font-medium">
                        {formatMoney(it.amount, currency)}
                    </span>
                </div>
            ))}

            {/* totals */}
            <div className="ml-auto w-full max-w-65 mt-5 space-y-2 text-sm">
                <TotalLine
                    label="Subtotal"
                    value={formatMoney(invoice.subtotal, currency)}
                />
                {Number(invoice.discount) > 0 && (
                    <TotalLine
                        label="Discount"
                        value={`− ${formatMoney(invoice.discount, currency)}`}
                    />
                )}
                <TotalLine
                    label={`Tax (${Number(invoice.tax_rate)}%)`}
                    value={formatMoney(invoice.tax_amount, currency)}
                />
                <div className="flex items-center justify-between pt-3 border-t border-(--ink)">
                    <span className="font-display font-semibold">Total</span>
                    <span className="font-display text-xl font-semibold tabular text-(--accent-strong)">
                        {formatMoney(invoice.total, currency)}
                    </span>
                </div>
            </div>

            {(invoice.notes || invoice.terms) && (
                <div className="mt-8 pt-5 border-t border-(--border) space-y-3">
                    {invoice.notes && (
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-(--ink-muted) font-semibold mb-1">
                                Notes
                            </div>
                            <p className="text-sm text-(--ink)">
                                {invoice.notes}
                            </p>
                        </div>
                    )}
                    {invoice.terms && (
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-(--ink-muted) font-semibold mb-1">
                                Terms
                            </div>
                            <p className="text-sm text-(--ink)">
                                {invoice.terms}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

function MetaLine({ label, value }) {
    return (
        <div className="flex items-center justify-end gap-3">
            <span className="text-[10px] uppercase tracking-wider text-(--ink-muted) font-semibold">
                {label}
            </span>
            <span className="tabular text-(--ink) w-24 text-right">
                {value}
            </span>
        </div>
    );
}

function TotalLine({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-(--ink-muted)">{label}</span>
            <span className="tabular text-(--ink)">{value}</span>
        </div>
    );
}

function ClientCard({ invoice }) {
    if (!invoice.client_id) return null;
    return (
        <Card padding="lg">
            <CardTitle className="mb-3">Client</CardTitle>
            <Link
                to={`/clients/${invoice.client_id}`}
                className="flex items-center gap-3 group"
            >
                <div className="h-10 w-10 rounded-full bg-(--accent-soft) text-(--accent-strong) flex items-center justify-center font-semibold">
                    {invoice.client_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-(--ink) group-hover:text-(--accent-strong) truncate">
                        {invoice.client_name}
                    </div>
                    <div className="text-xs text-(--ink-muted) truncate">
                        {invoice.client_email ||
                            invoice.client_company ||
                            "View profile"}
                    </div>
                </div>
            </Link>
        </Card>
    );
}

const TONES = [
    { key: "friendly", label: "Friendly" },
    { key: "firm", label: "Firm" },
    { key: "final", label: "Final notice" },
];

function PaymentReminderCard({ invoiceId }) {
    const [tone, setTone] = useState("friendly");
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [copied, setCopied] = useState(false);

    async function generate() {
        setLoading(true);
        setErr("");
        try {
            const res = await aiApi.paymentReminder(invoiceId, tone);
            setDraft(res.draft);
        } catch (e) {
            setErr(e.message || "Couldn't Generate Reminder");
        } finally {
            setLoading(false);
        }
    }

    function copy() {
        const text = `Subject: ${draft.subject}\n\n${draft.body}`;
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <Card padding="lg">
            <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-(--accent-soft) text-(--accent-strong) flex items-center justify-center">
                    <Sparkles size={15} />
                </div>
                <CardTitle>AI Payment Reminder</CardTitle>
            </div>
            <p className="text-xs text-(--ink-muted) mb-3">
                Draft A Reminder Email Tuned To How Overdue This Invoice Is.
            </p>

            <div className="flex items-center gap-1 p-1 rounded-full bg-(--surface-2) mb-3">
                {TONES.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTone(t.key)}
                        className={cn(
                            "flex-1 h-7 rounded-full text-[11px] font-semibold transition-colors",
                            tone === t.key
                                ? "bg-(--surface) text-(--ink) shadow-card"
                                : "text-(--ink-muted)",
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <Button
                variant="accent"
                size="sm"
                className="w-full"
                onClick={generate}
                disabled={loading}
            >
                {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                ) : (
                    <Sparkles size={13} />
                )}
                {draft ? "Regenerate" : "Generate Draft"}
            </Button>

            {err && <p className="text-xs text-(--danger) mt-3">{err}</p>}

            {draft && (
                <div className="mt-4 rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-xs font-semibold text-(--ink) truncate">
                            {draft.subject}
                        </div>
                        <button
                            onClick={copy}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-(--accent-strong)"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <p className="text-[13px] leading-relaxed text-(--ink) whitespace-pre-wrap">
                        {draft.body}
                    </p>
                </div>
            )}
        </Card>
    );
}
