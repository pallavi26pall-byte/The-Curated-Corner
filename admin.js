/* ============================================================
   The Curated Corner — Author Studio (admin) logic
   Auth + create / edit / delete posts + image uploads.
   ============================================================ */

const $ = (id) => document.getElementById(id);
const sb = window.sb;

/* ---------- tiny toast ---------- */
let toastTimer;
function toast(msg, type = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast " + type), 3200);
}

/* ---------- auth ---------- */
async function refreshAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    $("loginView").classList.add("hidden");
    $("dashboardView").classList.remove("hidden");
    $("whoami").textContent = session.user.email;
    loadPosts();
  } else {
    $("dashboardView").classList.add("hidden");
    $("loginView").classList.remove("hidden");
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("loginBtn");
  $("loginErr").textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing in…";
  const { error } = await sb.auth.signInWithPassword({
    email: $("loginEmail").value.trim(),
    password: $("loginPassword").value,
  });
  btn.disabled = false;
  btn.textContent = "Enter the Studio ✨";
  if (error) {
    $("loginErr").textContent = error.message || "Could not sign in.";
    return;
  }
  refreshAuth();
});

$("logoutBtn").addEventListener("click", async () => {
  await sb.auth.signOut();
  refreshAuth();
});

/* ---------- slug + read time + preview ---------- */
let slugEdited = false;
$("slug").addEventListener("input", () => { slugEdited = true; updatePreview(); });

$("title").addEventListener("input", () => {
  if (!slugEdited) $("slug").value = window.slugify($("title").value);
  updatePreview();
});

["excerpt", "content", "category", "coverUrl"].forEach((id) =>
  $(id).addEventListener("input", updatePreview)
);

function updatePreview() {
  const title = $("title").value.trim();
  const cat = $("category").value;
  const cover = $("coverUrl").value.trim();
  const html = window.toHtml($("content").value);

  $("slugEcho").textContent = $("slug").value || window.slugify(title) || "…";
  $("pvCat").textContent = window.catEmoji(cat) + " " + cat;
  $("pvTitle").textContent = title || "Your title appears here";
  $("pvExcerpt").textContent = $("excerpt").value.trim();
  const rt = window.estimateReadTime(html);
  $("readTimeHint").textContent = "Reading time: ~" + rt + " min";
  $("pvMeta").textContent = "By Pallavi K. · today · " + rt + " min read";

  if (cover) { $("pvCover").src = cover; $("pvCover").style.display = "block"; }
  else { $("pvCover").style.display = "none"; }

  $("pvBody").innerHTML = html || '<p style="color:var(--text-light)">Start writing to see your post come to life…</p>';
}

/* ---------- formatting toolbar ---------- */
const WRAPS = {
  h2:        (s) => "<h2>" + (s || "Section heading") + "</h2>",
  b:         (s) => "<strong>" + (s || "bold text") + "</strong>",
  i:         (s) => "<em>" + (s || "italic text") + "</em>",
  ul:        (s) => "<ul>\n  <li>" + (s || "First item") + "</li>\n  <li>Second item</li>\n</ul>",
  blockquote:(s) => "<blockquote>" + (s || "A quote worth pinning.") + "</blockquote>",
  tip:       (s) => '<div class="tip-box"><strong>✨ Tip</strong> ' + (s || "Your helpful tip here.") + "</div>",
  a:         (s) => '<a href="https://" target="_blank">' + (s || "link text") + "</a>",
};

document.querySelectorAll(".toolbar button[data-wrap]").forEach((b) => {
  b.addEventListener("click", () => {
    const ta = $("content");
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = ta.value.slice(start, end);
    const ins = WRAPS[b.dataset.wrap](sel);
    const block = (b.dataset.wrap === "b" || b.dataset.wrap === "i" || b.dataset.wrap === "a") ? ins : "\n\n" + ins + "\n\n";
    ta.value = ta.value.slice(0, start) + block + ta.value.slice(end);
    ta.focus();
    updatePreview();
  });
});

/* ---------- image uploads ---------- */
async function uploadImage(file) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "_");
  const path = "posts/" + Date.now() + "-" + safe;
  const { error } = await sb.storage.from("blog-images").upload(path, file, {
    cacheControl: "3600", upsert: false,
  });
  if (error) throw error;
  const { data } = sb.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}

// cover image
$("coverDrop").addEventListener("click", () => $("coverFile").click());
$("coverFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  toast("Uploading cover…");
  try {
    const url = await uploadImage(file);
    $("coverUrl").value = url;
    setCoverPreview(url);
    updatePreview();
    toast("Cover uploaded", "ok");
  } catch (err) { toast("Upload failed: " + err.message, "err"); }
});
$("coverUrl").addEventListener("input", () => setCoverPreview($("coverUrl").value.trim()));

function setCoverPreview(url) {
  const img = $("coverPreview"), ph = $("coverPh"), drop = $("coverDrop");
  if (url) { img.src = url; img.classList.remove("hidden"); ph.classList.add("hidden"); drop.classList.add("has-img"); }
  else { img.classList.add("hidden"); ph.classList.remove("hidden"); drop.classList.remove("has-img"); }
}

