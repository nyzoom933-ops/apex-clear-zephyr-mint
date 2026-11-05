# Private server

Ubuntu 24.04, 2 GB RAM or more. The Vercel build is unchanged. This server uses `npm run build:node`.

A fresh database is enough. Do not restore a backup. Migrations create the empty tables.

Do not point this server and Vercel at the same database while both are public.

## 1. Create the VPS

- Image: Ubuntu 24.04
- Size: 2 GB RAM or more
- Add your SSH key
- Point the domain's A record at the server IP

## 2. Install packages

```bash
sudo apt update
sudo apt install -y git curl ca-certificates ufw postgresql postgresql-contrib caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 3. App user and database

Use a password made of letters and numbers. The same password goes in Postgres and in `.env`.

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/app
sudo chown deploy:deploy /var/www/app
sudo -u postgres psql -c "CREATE USER app WITH PASSWORD 'LongRandomPassword123';"
sudo -u postgres psql -c "CREATE DATABASE accountholding OWNER app;"
```

Leave Postgres on localhost. Do not open port 5432.

## 4. Code and environment

```bash
sudo -u deploy git clone https://github.com/nyzoom933-ops/apex-clear-zephyr-mint.git /var/www/app
sudo -u deploy tee /var/www/app/.env >/dev/null <<'EOF'
DATABASE_URL=postgresql://app:LongRandomPassword123@127.0.0.1:5432/accountholding
CRON_SECRET=another-long-random-string
PORT=3000
EOF
sudo chmod 600 /var/www/app/.env
sudo chown deploy:deploy /var/www/app/.env
```

`npm run build:node` must exist. If it does not, GitHub does not have the latest code yet. Load `.env` or the migration step skips and the desk cannot sign in.

```bash
sudo -u deploy bash -lc 'cd /var/www/app && npm ci && set -a && . ./.env && set +a && npm run build:node'
sudo -u postgres psql -d accountholding -c '\dt'
```

`\dt` must list `site_settings`. If migrate prints `password authentication failed`, the password in `.env` does not match the Postgres user.

## 5. HTTPS

Replace `yourdomain.com` in `/etc/caddy/Caddyfile`:

```text
yourdomain.com {
  reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

## 6. Start the service

```bash
sudo cp /var/www/app/deploy/accountholding.service /etc/systemd/system/accountholding.service
sudo systemctl daemon-reload
sudo systemctl enable --now accountholding
sudo systemctl status accountholding
curl -I http://127.0.0.1:3000/
```

A working server redirects to `/login`.

## 7. Scheduled jobs

These are optional. The site runs without them. The daily backup cron only emails a copy of this server's database. It is not used to set the server up.

```bash
sudo crontab -e
```

```cron
0 12 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/backup
15 * * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/lead-reminders
```

Use the same `CRON_SECRET` as in `.env`.

## 8. First login

Open `https://yourdomain.com/admin`.

The first visit creates the desk login:

- Email: `admin@accountholding.com`
- Password: `holding-admin`

Change that password immediately under desk settings. Then set **Public domain** to `https://yourdomain.com`, and enter the Resend key and the SMTP2GO key.

## Later updates

```bash
sudo -u deploy bash -lc 'cd /var/www/app && git pull && npm ci && set -a && . ./.env && set +a && npm run build:node'
sudo systemctl restart accountholding
```
