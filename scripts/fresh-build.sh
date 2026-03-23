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
# ─────────────────────────────────────────
spinner() {
  local pid=$1
  local message=$2
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0

  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${frames[$i]}${RESET}  ${message}"
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
    printf "\r  ${GREEN}✅${RESET}  ${message}\n"
  else
    printf "\r  ${RED}❌${RESET}  ${message}\n"
    echo ""
    echo -e "  ${RED}Error output:${RESET}"
    cat /tmp/noted_output | sed 's/^/  /'
    echo ""
    exit 1
  fi
}

# ─────────────────────────────────────────
#  Header
# ─────────────────────────────────────────
clear
echo ""
echo -e "  ${BOLD}${BLUE}noted-backend${RESET} ${CYAN}fresh build${RESET}"
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo ""
echo -e "  ${YELLOW}⚠️   This will delete dist/ and src/generated/${RESET}"
echo ""

# ─────────────────────────────────────────
#  Confirm
# ─────────────────────────────────────────
read -p "  Continue? (y/N) " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "  ${YELLOW}Cancelled.${RESET}"
  echo ""
  exit 0
fi

echo ""
echo -e "  ${BOLD}Cleaning and rebuilding...${RESET}"
echo ""

# ─────────────────────────────────────────
#  Steps
# ─────────────────────────────────────────
run_step "Removing dist/ and src/generated/" rm -rf dist src/generated
run_step "Generating Prisma client" pnpm prisma:generate
run_step "Building TypeScript" pnpm run build

# ─────────────────────────────────────────
#  Done
# ─────────────────────────────────────────
echo ""
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo -e "  ${GREEN}${BOLD}Fresh build complete!${RESET}"
echo ""
echo -e "  Start the server:"
echo -e "  ${CYAN}pnpm start${RESET}"
echo ""