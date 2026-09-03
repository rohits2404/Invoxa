import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Check, Upload, Building2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/UIContext";
import { authApi } from "@/api/auth";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { CURRENCIES, cn } from "@/lib/utils";

function FieldLabel({ children }) {
    return (
        <label className="text-xs font-medium text-(--ink-muted) mb-1.5 block">
            {children}
        </label>
    );
}

function CompanySection() {
    const { data: settings } = useSettings();
    const update = useUpdateSettings();
    const toast = useToast();
    const fileRef = useRef(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings && !form) {
            setForm({
                company_name: settings.company_name || "",
                email: settings.email || "",
                phone: settings.phone || "",
                address: settings.address || "",
                logo_url: settings.logo_url || "",
                currency: settings.currency || "USD",
                tax_rate: Number(settings.tax_rate) || 0,
                invoice_prefix: settings.invoice_prefix || "INV-",
            });
        }
    }, [settings, form]);

    if (!form) {
        return (
            <div className="flex items-center py-16 justify-center text-(--ink-muted)">
                <Loader2 className="animate-spin" size={18} />
            </div>
        );
    }

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    function onLogoPick(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (file.size > 400_000) {
            toast.error("Logo Too Large", "Please Use an Image Under 400KB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            setForm((f) => ({ ...f, logo_url: reader.result }));
        reader.readAsDataURL(file);
    }

    async function onSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await update.mutateAsync({
                ...form,
                tax_rate: Number(form.tax_rate) || 0,
            });
            toast.success("Company Settings Saved");
        } catch (err) {
            toast.error("Couldn't Save Settings", err?.message);
        } finally {
            setSaving(false);
        }
    }

    const selectClass =
        "h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15";

    return (
        <form onSubmit={onSave} className="space-y-5 max-w-2xl">
            <Card padding="lg">
                <CardHeader>
                    <div>
                        <CardTitle className="text-base">
                            Company Profile
                        </CardTitle>
                        <CardDescription className="mt-1">
                            This Appears On Every Invoice And PDF You Send.
                        </CardDescription>
                    </div>
                </CardHeader>

                <div className="flex items-center gap-4 mb-5">
                    <div className="h-16 w-16 rounded-2xl border border-(--border) bg-(--surface-2) flex items-center justify-center overflow-hidden shrink-0">
                        {form.logo_url ? (
                            <img
                                src={form.logo_url}
                                alt="logo"
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <Building2
                                size={22}
                                className="text-(--ink-muted)"
                            />
                        )}
                    </div>
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onLogoPick}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Upload size={14} /> Upload Logo
                        </Button>
                        {form.logo_url && (
                            <button
                                type="button"
                                onClick={() =>
                                    setForm((f) => ({ ...f, logo_url: "" }))
                                }
                                className="ml-2 text-xs text-(--danger) font-semibold"
                            >
                                Remove
                            </button>
                        )}
                        <p className="text-[11px] text-(--ink-muted) mt-1.5">
                            PNG or SVG, Under 400KB.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <FieldLabel>Company Name</FieldLabel>
                        <Input
                            value={form.company_name}
                            onChange={set("company_name")}
                            placeholder="Your Company LLC"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Billing Email</FieldLabel>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={set("email")}
                                placeholder="billing@you.com"
                            />
                        </div>
                        <div>
                            <FieldLabel>Phone</FieldLabel>
                            <Input
                                value={form.phone}
                                onChange={set("phone")}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Address</FieldLabel>
                        <Input
                            value={form.address}
                            onChange={set("address")}
                            placeholder="123 Main St, City, State"
                        />
                    </div>
                </div>
            </Card>

            <Card padding="lg">
                <CardHeader>
                    <div>
                        <CardTitle className="text-base">
                            Invoicing Defaults
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Applied Automatically To Each New Invoice.
                        </CardDescription>
                    </div>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <FieldLabel>Default Currency</FieldLabel>
                        <select
                            className={selectClass}
                            value={form.currency}
                            onChange={set("currency")}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Default Tax %</FieldLabel>
                        <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.tax_rate}
                            onChange={set("tax_rate")}
                            className="tabular"
                        />
                    </div>
                    <div>
                        <FieldLabel>Invoice # Prefix</FieldLabel>
                        <Input
                            value={form.invoice_prefix}
                            onChange={set("invoice_prefix")}
                            placeholder="INV-"
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" variant="accent" disabled={saving}>
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Save Company Settings
                </Button>
            </div>
        </form>
    );
}

