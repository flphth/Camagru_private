`.env`

```
DB_NAME=camagru
DB_USER=camagru
DB_PASSWORD=<secret>
DB_ROOT_PASSWORD=<secret>
JWT_SECRET=<secret>

# Mail
APP_URL=http://localhost:8080
MAIL_FROM=no-reply@camagru.local

# SMTP relay used by msmtp (defaults to the bundled Mailpit dev inbox)
SMTP_HOST=mailpit
SMTP_PORT=1025
# SMTP_AUTH=on
# SMTP_TLS=on
# SMTP_USER=<user>
# SMTP_PASS=<password>
```

Outgoing emails (account activation, password reset, comment notifications) are
caught by Mailpit and can be read at http://localhost:8025 — nothing leaves the
stack. Point `SMTP_HOST`/`SMTP_PORT` at a real relay to actually deliver mail.