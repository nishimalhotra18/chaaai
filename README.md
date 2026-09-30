# CHAAAI

Master Chai's unofficial system interface. Powered by Dobby.

## Architecture

- **Frontend:** static HTML/CSS/JS, intended for GitHub Pages
- **Dobby API:** Cloudflare Worker (see `worker/`)
- **LLM:** configured server-side through the Worker; no API keys are exposed to the browser
- **Conversation:** three LLM questions per browser session, then a deterministic Dobby sign-off
- **Easter eggs:** `help`, `whoami`, `status`, and `sudo` are handled locally and do not use the LLM

## Local preview

Serve the repository with any static HTTP server. For example:

```bash
python3 -m http.server 8080
```

The terminal UI works without the backend. Until the Worker URL is configured, Dobby displays an in-character offline response.

## Connecting Dobby

Deploy the Cloudflare Worker in `worker/`, configure its secrets, then set `window.CHAAAI_API_URL` before `app.js` loads (or replace the empty `API_URL` value in `app.js`).

Never commit an LLM API key to this repository.
