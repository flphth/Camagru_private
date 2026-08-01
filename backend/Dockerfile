FROM php:8.2.20-apache-bookworm

ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_ROOT_PASSWORD

RUN apt-get update -yqq && apt-get upgrade -yqq && \
    DEBIAN_FRONTEND=noninteractive

RUN a2enmod rewrite

RUN apt-get install -y \
    libzip-dev \
    libpq-dev \
    libgd-dev \
    msmtp \
    msmtp-mta \
    ca-certificates \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip gd

RUN printf 'sendmail_path = "/usr/bin/msmtp -t"\n' > /usr/local/etc/php/conf.d/mail.ini

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]