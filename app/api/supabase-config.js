export var SUPABASE_CONFIG = Object.freeze({
  url: "https://etotvaneppzkxunezqrl.supabase.co",
  publishableKey: "sb_publishable_pWsGIwi69pKcT3Odf5jQIA_xbxfrGZg"
});

export function resolveSupabaseRuntimeConfig(explicitConfig) {
  var override = explicitConfig || {};
  return Object.freeze({
    url: override.url ? String(override.url) : SUPABASE_CONFIG.url,
    publishableKey: override.publishableKey ? String(override.publishableKey) : SUPABASE_CONFIG.publishableKey,
    environment: "revival",
    environmentLabel: ""
  });
}
