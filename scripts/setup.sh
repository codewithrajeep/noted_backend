#!/bin/bash

# ─────────────────────────────────────────
#  Colors
# ─────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ─────────────────────────────────────────
#  Spinner
# 
spinner() {
    local pid=$1
    local message=$2
    local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
    local i=0

    while kill -0 "$pid" 2>/dev/null; do
        printf "\r ${CYAN}${frames[$i]}${RESET} ${message}"
        i=$(( (i + 1) % 10 ))
        sleep 0.08
    done

    wait "$pid"
    return $?
}

# ─────────────────────────────────────────
#  Step runner
# ─────────────────────────────────────────
run_step() {
    local message=$1
    shift
    local cmd=("$@")

    ("${cmd[@]}" > /tmp/noted_output 2>&1) &
    local pid=$!

    spinner "$pid" "$message"

    if [ $? -eq 0 ]; then
        printf "\r ${GREEN}✅${RESET} ${message}\n"
    else
        printf "\r ${RED}❌${RESET} ${message}\n"
        echo ""
        echo -e "  ${RED}Error output:${RESET}"
        cat /tmp/noted_output | sed 's/^/ /'
        echo ""
        exit 1
    fi
}

# ─────────────────────────────────────────
#  Header
# ─────────────────────────────────────────
clear
echo ""
echo -e "  ${BOLD}${BLUE}noted-backend${RESET} ${CYAN}setup${RESET}"
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo ""

# ─────────────────────────────────────────
#  Check prerequisites
# ─────────────────────────────────────────
echo -e "  ${BOLD}Checking prerequisites...${RESET}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "  ${RED}❌Node.js is not installed. Please install Node.js 20+${RESET}"
    exit 1
fi
printf "  ${GREEN}✅${RESET}  Node.js $(node -v)\n"

if [ ! -f ".env" ]; then
  echo ""
  echo -e "  ${YELLOW}⚠️   .env file not found — copying from .env.example${RESET}"
  cp .env.example .env
  echo -e "  ${YELLOW}📝  Please fill in your values in .env before continuing${RESET}"
  echo ""
  read -p "  Press Enter when ready..."
fi
printf "  ${GREEN}✅${RESET}  .env file found\n"
 
echo ""
echo -e "  ${BOLD}Setting up project...${RESET}"
echo ""

# ─────────────────────────────────────────
#  Steps
# ─────────────────────────────────────────
run_step "Installing dependencies" pnpm install
run_step "Generating Prisma client" pnpm prisma:generate
run_step "Running database migrations" pnpm prisma:migrate init

# ─────────────────────────────────────────
#  Done
# ─────────────────────────────────────────
echo ""
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo -e "  ${GREEN}${BOLD}Setup complete!${RESET}"
echo ""
echo -e "  Start the dev server:"
echo -e "  ${CYAN}pnpm run dev${RESET}"
echo ""