import { withSupabase } from "@supabase/server"

// POST /api/subscribe — saves newsletter signups to Supabase.
// Public form endpoint: anyone may POST. We write with supabaseAdmin
// (service role) so the `subscribers` table can stay fully locked by RLS.
export default withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  let body
  try { body = await req.json() } catch { body = {} }
  const { name, email } = body

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 })
  }

  const { error } = await ctx.supabaseAdmin
    .from("subscribers")
    .insert({ name: name || null, email })

  if (error) {
    if (error.code === "23505") {
      return Response.json({ message: "You're already subscribed!" }, { status: 200 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Subscribed successfully!" }, { status: 200 })
})
