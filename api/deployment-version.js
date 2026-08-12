export function GET() {
  var deployment = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_URL || "local";
  return Response.json({ deployment: deployment }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
