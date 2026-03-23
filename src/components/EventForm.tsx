import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface EventFormProps {
  eventId: string | null;
  onBack: () => void;
  onSave: () => void;
}

const features = [
  "Analytics Module",
  "Document Management",
  "Training",
  "Support",
  "Mobile",
  "System",
  "Claims Processing",
  "Reporting",
  "Integrations",
];

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
];

const audienceOptions = [
  "All Users",
  "All PMS Groups",
  "Enterprise Clients",
  "Clients with Feature",
  "Groups with PMS",
  "Power Users",
  "Managers",
  "Trial Users",
];

const excludeOptions = [
  "VIP Groups",
  "Trial Users",
  "Inactive Users",
  "Desktop Only Users",
  "Existing Feature Users",
];

interface FormData {
  name: string;
  description: string;
  feature: string;
  headline: string;
  subtext: string;
  primaryCtaLabel: string;
  primaryCtaAction: string;
  primaryCtaLink: string;
  secondaryCtaEnabled: boolean;
  secondaryCtaLabel: string;
  secondaryCtaAction: string;
  secondaryCtaLink: string;
  remindMeLater: boolean;
  noThanks: boolean;
  includeAudience: string[];
  excludeAudience: string[];
  includePidSso: boolean;
  startDate: string;
  endDate: string;
  timezone: string;
  frequency: string;
  dismissDays: number;
  priority: number;
}

