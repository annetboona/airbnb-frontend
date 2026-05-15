import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import api from "../../../lib/axios";

// ─── Toast System ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  return { toasts, success: (msg: string) => add(msg, "success"), error: (msg: string) => add(msg, "error") };
}

function ToastContainer({ toasts }: { toasts: { id: number; msg: string; type: string }[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-[fadeUp_0.3s_ease]
            ${t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-gray-700"
              : "bg-orange-50 border-orange-200 text-orange-700"
            }`}
        >
          <span className="text-xs">{t.type === "success" ? "✓" : "✕"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16, className = "text-orange-500" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`}>
      <circle
        cx="12" cy="12" r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="40"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({
  src, name, size = 96, editable = false, onUpload, onRemove,
}: {
  src?: string; name: string; size?: number; editable?: boolean;
  onUpload?: (file: File) => Promise<void>; onRemove?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hover, setHover] = useState(false);

  const initials =
    name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setUploading(true);
    await onUpload(file);
    setUploading(false);
    // Reset so same file can be re-uploaded
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        onMouseEnter={() => editable && setHover(true)}
        onMouseLeave={() => editable && setHover(false)}
        onClick={() => editable && fileRef.current?.click()}
        className={`rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 border-2 border-orange-400
          ${src ? "" : " from-orange-400 to-orange-600"}
          ${editable ? "cursor-pointer" : ""}
          ${hover ? "ring-4 ring-orange-300/40" : "shadow-md shadow-gray-300"}`}
        style={{ width: size, height: size }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-semibold select-none" style={{ fontSize: size * 0.3 }}>
            {initials}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <Spinner size={20} className="text-white" />
          </div>
        )}
        {editable && hover && !uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-[10px] text-white font-bold tracking-wider">CHANGE</span>
          </div>
        )}
      </div>

      {editable && src && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          title="Remove photo"
          className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-red-400 transition-colors"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label, name, value, onChange, disabled, type = "text", hint,
}: {
  label: string; name: string; value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; type?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-colors font-sans
          ${disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-gray-200 text-gray-800 border-gray-300 focus:border-orange-500 hover:border-orange-400"
          }`}
      />
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
  );
}

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordField({
  label, name, value, onChange,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm border border-gray-300 bg-gray-200 text-gray-800 outline-none transition-colors focus:border-orange-500 hover:border-orange-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    HOST: "bg-orange-100 border-orange-300 text-orange-700",
    GUEST: "bg-orange-100 border-orange-300 text-orange-700",
    ADMIN: "bg-red-100 border-red-300 text-red-700",
  };
  return (
    <span className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${styles[role] ?? styles.GUEST}`}>
      {role}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase m-0">
        {title}
      </h2>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="border-t border-gray-300 my-7" />;
}

