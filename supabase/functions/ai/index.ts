// Supabase Edge Function: AI actions with credit metering, powered by Google Gemini.
// Secret required: GEMINI_API_KEY (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const MODEL = Deno.env.get("AI_MODEL") ?? "gemini-3.8-flash";
const SAFETY = "You are decision-support for qualified radiology professionals. Never give a definitive diagnosis, never sign or approve anything. Use cautious language ('suggests', 'consider'). All output is a draft for professional review.";
const REPORT = `{"clinical_indication":string,"technique":string,"comparison":string,"findings":string,"impression":string,"recommendations":string}`;

const ACTIONS: Record<string, { cost: number; system: string; json?: boolean }> = {
  analyze_study: { cost: 20, json: true, system: `${SAFETY} Given study metadata and clinical info, return JSON: {"study_organization":string,"detected_details":string[],"suggested_observations":string[],"differential_considerations":string[],"draft_report":${REPORT}}` },
  copilot: { cost: 5, system: `${SAFETY} You are a radiology-focused clinical copilot: organize findings, explore differentials, clarify terminology, flag missing context. End with 'Questions to review'.` },
  draft_report: { cost: 10, json: true, system: `${SAFETY} Convert dictation/observations into JSON ${REPORT}. Do not invent findings that were not provided.` },
  quality_review: { cost: 8, json: true, system: `${SAFETY} Review the draft report. Return JSON {"items":[{"check":"Laterality|Findings vs impression|Missing measurements|Ambiguous language|Follow-up clarity|Contradictions|Incomplete sections","status":"ok|review","detail":string}]}. Never rewrite the report.` },
  extract_request: { cost: 5, json: true, system: `${SAFETY} Extract from the referral JSON {"patient":string,"requested_exam":string,"clinical_question":string,"history":string,"missing_details":string[],"questions_for_review":string[]}.` },
  scribe: { cost: 8, system: `${SAFETY} Turn the consultation transcript into a concise structured clinical note (History, Findings discussed, Plan).` },
  schedule_insights: { cost: 5, system: "Analyse the shifts and attendance data provided and give coverage patterns, gaps and scheduling recommendations as brief bullet points." },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const authz = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authz } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u.user) return json({ error: "Unauthorized" }, 401);

    const { action, input, messages } = await req.json();
    const spec = ACTIONS[action];
    if (!spec) return json({ error: "Unknown action" }, 400);

    const { data: org } = await userClient.from("organizations").select("id").limit(1).single();
    if (!org) return json({ error: "No workspace" }, 403);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: ok } = await admin.rpc("spend_credits", { o: org.id, n: spec.cost });
    if (!ok) return json({ error: "Not enough AI credits. Upgrade your plan in Settings." }, 402);

    const msgs: { role: string; content: string }[] = messages ?? [{ role: "user", content: typeof input === "string" ? input : JSON.stringify(input) }];
    const call = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": Deno.env.get("GEMINI_API_KEY")!, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: spec.system }] },
        contents: msgs.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 4096, ...(spec.json ? { responseMimeType: "application/json" } : {}) },
      }),
    });
    let r = await call();
    for (let i = 0; i < 2 && (r.status === 503 || r.status === 429); i++) { // transient overload: retry
      await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
      r = await call();
    }
    if (!r.ok) {
      await admin.rpc("spend_credits", { o: org.id, n: -spec.cost }); // refund
      return json({ error: "AI provider error" }, 502);
    }
    const out = await r.json();
    const text: string = out.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    await admin.from("audit_log").insert({ org_id: org.id, user_id: u.user.id, action: `ai:${action}` });
    if (spec.json) {
      const m = text.match(/\{[\s\S]*\}/);
      return json({ result: m ? JSON.parse(m[0]) : null, raw: text });
    }
    return json({ result: text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
