# Private server

Ubuntu 24.04, 2 GB RAM or more. The Vercel build is unchanged. This server uses `npm run build:node`.

The daily backup is Postgres data only. It does not create tables. It also leaves out the desk password, the Resend key, and the SMTP2GO key.

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

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/app
sudo chown deploy:deploy /var/www/app
sudo -u postgres psql -c "CREATE USER app WITH PASSWORD 'choose-a-long-password';"
sudo -u postgres psql -c "CREATE DATABASE accountholding OWNER app;"
```

Leave Postgres on localhost. Do not open port 5432.

## 4. Code and environment

```bash
sudo -u deploy git clone https://github.com/nyzoom933-ops/apex-clear-zephyr-mint.git /var/www/app
sudo -u deploy tee /var/www/app/.env >/dev/null <<'EOF'
DATABASE_URL=postgresql://app:choose-a-long-password@127.0.0.1:5432/accountholding
CRON_SECRET=another-long-random-string
PORT=3000
EOF
sudo chmod 600 /var/www/app/.env
sudo chown deploy:deploy /var/www/app/.env
```

`npm run build:node` must exist. If it does not, GitHub does not have the latest code yet.

```bash
sudo -u deploy bash -lc 'cd /var/www/app && npm ci && npm run build:node'
```

The build creates the tables.

## 5. Restore the daily backup

Unzip the email attachment. Copy the `.sql` file to the server, then replace the starter rows with the backup:

```bash
sudo -u postgres psql -d accountholding -c "DO \$\$ DECLARE r RECORD; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_migrations' LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END \$\$;"
sudo -u postgres psql -d accountholding -f /root/database.sql
```

## 6. HTTPS

Replace `yourdomain.com` in `/etc/caddy/Caddyfile`:

```text
yourdomain.com {
  reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

## 7. Start the service

```bash
sudo cp /var/www/app/deploy/accountholding.service /etc/systemd/system/accountholding.service
sudo systemctl daemon-reload
sudo systemctl enable --now accountholding
sudo systemctl status accountholding
curl -I http://127.0.0.1:3000/
```

A working server redirects to `/login`.

## 8. Scheduled jobs

```bash
sudo crontab -e
```

```cron
0 12 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/backup
15 * * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/lead-reminders
```

Use the same `CRON_SECRET` as in `.env`.

## 9. First login

Open `https://yourdomain.com/admin`.

The backup does not include the desk password. On this server the first visit creates the preview login if none is stored:

- Email: `admin@accountholding.com`
- Password: `holding-admin`

Change that password immediately under desk settings. Then set **Public domain** to `https://yourdomain.com`, and enter the Resend key and the SMTP2GO key again.

## Later updates

```bash
sudo -u deploy bash -lc 'cd /var/www/app && git pull && npm ci && npm run build:node'
sudo systemctl restart accountholding
```