// ─── Profile Info Tab ─────────────────────────────────────────────────────────
function ProfileInfoTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({ name: "", username: "", phone: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    setDirty(true);
  };
// In DashboardProfilePage.tsx

const updateProfile = async (data: Record<string, string>) => {
  try {
    await api.patch(`/users/${profile!.id}`, data);
    await refreshProfile();
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw error; // Re-throw so handleSubmit can catch it
  }
};

const handleSubmit = async () => {
  if (!dirty) return;
  setSaving(true);
  try {
    await updateProfile(formData);
    setDirty(false);
    toast.success("Profile updated successfully");
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to update profile";
    toast.error(errorMessage);
    console.error("Profile update failed:", error);
  } finally {
    setSaving(false);
  }
};
  const uploadAvatar = async (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      await api.post(`/users/${profile!.id}/avatar`, fd);
      await refreshProfile();
      toast.success("Photo updated");
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const removeAvatar = async () => {
    try {
      await api.delete(`/users/${profile!.id}/avatar`);
      await refreshProfile();
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  if (!profile)
    return (
      <div className="flex justify-center py-10">
        <Spinner size={28} />
      </div>
    );

  return (
    <div>
      <SectionHeader
        title="Identity"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />

      <div className="flex items-start gap-6 mb-7">
        <Avatar
          src={profile.avatar}
          name={profile.name}
          size={88}
          editable
          onUpload={uploadAvatar}
          onRemove={removeAvatar}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight m-0">
              {profile.name}
            </h1>
            <RoleBadge role={profile.role} />
          </div>
          <p className="text-sm text-gray-500 m-0">{profile.email}</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm m-0">
            {profile.bio || "No bio yet."}
          </p>
        </div>
      </div>

      <Divider />

      <SectionHeader
        title="Account details"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        }
      />

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <Field label="Full name" name="name" value={formData.name} onChange={handleChange} />
        <Field
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          hint="Used in your public profile URL"
        />
        <Field
          label="Email address"
          name="email"
          value={profile.email}
          disabled
          hint="Contact support to change your email"
        />
        <Field label="Phone number" name="phone" value={formData.phone ?? ""} onChange={handleChange} />
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell guests a bit about yourself..."
            className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-300 bg-gray-200 text-gray-800 outline-none transition-colors focus:border-orange-500 hover:border-orange-400 resize-y min-h-80"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!dirty || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? <><Spinner size={14} className="text-white" /> Saving…</> : "Save changes"}
        </button>
        {dirty && !saving && (
          <span className="text-xs text-gray-400">You have unsaved changes</span>
        )}
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (form.newPassword.length < 6) e.newPassword = "At least 6 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
    setSaving(false);
  };

  const strength =
    form.newPassword.length === 0 ? 0
      : form.newPassword.length < 6 ? 1
        : form.newPassword.length < 10 ? 2
          : /[A-Z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword) ? 4 : 3;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-teal-400"][strength];
  const strengthText = ["", "text-red-500", "text-amber-500", "text-emerald-500", "text-teal-500"][strength];

  return (
    <div>
      <SectionHeader
        title="Change password"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      <div className="max-w-sm flex flex-col gap-4">
        <div>
          <PasswordField
            label="Current password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-[11px] text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <PasswordField
            label="New password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
          />
          {form.newPassword.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-gray-300 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${strength * 25}%` }}
                />
              </div>
              <span className={`text-[11px] font-semibold w-10 ${strengthText}`}>
                {strengthLabel}
              </span>
            </div>
          )}
          {errors.newPassword && (
            <p className="mt-1 text-[11px] text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <PasswordField
            label="Confirm new password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? <><Spinner size={14} className="text-white" /> Updating…</> : "Update password"}
        </button>
      </div>

      <Divider />

      <SectionHeader
        title="Security tips"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
      />
      <div className="flex flex-col gap-2.5">
        {[
          "Use at least 8 characters for a stronger password",
          "Mix uppercase letters, numbers, and symbols",
          "Never reuse a password from another site",
        ].map((tip, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span className="text-orange-500 text-xs font-bold mt-0.5">✓</span>
            <span className="text-sm text-gray-500 leading-relaxed">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const { profile, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!profile) return null;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    { label: "Member since", value: joinDate },
    { label: "Account type", value: profile.role },
    { label: "User ID", value: (profile.id?.slice(0, 12) ?? "—") + "…" },
  ];

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/users/${profile.id}`);
      logout();
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setConfirming(false);
    }
    setDeleting(false);
  };

  return (
    <div>
      <SectionHeader
        title="Account overview"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-7">
        {stats.map((s, i) => (
          <div key={i} className="px-4 py-3.5 rounded-xl bg-gray-200 border border-gray-300">
            <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase m-0 mb-1">{s.label}</p>
            <p className="text-[15px] font-medium text-gray-700 m-0">{s.value}</p>
          </div>
        ))}
      </div>

      <Divider />

      <div className="p-4 rounded-xl bg-red-50 border border-red-200">
        <p className="text-sm font-semibold text-orange-700 mb-2">Delete account</p>
        <p className="text-xs text-orange-500 leading-relaxed mb-3.5">
          Permanently delete your account and all associated data. This action cannot be undone and all your listings will be removed.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {deleting
            ? <><Spinner size={14} className="text-white" /> Deleting…</>
            : confirming
              ? "Tap again to confirm — this is permanent"
              : "Delete my account"}
        </button>
        {confirming && !deleting && (
          <button
            onClick={() => setConfirming(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline block"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  const Block = ({ className }: { className: string }) => (
    <div className={`rounded-md bg-gray-300 animate-pulse ${className}`} />
  );
  return (
    <div className="p-8">
      <div className="flex gap-5 items-center mb-8">
        <Block className="w-88 h-88 rounded-full" />
        <div className="flex flex-col gap-2">
          <Block className="w-44 h-5" />
          <Block className="w-28 h-3.5" />
          <Block className="w-64 h-3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Block className="w-24 h-3" />
            <Block className="w-full h-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function DashboardProfilePage() {
  const { profile } = useAuth();
  const loading = !profile;
  const [activeTab, setActiveTab] = useState("profile");
  const toast = useToast();

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="min-h-screen bg-gray-200 rounded-2xl font-sans py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Page heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight m-0 mb-1">
            My profile
          </h1>
          <p className="text-sm text-gray-500 m-0">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-100 shadow-sm shadow-gray-300 rounded-2xl overflow-hidden">

          {/* Tab bar */}
          <div className="flex px-5 bg-gray-100 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3.5 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px bg-transparent
                  ${activeTab === tab.id
                    ? "text-gray-800 border-orange-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8 bg-gray-100">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <>
                {activeTab === "profile" && <ProfileInfoTab toast={toast} />}
                {activeTab === "security" && <SecurityTab toast={toast} />}
                {activeTab === "account" && <AccountTab toast={toast} />}
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}

export default DashboardProfilePage;