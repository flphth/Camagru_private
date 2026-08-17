FROM mariadb:11.4.2

ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_ROOT_PASSWORD
ARG JWT_SECRET

ENV MYSQL_DATABASE ${DB_NAME}
ENV MYSQL_USER ${DB_USER}
ENV MYSQL_PASSWORD ${DB_PASSWORD}
ENV MYSQL_ROOT_PASSWORD ${DB_ROOT_PASSWORD}

ENV MARIADB_DATABASE ${DB_NAME}
ENV MARIADB_USER ${DB_USER}
ENV MARIADB_PASSWORD ${DB_PASSWORD}
ENV MARIADB_ROOT_PASSWORD ${DB_ROOT_PASSWORD}

COPY 00-schema.sql /docker-entrypoint-initdb.d/
COPY 01-insert.sql /docker-entrypoint-initdb.d/

CMD ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_general_ci", "--skip-character-set-client-handshake"]