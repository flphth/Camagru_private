#!/bin/sh
set -e

# Build the msmtp configuration from the environment (relay stays out of the image)
cat > /etc/msmtprc <<EOF
defaults
auth ${SMTP_AUTH:-off}
tls ${SMTP_TLS:-off}
logfile /tmp/msmtp.log

account default
host ${SMTP_HOST:-localhost}
port ${SMTP_PORT:-25}
from ${MAIL_FROM:-no-reply@camagru.local}
EOF

if [ -n "$SMTP_USER" ]; then
    echo "user $SMTP_USER" >> /etc/msmtprc
fi
if [ -n "$SMTP_PASS" ]; then
    echo "password $SMTP_PASS" >> /etc/msmtprc
fi

chmod 600 /etc/msmtprc
chown www-data:www-data /etc/msmtprc

exec apache2-foreground
