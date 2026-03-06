# Rotating API keys and secrets

This document describes a safe, minimal process to rotate the secrets that were
previously committed to the repo and to reconfigure your environment.

1) Provider keys
 - YouTube Data API: generate a new API key in Google Cloud Console (or use
   an existing service account + API key). Update `YT_KEY` in your environment.
 - Stytch: rotate any project secret in the Stytch dashboard and note the new
   `STYTCH_SECRET`.

2) Local secrets
 - Generate new `API_KEY` and `ADMIN_SECRET` with the helper script:

    ./scripts/rotate_keys.sh

 - Edit the produced `.env.new` and add `YT_KEY` and `STYTCH_SECRET` values
   (provider-side keys must be set here manually).

3) Swap environment
 - Backup existing `.env` (if present):

    cp .env .env.bak

 - Move the new file into place:

    mv .env.new .env

4) Restart services
 - Using Docker Compose:

    docker compose down && docker compose up -d --build

5) Revoke old keys
 - After verifying the app works with the new keys, revoke the old keys in
   the provider consoles (Google Cloud, Stytch) to prevent misuse.

Security reminders
 - Never commit `.env` to git. Ensure `.gitignore` contains `.env`.
 - For production use a secrets manager (Railway/AWS Secrets Manager/Terraform
   Cloud variables) and avoid storing long-lived secrets in plaintext on disk.
