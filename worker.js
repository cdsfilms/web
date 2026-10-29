// Cloudflare Worker in front of the static homepage: www 301s to the apex (as GitHub Pages did);
// everything else is served from the assets listed in wrangler.jsonc minus .assetsignore.
const APEX = "https://cdsfilms.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.cdsfilms.com") {
      return Response.redirect(APEX + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
