import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSiteSettings, saveSiteSettings } from "../../services/adminDb";
import type { SiteSettings } from "../../types/database";
import { siteDefaults } from "../../data/siteDefaults";
import { AdminField, AdminInput, AdminSection, AdminTextarea } from "./AdminUI";
import { CopyEditor } from "./CopyEditor";

export const ContentManager = () => {
  const [form, setForm] = useState<SiteSettings>(siteDefaults);
  const [capabilitiesText, setCapabilitiesText] = useState(
    JSON.stringify(siteDefaults.capabilities, null, 2),
  );
  const [interfaceText, setInterfaceText] = useState(
    JSON.stringify(siteDefaults.ui, null, 2),
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    getSiteSettings().then((settings) => {
      setForm(settings);
      setCapabilitiesText(JSON.stringify(settings.capabilities, null, 2));
      setInterfaceText(JSON.stringify(settings.ui, null, 2));
    });
  }, []);

  const set = <Key extends keyof SiteSettings>(
    key: Key,
    value: SiteSettings[Key],
  ) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Saving…");
    try {
      const capabilities = JSON.parse(capabilitiesText);
      const ui = JSON.parse(interfaceText);
      const next = { ...form, capabilities, ui };
      await saveSiteSettings(next);
      setForm(next);
      setStatus("Saved");
    } catch (error) {
      setStatus(
        error instanceof SyntaxError
          ? "One of the JSON editors is invalid."
          : "Could not save. Check Firestore permissions.",
      );
    }
  };

  return (
    <AdminSection
      title="Site copy"
      description="Edit the public-facing positioning and text without touching source code."
    >
      <form onSubmit={save} className="admin-form-stack">
        <p className="admin-copy-help">Headings and prose support <strong>bold</strong>, <em>italic</em>, and <code>inline code</code>. Select text and use the formatting controls, or type **bold**, *italic*, and `code`. Identity, navigation, social URLs, and SEO use plain text.</p>
        <div className="admin-form-grid">
          <AdminField label="Name">
            <AdminInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </AdminField>
          <AdminField label="Short name">
            <AdminInput
              value={form.shortName}
              onChange={(e) => set("shortName", e.target.value)}
            />
          </AdminField>
          <AdminField label="Location">
            <AdminInput
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </AdminField>
          <AdminField label="Availability">
            <AdminInput
              value={form.availability}
              onChange={(e) => set("availability", e.target.value)}
            />
          </AdminField>
        </div>

        <div className="admin-subsection">
          <h3>Home hero</h3>
          <AdminField label="Kicker">
            <AdminInput
              value={form.heroKicker}
              onChange={(e) => set("heroKicker", e.target.value)}
            />
          </AdminField>
          <CopyEditor label="Headline" rows={3} authoredLines value={form.heroTitle} onChange={value => set("heroTitle", value)} />
          <CopyEditor label="Intro" rows={4} value={form.heroBody} onChange={value => set("heroBody", value)} />
          <CopyEditor label="Current focus" rows={2} value={form.currentFocus} onChange={value => set("currentFocus", value)} />
        </div>

        <div className="admin-subsection">
          <h3>Profile</h3>
          <CopyEditor label="Title" rows={2} value={form.aboutTitle} onChange={value => set("aboutTitle", value)} />
          <CopyEditor label="Body" rows={5} value={form.aboutBody} onChange={value => set("aboutBody", value)} />
          <CopyEditor label="Context note" rows={3} value={form.aboutNote} onChange={value => set("aboutNote", value)} />
        </div>

        <div className="admin-form-grid">
          {(
            [
              ["workTitle", "Work title"],
              ["workIntro", "Work intro"],
              ["experienceTitle", "Experience title"],
              ["experienceIntro", "Experience intro"],
              ["credentialsTitle", "Credentials title"],
              ["credentialsIntro", "Credentials intro"],
              ["writingTitle", "Writing title"],
              ["writingIntro", "Writing intro"],
              ["contactTitle", "Contact title"],
              ["contactIntro", "Contact intro"],
            ] as [keyof SiteSettings, string][]
          ).map(([key, label]) => (
            <CopyEditor key={String(key)} label={label} rows={String(key).endsWith("Intro") ? 3 : 2} value={String(form[key] ?? "")} onChange={value => set(key, value)} />
          ))}
        </div>

        <div className="admin-subsection">
          <h3>Capabilities</h3>
          <p className="admin-help">
            Structured JSON keeps the capability cards fully editable while
            preserving their flexible tool lists.
          </p>
          <AdminTextarea
            rows={18}
            value={capabilitiesText}
            onChange={(e) => setCapabilitiesText(e.target.value)}
          />
        </div>

        <div className="admin-subsection">
          <h3>Interface copy</h3>
          <p className="admin-help">
            Advanced editor for navigation labels, section microcopy, CTAs,
            profile facts and other public text. This makes the redesign
            future-proof without hard-coding your current positioning.
          </p>
          <AdminTextarea
            rows={22}
            value={interfaceText}
            onChange={(e) => setInterfaceText(e.target.value)}
          />
        </div>

        <div className="admin-subsection">
          <h3>Social links</h3>
          <div className="admin-form-grid">
            {(
              ["github", "linkedin", "discord", "credly", "medium"] as const
            ).map((key) => (
              <AdminField key={key} label={key}>
                <AdminInput
                  value={form.socials[key] || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      socials: { ...p.socials, [key]: e.target.value },
                    }))
                  }
                />
              </AdminField>
            ))}
          </div>
        </div>

        <div className="admin-subsection">
          <h3>SEO</h3>
          <AdminField label="Default title">
            <AdminInput
              value={form.seo.title}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  seo: { ...p.seo, title: e.target.value },
                }))
              }
            />
          </AdminField>
          <AdminField label="Default description">
            <AdminTextarea
              rows={3}
              value={form.seo.description}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  seo: { ...p.seo, description: e.target.value },
                }))
              }
            />
          </AdminField>
        </div>

        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={form.chatbotEnabled}
            onChange={(e) => set("chatbotEnabled", e.target.checked)}
          />
          <span>Enable floating portfolio assistant</span>
        </label>
        <div className="admin-save-row">
          <span>{status}</span>
          <button className="admin-primary">
            <Save size={16} /> Save site copy
          </button>
        </div>
      </form>
    </AdminSection>
  );
};
