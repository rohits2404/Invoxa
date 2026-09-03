import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Lock, Sparkles } from "lucide-react";
import {
    AuthShell,
    AuthField,
    AuthPrimaryButton,
    AuthErrorBanner,
} from "@/components/auth/AuthShell";
import { AILogo } from "@/components/layout/AILogo";
import { useAuth } from "@/context/AuthContext";

const DEMO = { email: "alex@timetoprogram.com", password: "Test@1234" };

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    function fillDemo() {
        setForm({ ...DEMO });
        setErr("");
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            await login(form);
            nav("/dashboard");
        } catch (e) {
            setErr(e.message || "Login Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            headline={
                <>
                    Invoicing,
                    <br />
                    <em style={{ fontStyle: "italic" }}>On Autopilot.</em>
                </>
            }
            subhead="Create Polished Invoices, Track Every Payment, And Let AI Handle Receipts, Reminders, And Revenue Summaries."
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="mb-12">
                    <AILogo size={48} />
                </div>

                <h1 className="font-display text-[34px] font-semibold tracking-tight text-(--ink) leading-[1.05]">
                    Welcome Back
                </h1>

                <p className="text-(--ink-muted) mt-2 text-[15px]">
                    Sign In To Manage Your Invoices And Clients.
                </p>

                <form onSubmit={onSubmit} className="mt-9 space-y-4">
                    <AuthField
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        placeholder="you@example.com"
                        icon={Mail}
                    />

                    <AuthField
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(v) => setForm({ ...form, password: v })}
                        placeholder="••••••••"
                        icon={Lock}
                        extra={
                            <button
                                type="button"
                                className="text-xs text-(--accent-strong) font-semibold hover:underline"
                            >
                                Forgot?
                            </button>
                        }
                    />

                    <AuthErrorBanner>{err}</AuthErrorBanner>

                    <div className="pt-1">
                        <AuthPrimaryButton type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={15} />
                                </>
                            )}
                        </AuthPrimaryButton>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-(--border)" />

                        <span className="text-[11px] uppercase tracking-wider text-(--ink-muted) font-semibold">
                            Or
                        </span>

                        <div className="h-px flex-1 bg-(--border)" />
                    </div>

                    <button
                        type="button"
                        onClick={fillDemo}
                        className="w-full h-12 rounded-2xl border border-dashed border-(--accent)/40 bg-(--accent-soft)/40 text-sm font-semibold text-(--accent-strong) hover:bg-(--accent-soft) transition-colors inline-flex items-center justify-center gap-2"
                    >
                        <Sparkles size={14} /> Use Demo Credentials
                    </button>
                </form>

                <div className="text-sm text-(--ink-muted) text-center mt-8">
                    Don't Have An Account?{" "}
                    <Link
                        to="/register"
                        className="text-(--accent-strong) font-semibold hover:underline"
                    >
                        Create One
                    </Link>
                </div>
            </motion.div>
        </AuthShell>
    );
}
