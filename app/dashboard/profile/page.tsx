"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SubNav from "@/components/SubNav";
import { ToastProvider, useToast } from "@/components/Toast";

const TONES = ["Professional", "Casual", "Funny", "Inspirational", "Technical"];

interface VoiceSample {
  id: number;
  content: string;
  label: string | null;
  created_at: string;
}

function ProfileContent() {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [defaultTone, setDefaultTone] = useState("Professional");
  const [notifications, setNotifications] = useState({ features: true, tips: true, digest: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Voice Learning
  const [voiceLearning, setVoiceLearning] = useState(false);
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([]);
  const [newSampleContent, setNewSampleContent] = useState("");
  const [newSampleLabel, setNewSampleLabel] = useState("");
  const [addingSample, setAddingSample] = useState(false);
  const [showAddSample, setShowAddSample] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()),
      fetch("/api/voice").then((r) => r.json()),
    ]).then(([data, samples]) => {
      setProfile(data);
      setName((data.name as string) || "");
      setImage((data.image as string) || "");
      const prefs = (data.preferences || {}) as Record<string, unknown>;
      setDefaultTone((prefs.defaultTone as string) || "Professional");
      setVoiceLearning(prefs.voiceLearning === true);
      setNotifications({
        features: prefs.notifyFeatures !== false,
        tips: prefs.notifyTips !== false,
        digest: prefs.notifyDigest === true,
      });
      if (Array.isArray(samples)) setVoiceSamples(samples);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image,
          preferences: {
            defaultTone,
            voiceLearning,
            notifyFeatures: notifications.features,
            notifyTips: notifications.tips,
            notifyDigest: notifications.digest,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast("Profile saved successfully!");
    } catch {
      toast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      toast("Image too large. Max 100KB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDelete() {
    const res = await fetch("/api/user/profile", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      toast("Failed to delete account", "error");
    }
  }

  async function handleAddVoiceSample() {
    if (newSampleContent.trim().length < 20) {
      toast("Sample must be at least 20 characters", "error");
      return;
    }
    setAddingSample(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newSampleContent.slice(0, 2000), label: newSampleLabel || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add sample");
      }
      // Refresh samples
      const samples = await fetch("/api/voice").then((r) => r.json());
      setVoiceSamples(samples);
      setNewSampleContent("");
      setNewSampleLabel("");
      setShowAddSample(false);
      toast("Voice sample added!");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add", "error");
    } finally {
      setAddingSample(false);
    }
  }

  async function handleDeleteVoiceSample(sampleId: number) {
    try {
      const res = await fetch("/api/voice", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sampleId }),
      });
      if (!res.ok) throw new Error("Failed");
      setVoiceSamples((prev) => prev.filter((s) => s.id !== sampleId));
      toast("Voice sample deleted");
    } catch {
      toast("Failed to delete sample", "error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <SubNav />
        <div className="flex items-center justify-center py-24">
          <div className="brutal-card p-8 bg-white text-center">
            <div className="text-4xl animate-spin mb-3">&#9889;</div>
            <p className="font-bold">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const pEmail = String(profile?.email || "");
  const pPlan = String(profile?.plan || "free");
  const pCreatedAt = String(profile?.created_at || "");
  const pTotalRepurposes = Number(profile?.total_repurposes || 0);
  const pStripeCustomerId = String(profile?.stripe_customer_id || "");

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SubNav />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold uppercase mb-8">
          Profile <span className="text-secondary">Settings</span>
        </h1>

        {/* Avatar + Name */}
        <div className="brutal-card p-6 bg-white mb-6">
          <div className="flex items-center gap-6 mb-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group shrink-0"
            >
              {image ? (
                <img src={image} alt="" className="w-20 h-20 rounded-full brutal-border object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full brutal-border bg-primary flex items-center justify-center text-2xl font-bold">
                  {name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Change</span>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full brutal-border px-4 py-2 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark/40 text-xs uppercase font-bold">Email</span>
              <p className="font-medium">{pEmail}</p>
            </div>
            <div>
              <span className="text-dark/40 text-xs uppercase font-bold">Plan</span>
              <p>
                <span className={`brutal-border px-2 py-0.5 text-xs font-bold uppercase ${pPlan === "pro" ? "bg-accent" : "bg-primary"}`}>
                  {pPlan}
                </span>
              </p>
            </div>
            <div>
              <span className="text-dark/40 text-xs uppercase font-bold">Member Since</span>
              <p className="font-medium">{pCreatedAt ? new Date(pCreatedAt).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <span className="text-dark/40 text-xs uppercase font-bold">Total Repurposes</span>
              <p className="font-bold text-lg">{pTotalRepurposes}</p>
            </div>
          </div>
        </div>

        {/* Your Voice / Tone Learning */}
        <div className="brutal-card p-6 bg-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase">Your Voice</h2>
            <button
              type="button"
              onClick={() => setVoiceLearning(!voiceLearning)}
              className={`w-12 h-7 brutal-border rounded-full relative transition-colors ${voiceLearning ? "bg-lime" : "bg-dark/10"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 brutal-border rounded-full bg-white transition-transform ${voiceLearning ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <p className="text-xs text-dark/50 mb-4">
            {voiceLearning
              ? "AI will match your writing style based on your voice samples when generating content."
              : "Enable to have AI learn and match your unique writing style."
            }
          </p>

          {/* Voice Samples */}
          {voiceSamples.length > 0 && (
            <div className="space-y-3 mb-4">
              {voiceSamples.map((sample) => (
                <div key={sample.id} className="brutal-border p-3 bg-[#FAFAFA]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {sample.label || "Voice Sample"}
                    </span>
                    <button
                      onClick={() => handleDeleteVoiceSample(sample.id)}
                      className="text-xs font-bold text-secondary hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-dark/60 line-clamp-3">{sample.content}</p>
                  <p className="text-[10px] text-dark/30 mt-1">{sample.content.length} chars</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Sample */}
          {voiceSamples.length < 5 && !showAddSample && (
            <button
              type="button"
              onClick={() => setShowAddSample(true)}
              className="brutal-btn px-4 py-2 text-xs bg-primary"
            >
              + Add Voice Sample ({voiceSamples.length}/5)
            </button>
          )}

          {showAddSample && (
            <div className="brutal-border p-4 bg-[#FAFAFA] mt-3">
              <input
                value={newSampleLabel}
                onChange={(e) => setNewSampleLabel(e.target.value)}
                placeholder="Label (optional, e.g. 'My LinkedIn Style')"
                className="w-full brutal-border px-3 py-2 text-sm font-medium bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <textarea
                value={newSampleContent}
                onChange={(e) => setNewSampleContent(e.target.value.slice(0, 2000))}
                placeholder="Paste a writing sample that represents your style (min 20 chars, max 2000)..."
                rows={5}
                className="w-full brutal-border px-3 py-2 text-sm font-medium bg-white resize-y focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-[10px] text-dark/40 mt-1 mb-2">{newSampleContent.length}/2000 characters</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddVoiceSample}
                  disabled={addingSample || newSampleContent.trim().length < 20}
                  className={`brutal-btn px-4 py-2 text-xs ${addingSample ? "bg-dark/50 text-white" : "bg-lime"}`}
                >
                  {addingSample ? "Saving..." : "Save Sample"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddSample(false); setNewSampleContent(""); setNewSampleLabel(""); }}
                  className="brutal-btn px-4 py-2 text-xs bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Default Tone */}
        <div className="brutal-card p-6 bg-white mb-6">
          <h2 className="text-lg font-bold uppercase mb-4">Default Tone</h2>
          <div className="flex flex-wrap gap-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setDefaultTone(tone)}
                className={`brutal-btn px-4 py-2 text-xs ${defaultTone === tone ? "bg-primary" : "bg-white"}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="brutal-card p-6 bg-white mb-6">
          <h2 className="text-lg font-bold uppercase mb-4">Notifications</h2>
          <div className="space-y-3">
            {[
              { key: "features" as const, label: "New Features", desc: "Get notified about new features" },
              { key: "tips" as const, label: "Tips & Tricks", desc: "Content creation tips" },
              { key: "digest" as const, label: "Weekly Digest", desc: "Weekly summary of your activity" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-xs text-dark/40">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`w-12 h-7 brutal-border rounded-full relative transition-colors ${notifications[item.key] ? "bg-lime" : "bg-dark/10"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 brutal-border rounded-full bg-white transition-transform ${notifications[item.key] ? "left-5" : "left-0.5"}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Subscription Management */}
        {pPlan === "pro" && pStripeCustomerId && (
          <div className="brutal-card p-6 bg-white mb-6">
            <h2 className="text-lg font-bold uppercase mb-4">Subscription</h2>
            <button
              onClick={async () => {
                const res = await fetch("/api/stripe/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="brutal-btn px-6 py-3 bg-accent"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`brutal-btn w-full py-4 text-lg mb-6 ${saving ? "bg-dark/50 text-white" : "bg-primary"}`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* Danger Zone */}
        <div className="brutal-card p-6 bg-secondary/10 border-secondary">
          <h2 className="text-lg font-bold uppercase mb-2 text-secondary">Danger Zone</h2>
          <p className="text-sm text-dark/60 mb-4">Permanently delete your account and all data.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="brutal-btn px-6 py-2 text-sm bg-secondary text-white">
              Delete Account
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleDelete} className="brutal-btn px-6 py-2 text-sm bg-secondary text-white">
                Yes, Delete Everything
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="brutal-btn px-6 py-2 text-sm bg-white">
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider>
      <ProfileContent />
    </ToastProvider>
  );
}
