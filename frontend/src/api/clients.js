import { mock } from "@/mock/api";

export const clientsApi = {
    // ── Mock (local data) ──
    list: () => mock.clients.list(),
    get: (id) => mock.clients.get(id),
    create: (payload) => mock.clients.create(payload),
    update: (id, payload) => mock.clients.update(id, payload),
    remove: (id) => mock.clients.remove(id),
};
