# 🌸 The Curated Corner — Your Author Studio

You now have a private dashboard where you can write, edit, and delete blog
posts with images — no code needed. Here's how to get it running.

## ✅ One-time setup (about 3 minutes)

### 1. Create the database tables
1. Go to your Supabase project → **SQL Editor** → **New query**.
2. Open the file **`supabase-setup.sql`** (in this project), copy everything,
   paste it in, and click **Run**.
   - This creates your `posts` table, the image storage bucket, and the
     newsletter/contact tables — all with security rules so only *you* can edit.

### 2. Create your login
1. In Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: `kklinsane@gmail.com` (or whichever you prefer)
3. Choose a strong password.
4. ✅ Tick **Auto Confirm User**, then create.

That's it. You never need to touch Supabase again unless you want to.

## ✍️ Writing posts

1. Go to **`https://the-curated-corner.vercel.app/admin.html`**
   *(bookmark this — it's your private studio, hidden from search engines).*
2. Log in with the email + password you just created.
3. Fill in the title, pick a category, write your content, and upload a cover image.
   - The **live preview** on the right shows exactly how it'll look.
   - Use the toolbar buttons (Heading, List, Quote, Tip box, Insert image) to format.
   - Just leave a blank line between paragraphs — they format automatically.
4. Click **Publish post** ✨ — it appears on your blog instantly.

- **Edit / Delete** any post from the list at the bottom of the studio.
- Toggle **Published** off to save a private draft that visitors can't see.

## 💡 Good to know

- Your real posts automatically show on the **Home page** and **Blog page**.
  The sample/demo posts disappear as soon as you publish your first one.
- Images you upload are stored in Supabase and served fast worldwide.
- Newsletter signups and contact messages land in your Supabase tables
  (`subscribers` and `contact_messages`) — view them in the Supabase Table Editor.

## 🔒 Security notes

- `supabase-config.js` contains your project URL and **publishable** key.
  These are *meant* to be public — security is enforced by database rules (RLS),
  so visitors can only read published posts, never edit anything.
- Your **secret** key lives only in `.env.local` (never committed) and in Vercel's
  environment variables. Keep it secret.
