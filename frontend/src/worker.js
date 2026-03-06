export default {
  async fetch(request, env) {
    // `ASSETS` binding is provided by Wrangler/Pages when `assets.directory` is set.
    // This minimal worker simply delegates requests to the Pages assets binding.
    return env.ASSETS.fetch(request);
  }
}
