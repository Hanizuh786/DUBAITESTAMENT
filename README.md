Copy `src` into the project, append `ADD_TO_GLOBALS.scss` to `src/app/globals.scss`, and use `NAVBAR.tsx` in `src/app/page.tsx`.
Copy `.env.example` to `.env.local`. Never prefix the Espo API key with `NEXT_PUBLIC_`.
The API route uses a staging JSON field until the final Espo fields are created.
Because an API route is included, remove `output: "export"` from `next.config.mjs` and deploy to a server-capable Next.js host.
