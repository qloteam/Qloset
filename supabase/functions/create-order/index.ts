// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const PROJECT_URL = Deno.env.get("PROJECT_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ code: 401, message: "Missing authorization header" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // ✅ verify via Supabase Auth REST API with anon key
    const verifyRes = await fetch(`${PROJECT_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apiKey: ANON_KEY,
      },
    });

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.error("Auth verify failed:", errText);
      return new Response(JSON.stringify({ code: 401, message: "Invalid JWT" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = await verifyRes.json();

    // 🧾 parse body
    const body = await req.json();
    const { addressId, items, tbyb } = body;

    if (!addressId || !items?.length) {
      return new Response(JSON.stringify({ code: 400, message: "Missing order data" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // ✅ insert order using service role key
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        address_id: addressId,
        items,
        tbyb: !!tbyb,
        payment_method: "COD",
        status: "Placed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Order created for:", user.email);

    return new Response(JSON.stringify({ success: true, order: data }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (err) {
    console.error("❌ create-order error:", err);
    return new Response(JSON.stringify({ code: 500, message: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
