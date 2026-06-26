/* ============================================================
   The Curated Corner — Supabase client + shared helpers
   ------------------------------------------------------------
   The URL and the PUBLISHABLE key below are SAFE to expose in
   the browser — that is what a publishable/anon key is for.
   Actual security is enforced by Row Level Security (RLS) on
   the database, so the public can only READ published posts and
   only YOU (after logging in) can create / edit / delete.
   ============================================================ */

const SUPABASE_URL = "https://hcoufoepdsttrxkatlnb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_U0ImDbRcpItjgM43InQeRg__m8gtFPn";

// `supabase` global comes from the supabase-js CDN script loaded before this file.
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/* ---------- Category metadata (emoji + accent) ---------- */
window.CATEGORIES = {
  "Nail Art":   { emoji: "💅", page: "nails.html" },
  "Fashion":    { emoji: "👗", page: "fashion.html" },
  "Home Decor": { emoji: "🏠", page: "decor.html" },
  "Lifestyle":  { emoji: "✨", page: "blog.html" },
  "Seasonal":   { emoji: "🍂", page: "blog.html" },
  "Home Office":{ emoji: "🪴", page: "decor.html" },
  "Gift Guides":{ emoji: "🛍️", page: "blog.html" },
};

window.catEmoji = function (cat) {
  return (window.CATEGORIES[cat] && window.CATEGORIES[cat].emoji) || "✨";
};

/* ---------- Small utilities ---------- */
window.escapeHtml = function (str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

window.slugify = function (str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

window.formatDate = function (iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return ""; }
};

// Estimate reading time (≈200 words/min) from HTML content.
window.estimateReadTime = function (html) {
  const text = String(html || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

// Forgiving content -> HTML. Blocks that already start with a tag are kept
// as-is; plain-text blocks become paragraphs (single newlines -> <br>).
// This lets you write naturally OR use the formatting toolbar.
window.toHtml = function (raw) {
  const src = String(raw || "").trim();
  if (!src) return "";
  return src
    .split(/\n\s*\n/)
    .map((block) => {
      const b = block.trim();
      if (!b) return "";
      if (b.charAt(0) === "<") return b; // already HTML (h2, ul, img, blockquote…)
      return "<p>" + b.replace(/\n/g, "<br>") + "</p>";
    })
    .filter(Boolean)
    .join("\n");
};
