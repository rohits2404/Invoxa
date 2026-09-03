import { mock } from "@/mock/api";

export const itemsApi = {
    // ── Mock (local data) ──
    list: () => mock.items.list(),
    create: (payload) => mock.items.create(payload),
    update: (id, payload) => mock.items.update(id, payload),
    remove: (id) => mock.items.remove(id),
};

export const expensesApi = {
    // ── Mock ──
    list: (params = {}) => mock.expenses.list(params),
    create: (payload) => mock.expenses.create(payload),
    update: (id, payload) => mock.expenses.update(id, payload),
    remove: (id) => mock.expenses.remove(id),
};

export const paymentsApi = {
    // ── Mock ──
    list: () => mock.payments.list(),
    create: (payload) => mock.payments.create(payload),
    remove: (id) => mock.payments.remove(id),
};

export const reportsApi = {
    // ── Mock ──
    get: () => mock.reports.get(),
};
