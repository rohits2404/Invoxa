import { mock } from "@/mock/api";

export const invoicesApi = {
    // ── Mock (local data) ──
    list: (params = {}) => mock.invoices.list(params),
    get: (id) => mock.invoices.get(id),
    create: (payload) => mock.invoices.create(payload),
    update: (id, payload) => mock.invoices.update(id, payload),
    setStatus: (id, status) => mock.invoices.setStatus(id, status),
    remove: (id) => mock.invoices.remove(id),
};
