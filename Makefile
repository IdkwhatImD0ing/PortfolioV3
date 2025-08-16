.PHONY: all server ngrok client setup stop clean dev pretty tabs _pretty_windows _pretty_tmux

# Default target - runs all services in separate terminals
all: tabs

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

# Run services in separate terminal tabs (recommended for clean logs)
tabs:
ifeq ($(OS),Windows_NT)
	@echo "Opening services in separate Windows Terminal tabs..."
	@wt new-tab --title "FastAPI Server" -d "$(CURDIR)\server" cmd /k "conda activate portfoliov3 && uvicorn main:app --reload"
	@wt new-tab --title "Next.js Client" -d "$(CURDIR)\client" cmd /k "pnpm dev"
	@wt new-tab --title "Ngrok Tunnel" -d "$(CURDIR)" cmd /k "ngrok http --url=conversational.ngrok.app 8000"
else
	@echo "Opening services in separate terminal windows..."
	@gnome-terminal --tab --title="FastAPI Server" -- bash -c "cd server && conda run -n portfoliov3 uvicorn main:app --reload; exec bash" 2>/dev/null || \
	xterm -T "FastAPI Server" -e "cd server && conda run -n portfoliov3 uvicorn main:app --reload; read" & 2>/dev/null || \
	osascript -e 'tell app "Terminal" to do script "cd $(CURDIR)/server && conda run -n portfoliov3 uvicorn main:app --reload"' 2>/dev/null || \
	echo "Please run manually: cd server && conda run -n portfoliov3 uvicorn main:app --reload"
	@gnome-terminal --tab --title="Next.js Client" -- bash -c "cd client && pnpm dev; exec bash" 2>/dev/null || \
	xterm -T "Next.js Client" -e "cd client && pnpm dev; read" & 2>/dev/null || \
	osascript -e 'tell app "Terminal" to do script "cd $(CURDIR)/client && pnpm dev"' 2>/dev/null || \
	echo "Please run manually: cd client && pnpm dev"
	@gnome-terminal --tab --title="Ngrok Tunnel" -- bash -c "ngrok http --url=conversational.ngrok.app 8000; exec bash" 2>/dev/null || \
	xterm -T "Ngrok Tunnel" -e "ngrok http --url=conversational.ngrok.app 8000; read" & 2>/dev/null || \
	osascript -e 'tell app "Terminal" to do script "cd $(CURDIR) && ngrok http --url=conversational.ngrok.app 8000"' 2>/dev/null || \
	echo "Please run manually: ngrok http --url=conversational.ngrok.app 8000"
endif

# Pretty side-by-side view of server and client logs
# - On Windows: uses Windows Terminal (wt.exe) split panes
# - On macOS/Linux: uses tmux if available
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
	@echo "Server (left) | Client (middle) | Ngrok (right)"
	@wt new-tab --title "Portfolio Dev" -d "$(CURDIR)" ; \
	split-pane -H -d "$(CURDIR)\server" cmd /k "conda activate portfoliov3 && uvicorn main:app --reload" ; \
	split-pane -H -d "$(CURDIR)\client" cmd /k "pnpm dev" ; \
	split-pane -H -d "$(CURDIR)" cmd /k "ngrok http --url=conversational.ngrok.app 8000"

_pretty_tmux:
	@echo "Launching side-by-side logs in tmux..."
	@tmux new-session -d -s portfoliov3 -c "$(CURDIR)/server" "conda run -n portfoliov3 uvicorn main:app --reload"
	@tmux split-window -h -c "$(CURDIR)/client" "pnpm dev"
	@tmux split-window -h -c "$(CURDIR)" "ngrok http --url=conversational.ngrok.app 8000"
	@tmux select-layout even-horizontal
	@tmux set -g mouse on >/dev/null 2>&1 || true
	@tmux attach-session -t portfoliov3
