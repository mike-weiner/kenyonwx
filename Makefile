PORT ?= 3000

.PHONY: up
up:
	@echo "Starting Docker Compose with port $(PORT)"
	PORT=$(PORT) docker compose up -d

.PHONEY: down
down:
	@echo "Stopping Docker Compose"
	PORT=$(PORT) docker compose down --volumes --rmi local

.PHONY: rebuild
rebuild:
	@echo "Rebuilding frontend web app with port $(PORT)"
	PORT=$(PORT) docker compose down frontend --volumes --rmi local
	PORT=$(PORT) docker compose build frontend
	PORT=$(PORT) docker compose up frontend -d
