.PHONY: all server ngrok client setup stop clean dev pretty _pretty_windows _pretty_tmux

# Default target - runs all services
all: setup
	@echo "Starting all services..."
	@$(MAKE) -j3 server ngrok client

# Setup conda environment
setup:
	@echo "Activating conda environment..."
	@conda activate portfoliov3 || (echo "Error: portfoliov3 conda environment not found. Please create it first." && exit 1)

# Start the FastAPI server
server:
	@echo "Starting FastAPI server..."
	@cd server && conda run -n portfoliov3 uvicorn main:app --reload

# Start ngrok tunnel
ngrok:
	@echo "Starting ngrok tunnel..."
	@ngrok http --url=conversational.ngrok.app 8000

# Start the Next.js client
client:
	@echo "Starting Next.js client..."
	@cd client && pnpm dev

# Stop all services (if needed)
stop:
	@echo "Stopping services..."
	@pkill -f "uvicorn main:app" || true
	@pkill -f "ngrok http" || true
	@pkill -f "pnpm dev" || true

# Clean up processes
clean: stop
	@echo "Cleaned up all processes"

# Pretty side-by-side view of server and client logs
# - On Windows: uses Windows Terminal (wt.exe) split panes
# - On macOS/Linux: uses tmux if available; otherwise falls back to running both in the same terminal
dev: pretty

pretty:
ifeq ($(OS),Windows_NT)
	@$(MAKE) _pretty_windows
else
	@command -v tmux >/dev/null 2>&1 && $(MAKE) _pretty_tmux || (echo "tmux not found, running both in one terminal..." && (\
		(cd server && conda run -n portfoliov3 uvicorn main:app --reload &) && \
		(cd client && pnpm dev)\
	))
endif

_pretty_windows:
	@echo "Launching side-by-side logs in Windows Terminal..."
	@echo "Left pane: FastAPI server | Right pane: Next.js client"
	@cmd.exe /C "wt new-tab -d \"$(CURDIR)\" powershell -NoExit -Command \"cd server; conda run -n portfoliov3 uvicorn main:app --reload\" ; split-pane -H -d \"$(CURDIR)\" powershell -NoExit -Command \"cd client; pnpm dev\""

_pretty_tmux:
	@echo "Launching side-by-side logs in tmux (server | client)..."
	@tmux new-session -d -s portfoliov3 "cd server && conda run -n portfoliov3 uvicorn main:app --reload"
	@tmux split-window -h "cd client && pnpm dev"
	@tmux select-layout even-horizontal
	@tmux set -g mouse on >/dev/null 2>&1 || true
	@tmux attach-session -t portfoliov3
