import { mock } from "@/mock/api";

export const authApi = {
    // ── Mock (local data) ──
    register: (payload) => mock.auth.register(payload),
    login: (payload) => mock.auth.login(payload),
    logout: () => mock.auth.logout(),
    me: () => mock.auth.me(),
    updateProfile: (payload) => mock.auth.updateProfile(payload),
    changePassword: (payload) => mock.auth.changePassword(payload),
};
