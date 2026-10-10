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

## Portrait photograph attribution

The Dumbledore living portrait uses an actual behind-the-scenes photograph of **Michael Gambon in Dumbledore costume**, by **AaronTruss1989**, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Michael_Gambon_on_the_set_of_Harry_Potter_and_the_Half_Blood_Prince.png), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The photograph is UV-cropped and gently moved within a Three.js frame. The underlying photograph and adaptations of it are subject to the CC BY-SA 4.0 terms. This is a photograph in a 3D frame, not a rigged or facially animated character model. The image is loaded directly from Wikimedia Commons; if it cannot be loaded, a labelled fallback is shown.
