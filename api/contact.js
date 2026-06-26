import { withSupabase } from "@supabase/server"

// POST /api/contact — saves contact form messages to Supabase.
// Public form endpoint: anyone may POST. We write with supabaseAdmin
// (service role) so the `contact_messages` table can stay fully locked by RLS.
export default withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  let body
  try { body = await req.json() } catch { body = {} }
  const { name, email, message } = body

  if (!email || !message) {
    return Response.json({ error: "Email and message are required" }, { status: 400 })
  }

  const { error } = await ctx.supabaseAdmin
    .from("contact_messages")
    .insert({ name: name || null, email, message })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Message sent!" }, { status: 200 })
})
