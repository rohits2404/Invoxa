/**
 * Rounds a number to 2 decimal places
 * @param {number|string} n - The number to round
 * @returns {number} Rounded number with 2 decimal places
 */
export function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Computes invoice totals including subtotal, discount, tax, and total
 * @param {Array} items - Array of invoice items
 * @param {number|string} taxRate - Tax rate as percentage (0-100)
 * @param {number|string} discount - Discount amount
 * @returns {Object} Computed totals with normalized items
 */
export function computeTotals(items, taxRate = 0, discount = 0) {
    const normItems = (items || []).map((it, i) => {
        const quantity = Number(it.quantity) || 0;
        const rate = Number(it.rate) || 0;
        return {
            description: (it.description || "").toString(),
            quantity,
            rate,
            amount: round2(quantity * rate),
            position: it.position ?? i + 1,
        };
    });

    const subtotal = round2(normItems.reduce((s, it) => s + it.amount, 0));
    const disc = Math.min(round2(Number(discount) || 0), subtotal);
    const taxableBase = round2(subtotal - disc);
    const taxAmount = round2((taxableBase * (Number(taxRate) || 0)) / 100);
    const total = round2(taxableBase + taxAmount);

    return { items: normItems, subtotal, discount: disc, taxAmount, total };
}

/**
 * Determines the effective status of an invoice
 * @param {Object} invoice - Invoice object with status and due_date
 * @returns {string} Effective status: 'paid', 'overdue', or original status
 */
export function effectiveStatus(invoice) {
    if (invoice.status === "paid") return "paid";
    if (invoice.status === "sent" && invoice.due_date) {
        const due = new Date(invoice.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (due < today) return "overdue";
    }
    return invoice.status;
}

/**
 * Serializes an invoice with proper number formatting and effective status
 * @param {Object} row - Database row containing invoice data
 * @param {Array} items - Optional array of invoice items
 * @returns {Object} Serialized invoice with formatted numbers
 */
export function serializeInvoice(row, items) {
    const num = (v) => (v === null ? 0 : Number(v));
    const base = {
        ...row,
        tax_rate: num(row.tax_rate),
        discount: num(row.discount),
        subtotal: num(row.subtotal),
        tax_amount: num(row.tax_amount),
        total: num(row.total),
    };
    base.effective_status = effectiveStatus(base);
    if (items) {
        base.items = items.map((it) => ({
            ...it,
            quantity: num(it.quantity),
            rate: num(it.rate),
            amount: num(it.amount),
        }));
    }
    return base;
}
