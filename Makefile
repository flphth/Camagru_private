.DEFAULT_GOAL := all

COMPOSE = docker compose -f ./docker-compose.yml
ENV_FILE = .env

check-env:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "[ERROR] Missing $(ENV_FILE) file. Copy .env-example to .env before running make."; \
		exit 1; \
	fi

all: check-env build up

build: check-env
	@echo "> Building images 🎉"
	@$(COMPOSE) build

up: check-env
	@echo "> Starting containers 🎉"
	@$(COMPOSE) up -d

down:
	@echo "> Stopping containers ❌"
	@$(COMPOSE) down

# Remove all project containers and all unused Docker volumes
clean:
	@echo "> Removing all project containers and Docker volumes 🧹"
	@$(COMPOSE) down -v || true
	docker volume prune -f

re: check-env
	@make clean
	@make build
	@make up

.PHONY: all build up down clean re check-env
