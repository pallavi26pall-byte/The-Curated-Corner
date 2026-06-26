import { withSupabase } from "@supabase/server"

// POST /api/contact — saves contact form messages to Supabase
export default withSupabase({ auth: "publishable" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  const { name, email, message } = await req.json()

  if (!email || !message) {
    return Response.json({ error: "Email and message are required" }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from("contact_messages")
    .insert({ name: name || null, email, message })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Message sent!" }, { status: 200 })
})
