import { withSupabase } from "@supabase/server"

// POST /api/subscribe — saves newsletter email to Supabase
export default withSupabase({ auth: "publishable" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  const { name, email } = await req.json()

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from("subscribers")
    .insert({ name: name || null, email })

  if (error) {
    if (error.code === "23505") {
      return Response.json({ message: "Already subscribed!" }, { status: 200 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Subscribed successfully!" }, { status: 200 })
})
