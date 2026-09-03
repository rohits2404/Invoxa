import { mock } from "@/mock/api";

export const aiApi = {
    // ── Mock (canned AI responses — no Groq in the boilerplate) ──
    receiptParse: (file) => mock.ai.receiptParse(file),
    businessSummary: () => mock.ai.businessSummary(),
    paymentReminder: (invoiceId, tone) =>
        mock.ai.paymentReminder(invoiceId, tone),
    writeNote: (payload) => mock.ai.writeNote(payload),
};