// inline content image
$("insertImgBtn").addEventListener("click", () => $("contentImgFile").click());
$("contentImgFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  toast("Uploading image…");
  try {
    const url = await uploadImage(file);
    const ta = $("content");
    const pos = ta.selectionStart;
    const snippet = '\n\n<img src="' + url + '" alt="">\n\n';
    ta.value = ta.value.slice(0, pos) + snippet + ta.value.slice(pos);
    updatePreview();
    toast("Image inserted", "ok");
  } catch (err) { toast("Upload failed: " + err.message, "err"); }
  e.target.value = "";
});

/* ---------- save (create / update) ---------- */
$("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("saveBtn");
  const title = $("title").value.trim();
  let slug = $("slug").value.trim() || window.slugify(title);
  if (!title) return toast("Add a title first", "err");
  if (!slug) return toast("Add a slug first", "err");

  const html = window.toHtml($("content").value);
  const record = {
    title,
    slug,
    category: $("category").value,
    excerpt: $("excerpt").value.trim() || null,
    content: $("content").value,           // store raw so editing is faithful
    cover_image: $("coverUrl").value.trim() || null,
    read_time: window.estimateReadTime(html),
    published: $("published").checked,
  };

  btn.disabled = true;
  btn.textContent = "Saving…";
  const id = $("postId").value;
  let error;
  if (id) {
    ({ error } = await sb.from("posts").update(record).eq("id", id));
  } else {
    ({ error } = await sb.from("posts").insert(record));
  }
  btn.disabled = false;
  btn.textContent = id ? "Update post ✨" : "Publish post ✨";

  if (error) {
    if (error.code === "23505") return toast("That slug is already used — change it.", "err");
    return toast("Save failed: " + error.message, "err");
  }
  toast(id ? "Post updated" : "Post published 🎉", "ok");
  resetForm();
  loadPosts();
});

/* ---------- new / reset ---------- */
$("newBtn").addEventListener("click", resetForm);
function resetForm() {
  $("postForm").reset();
  $("postId").value = "";
  $("published").checked = true;
  slugEdited = false;
  setCoverPreview("");
  $("editorTitle").textContent = "Write a new post";
  $("saveBtn").textContent = "Publish post ✨";
  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- list / edit / delete ---------- */
async function loadPosts() {
  const list = $("postsList");
  const { data, error } = await sb.from("posts").select("*").order("created_at", { ascending: false });
  if (error) { list.innerHTML = '<div class="empty">Could not load posts: ' + window.escapeHtml(error.message) + "</div>"; return; }
  if (!data.length) { list.innerHTML = '<div class="empty">No posts yet — write your first one above! ✍️</div>'; return; }

  list.innerHTML = data.map((p) => `
    <div class="post-row">
      <img src="${p.cover_image || ""}" alt="" onerror="this.style.visibility='hidden'" />
      <div class="meta">
        <div class="t">${window.escapeHtml(p.title)}${p.published ? "" : '<span class="badge-draft">Draft</span>'}</div>
        <div class="s">${window.catEmoji(p.category)} ${window.escapeHtml(p.category)} · ${window.formatDate(p.created_at)} · ${p.read_time || 1} min</div>
      </div>
      <div class="acts">
        <a class="icon-btn" href="post.html?slug=${encodeURIComponent(p.slug)}" target="_blank">View</a>
        <button class="icon-btn" data-edit="${p.id}">Edit</button>
        <button class="icon-btn danger" data-del="${p.id}" data-title="${window.escapeHtml(p.title)}">Delete</button>
      </div>
    </div>`).join("");

  window._posts = data;
  list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editPost(b.dataset.edit)));
  list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deletePost(b.dataset.del, b.dataset.title)));
}

function editPost(id) {
  const p = (window._posts || []).find((x) => x.id === id);
  if (!p) return;
  $("postId").value = p.id;
  $("title").value = p.title || "";
  $("slug").value = p.slug || "";
  $("category").value = p.category || "Lifestyle";
  $("excerpt").value = p.excerpt || "";
  $("content").value = p.content || "";
  $("coverUrl").value = p.cover_image || "";
  $("published").checked = !!p.published;
  slugEdited = true;
  setCoverPreview(p.cover_image || "");
  $("editorTitle").textContent = "Edit post";
  $("saveBtn").textContent = "Update post ✨";
  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast("Editing: " + p.title);
}

async function deletePost(id, title) {
  if (!confirm('Delete "' + title + '"?\nThis cannot be undone.')) return;
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) return toast("Delete failed: " + error.message, "err");
  toast("Post deleted", "ok");
  if ($("postId").value === id) resetForm();
  loadPosts();
}

$("refreshBtn").addEventListener("click", loadPosts);

/* ---------- boot ---------- */
sb.auth.onAuthStateChange(() => {});
refreshAuth();
updatePreview();