function ProfileSection() {
    const { user, updateProfile } = useAuth();
    const toast = useToast();
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);

    const dirty = name.trim() !== (user?.name || "") && name.trim().length > 0;

    async function onSave(e) {
        e.preventDefault();
        if (!dirty) return;
        setSaving(true);
        try {
            await updateProfile({ name: name.trim() });
            toast.success("Profile Updated");
        } catch (err) {
            toast.error("Couldn't Update Profile", err?.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card padding="lg" className="max-w-2xl">
            <CardHeader>
                <div>
                    <CardTitle className="text-base">Your account</CardTitle>
                    <CardDescription className="mt-1">
                        Your Name Appears On The Dashboard Greeting.
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={onSave} className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-(--accent-soft) text-(--accent-strong) font-semibold flex items-center justify-center text-lg ring-2 ring-(--surface) shrink-0">
                        {(user?.name?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="text-xs text-(--ink-muted)">
                        Avatar Is Generated From Your Initial.
                    </div>
                </div>

                <div>
                    <FieldLabel>Full name</FieldLabel>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={80}
                        placeholder="Your Name"
                    />
                </div>

                <div>
                    <FieldLabel>Email</FieldLabel>
                    <Input value={user?.email || ""} disabled />
                    <p className="text-[11px] text-(--ink-muted) mt-1.5">
                        Email Changes Aren&apos;t Supported Yet.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={!dirty || saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function ThemeOption({ value, label, icon: Icon, current, onSelect }) {
    const active = current === value;
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
                "relative flex-1 flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all",
                active
                    ? "border-(--accent) bg-(--accent-soft)"
                    : "border-(--border) bg-(--surface) hover:bg-(--surface-2)",
            )}
        >
            <div
                className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    active
                        ? "bg-(--accent-strong) text-white"
                        : "bg-(--surface-2) text-(--ink-muted)",
                )}
            >
                <Icon size={16} />
            </div>
            <div>
                <div className="text-sm font-semibold text-(--ink)">
                    {label}
                </div>
                <div className="text-[11px] text-(--ink-muted) mt-0.5">
                    {value === "light"
                        ? "Fresh, Bright Teal Tones"
                        : "Calm, Low-Glare Night"}
                </div>
            </div>
            {active && (
                <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-(--accent-strong) text-white flex items-center justify-center">
                    <Check size={12} />
                </span>
            )}
        </button>
    );
}

function AppearanceSection() {
    const { theme, setTheme } = useTheme();
    return (
        <Card padding="lg" className="max-w-2xl">
            <CardHeader>
                <div>
                    <CardTitle className="text-base">Appearance</CardTitle>
                    <CardDescription className="mt-1">
                        Pick A Theme. Your Choice Is Remembered On This Device.
                    </CardDescription>
                </div>
            </CardHeader>

            <div className="flex gap-3">
                <ThemeOption
                    value="light"
                    label="Light"
                    icon={Sun}
                    current={theme}
                    onSelect={setTheme}
                />
                <ThemeOption
                    value="dark"
                    label="Dark"
                    icon={Moon}
                    current={theme}
                    onSelect={setTheme}
                />
            </div>
        </Card>
    );
}

function PasswordSection() {
    const toast = useToast();
    const [currentPassword, setCurrent] = useState("");
    const [newPassword, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);

    const newTooShort = newPassword.length > 0 && newPassword.length < 8;
    const mismatch = confirm.length > 0 && confirm !== newPassword;
    const canSubmit =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        confirm === newPassword &&
        !saving;

    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        setSaving(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword });
            toast.success("Password Changed");
            setCurrent("");
            setNext("");
            setConfirm("");
        } catch (err) {
            toast.error("Couldn't Change Password", err?.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card padding="lg" className="max-w-2xl">
            <CardHeader>
                <div>
                    <CardTitle className="text-base">Password</CardTitle>
                    <CardDescription className="mt-1">
                        Use At Least 8 Characters. Mix Letters, Numbers, And a
                        Symbol For a Stronger Password.
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <FieldLabel>Current password</FieldLabel>
                    <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrent(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>

                <div>
                    <FieldLabel>New password</FieldLabel>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNext(e.target.value)}
                        autoComplete="new-password"
                    />
                    {newTooShort && (
                        <p className="text-[11px] text-(--danger) mt-1.5">
                            Needs To Be At Least 8 Characters.
                        </p>
                    )}
                </div>

                <div>
                    <FieldLabel>Confirm new password</FieldLabel>
                    <Input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                    />
                    {mismatch && (
                        <p className="text-[11px] text-(--danger) mt-1.5">
                            Passwords Don&apos;t Match.
                        </p>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={!canSubmit}>
                        {saving ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

export default function Settings() {
    const [tab, setTab] = useState("company");

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Your Company Profile, Invoicing Defaults, And Account."
            />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="profile">Account</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="company">
                        <CompanySection />
                    </TabsContent>
                    <TabsContent value="profile">
                        <ProfileSection />
                    </TabsContent>
                    <TabsContent value="appearance">
                        <AppearanceSection />
                    </TabsContent>
                    <TabsContent value="password">
                        <PasswordSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
