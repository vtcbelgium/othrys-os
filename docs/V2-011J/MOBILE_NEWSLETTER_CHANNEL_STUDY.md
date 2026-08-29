# Mobile / Newsletter Channel Study

## Decision
**Use Telegram first for Prometheus delivery/actions; keep the native OTHRYS Command Deck/PWA as the long-term controller. Do not build a separate native Android app now.**

### Telegram bot — best immediate fit
Telegram already supplies mobile notifications, message history and inline callback buttons. One Prometheus newsletter can carry concise items plus `ADD` / `DENY` callbacks. The callback contains only opportunity identity/action; Keymaster secrets never enter Telegram.

Strengths: lowest build cost, push delivery, excellent one-tap actions, works on phone/tablet/desktop, and old OTHRYS Harvest already contains notification/webhook/Telegram patterns.

Gate: no live adapter until Keymaster has a Telegram bot token and the operator chat is explicitly bound. `ADD` remains a request into the Blood Loop, never direct install/enable authority.

### Telegram Mini App — optional second step
If status/control outgrows plain chat buttons, a Mini App can add Penta status, Care status, newsletter archive and Settings actions inside Telegram. It still needs a secure HTTPS web origin and must validate Telegram identity.
### Native OTHRYS PWA — correct long-term controller
The existing Command Deck should eventually become the installable phone/tablet controller rather than creating another backend. A PWA can install on Android and launch standalone. Private exposure through Tailscale Serve keeps the controller inside the tailnet instead of making it public.

Use it for richer controls: Penta diagnostics, nodes, Care, Settings, newsletter archive and future supervised actions. This remains postponed while core OS work is active.

### Native Android app — reject for now
It duplicates presentation, packaging and update work before a unique native requirement exists. Reconsider only if Android-only features later justify it.

## Channel preference
The OS report preference supports `GPT_ONLY`, `TELEGRAM`, `OTHRYS_APP`, or `BOTH`. Current GPT ecosystem-harvest reporting remains the default and is untouched until another channel is actually ready.

## Recommended sequence
1. Keep current GPT report.
2. Admit Telegram as a Hermes adapter with inline Add/Deny only.
3. Later install the Command Deck as a private PWA through Tailscale Serve.
4. Add Telegram Mini App only if chat buttons become cramped.
