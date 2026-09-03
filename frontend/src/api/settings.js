import { mock } from "@/mock/api";

export const settingsApi = {
    // ── Mock (local data) ──
    get: () => mock.settings.get(),
    update: (payload) => mock.settings.update(payload),
};
