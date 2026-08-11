COMPOSE = docker-compose -f ./docker-compose.yml

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

# Remove ONLY this project's containers and volumes (gives a fresh database)
clean:
	@echo "> Removing this project's containers and volumes 🧹"
	@$(COMPOSE) down -v

re:
	@make clean
	@make build
	@make up

.PHONY: all build up down clean re
