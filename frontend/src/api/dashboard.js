import { mock } from "@/mock/api";

export const dashboardApi = {
    // ── Mock (local data) ──
    get: () => mock.dashboard.get(),
};