export default function EventForm({ eventId, onBack, onSave }: EventFormProps) {
  const event = useQuery(
    api.splashEvents.get,
    eventId ? { id: eventId as Id<"splashEvents"> } : "skip"
  );
  const createEvent = useMutation(api.splashEvents.create);
  const updateEvent = useMutation(api.splashEvents.update);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    feature: "",
    headline: "",
    subtext: "",
    primaryCtaLabel: "",
    primaryCtaAction: "link",
    primaryCtaLink: "",
    secondaryCtaEnabled: false,
    secondaryCtaLabel: "",
    secondaryCtaAction: "link",
    secondaryCtaLink: "",
    remindMeLater: true,
    noThanks: true,
    includeAudience: [],
    excludeAudience: [],
    includePidSso: false,
    startDate: "",
    endDate: "",
    timezone: "America/New_York",
    frequency: "once",
    dismissDays: 7,
    priority: 3,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description || "",
        feature: event.feature,
        headline: event.headline || "",
        subtext: event.subtext || "",
        primaryCtaLabel: event.primaryCtaLabel || "",
        primaryCtaAction: event.primaryCtaAction || "link",
        primaryCtaLink: event.primaryCtaLink || "",
        secondaryCtaEnabled: event.secondaryCtaEnabled,
        secondaryCtaLabel: event.secondaryCtaLabel || "",
        secondaryCtaAction: event.secondaryCtaAction || "link",
        secondaryCtaLink: event.secondaryCtaLink || "",
        remindMeLater: event.remindMeLater,
        noThanks: event.noThanks,
        includeAudience: event.includeAudience,
        excludeAudience: event.excludeAudience,
        includePidSso: event.includePidSso,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
        frequency: event.frequency,
        dismissDays: event.dismissDays,
        priority: event.priority,
      });
    }
  }, [event]);

  const isValid = formData.name && formData.feature && formData.startDate && formData.endDate;

  const estimatedAudience = Math.floor(Math.random() * 5000 + 500);

  const handleSave = async (status: "draft" | "scheduled" | "active") => {
    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        feature: formData.feature,
        status,
        headline: formData.headline || undefined,
        subtext: formData.subtext || undefined,
        primaryCtaLabel: formData.primaryCtaLabel || undefined,
        primaryCtaAction: formData.primaryCtaAction || undefined,
        primaryCtaLink: formData.primaryCtaLink || undefined,
        secondaryCtaEnabled: formData.secondaryCtaEnabled,
        secondaryCtaLabel: formData.secondaryCtaLabel || undefined,
        secondaryCtaAction: formData.secondaryCtaAction || undefined,
        secondaryCtaLink: formData.secondaryCtaLink || undefined,
        remindMeLater: formData.remindMeLater,
        noThanks: formData.noThanks,
        includeAudience: formData.includeAudience,
        excludeAudience: formData.excludeAudience,
        includePidSso: formData.includePidSso,
        estimatedAudience,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timezone: formData.timezone,
        frequency: formData.frequency,
        dismissDays: formData.dismissDays,
        priority: formData.priority,
      };

      if (eventId) {
        await updateEvent({ id: eventId as Id<"splashEvents">, ...data });
      } else {
        await createEvent(data);
      }
      onSave();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setShowPublishModal(false);
    const startDateObj = new Date(formData.startDate);
    const now = new Date();
    handleSave(startDateObj > now ? "scheduled" : "active");
  };

  const toggleAudience = (list: "include" | "exclude", value: string) => {
    const key = list === "include" ? "includeAudience" : "excludeAudience";
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
            {eventId ? "Edit Splash Event" : "Create Splash Event"}
          </h1>
          <p className="text-slate-500 text-sm">Configure your campaign settings</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Upgrade to Premium Analytics"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Notes for internal reference..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Feature <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.feature}
                onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
              >
                <option value="">Select a feature...</option>
                {features.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Splash Content */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            Splash Content
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Splash Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-500">Drag and drop an image, or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g., Unlock Premium Analytics"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtext</label>
              <input
                type="text"
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                placeholder="Brief description or value proposition..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Call-To-Action */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
            Call-To-Action
          </h2>
          <div className="space-y-6">
            {/* Primary CTA */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-800 mb-3">Primary CTA</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Label</label>
                  <input
                    type="text"
                    value={formData.primaryCtaLabel}
                    onChange={(e) => setFormData({ ...formData, primaryCtaLabel: e.target.value })}
                    placeholder="e.g., Upgrade Now"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Type</label>
                  <select
                    value={formData.primaryCtaAction}
                    onChange={(e) => setFormData({ ...formData, primaryCtaAction: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  >
                    <option value="link">Link</option>
                    <option value="contact">Contact</option>
                    <option value="signup">Signup</option>
                  </select>
                </div>
              </div>
              {formData.primaryCtaAction === "link" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Link URL</label>
                  <input
                    type="text"
                    value={formData.primaryCtaLink}
                    onChange={(e) => setFormData({ ...formData, primaryCtaLink: e.target.value })}
                    placeholder="e.g., /upgrade"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  />
                </div>
              )}
            </div>

            {/* Secondary CTA */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-800">Secondary CTA</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.secondaryCtaEnabled}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {formData.secondaryCtaEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Label</label>
                      <input
                        type="text"
                        value={formData.secondaryCtaLabel}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaLabel: e.target.value })}
                        placeholder="e.g., Learn More"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Type</label>
                      <select
                        value={formData.secondaryCtaAction}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaAction: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                      >
                        <option value="link">Link</option>
                        <option value="contact">Contact</option>
                        <option value="signup">Signup</option>
                      </select>
                    </div>
                  </div>
                  {formData.secondaryCtaAction === "link" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Link URL</label>
                      <input
                        type="text"
                        value={formData.secondaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                        placeholder="e.g., /features"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Additional Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remindMeLater}
                  onChange={(e) => setFormData({ ...formData, remindMeLater: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-slate-700">Remind Me Later</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.noThanks}
                  onChange={(e) => setFormData({ ...formData, noThanks: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-slate-700">No Thanks</span>
              </label>
            </div>
          </div>
        </section>

        {/* Section 4: Audience Targeting */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
            Audience Targeting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Include */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h3 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Include
              </h3>
              <div className="space-y-2">
                {audienceOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeAudience.includes(opt)}
                      onChange={() => toggleAudience("include", opt)}
                      className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-emerald-800">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Exclude */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Exclude
              </h3>
              <div className="space-y-2">
                {excludeOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.excludeAudience.includes(opt)}
                      onChange={() => toggleAudience("exclude", opt)}
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500/20"
                    />
                    <span className="text-sm text-red-800">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includePidSso}
                onChange={(e) => setFormData({ ...formData, includePidSso: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span className="text-sm text-slate-700">Include PID/SSO users</span>
            </label>
            <div className="px-4 py-2 bg-blue-50 rounded-lg text-sm">
              <span className="text-blue-600 font-medium">Estimated audience:</span>
              <span className="text-blue-800 font-semibold ml-2">{estimatedAudience.toLocaleString()} users</span>
            </div>
          </div>
        </section>

        {/* Section 5: Scheduling */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
            Scheduling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 6: Display Rules */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
            Display Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
              >
                <option value="once">Once</option>
                <option value="once_per_day">Once per day</option>
                <option value="every_login">Every login</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hide for X days after dismiss</label>
              <input
                type="number"
                value={formData.dismissDays}
                onChange={(e) => setFormData({ ...formData, dismissDays: parseInt(e.target.value) || 0 })}
                min={0}
                max={365}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 7: Priority */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
            Priority
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority Level: <span className="text-blue-600 font-semibold">{formData.priority}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low (1)</span>
              <span>High (5)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Higher priority events override others when multiple are scheduled</p>
          </div>
        </section>

        {/* Section 8: Preview */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
            Preview
          </h2>
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Splash
          </button>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !formData.name}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Preview
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={saving || !isValid}
            className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-40 flex items-center justify-center">
              <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {formData.headline || "Your Headline Here"}
              </h3>
              <p className="text-slate-600 mb-6">
                {formData.subtext || "Your subtext will appear here"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium">
                  {formData.primaryCtaLabel || "Primary CTA"}
                </button>
                {formData.secondaryCtaEnabled && (
                  <button className="flex-1 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-medium">
                    {formData.secondaryCtaLabel || "Secondary CTA"}
                  </button>
                )}
              </div>
              {(formData.remindMeLater || formData.noThanks) && (
                <div className="flex justify-center gap-4 mt-4 text-sm text-slate-500">
                  {formData.remindMeLater && <button className="hover:text-slate-700">Remind me later</button>}
                  {formData.noThanks && <button className="hover:text-slate-700">No thanks</button>}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Publish Event</h3>
                <p className="text-slate-500 text-sm">Confirm your campaign</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">This event will go live based on the scheduled dates. Users will start seeing this splash when the campaign is active.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
