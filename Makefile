COMPOSE = docker compose -f ./docker-compose.yml

all: build up

build:
	@echo "> Building images 🎉"
	@$(COMPOSE) build

up:
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

re:
	@make clean
	@make build
	@make up

.PHONY: all build up down clean re
