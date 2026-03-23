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
echo -e "  ${BOLD}${BLUE}noted-backend${RESET} ${CYAN}migrate${RESET}"
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo ""

# ─────────────────────────────────────────
#  Check argument
# ─────────────────────────────────────────
if [ -z "$1" ]; then
  echo -e "  ${RED}❌  DATABASE_URL is required${RESET}"
  echo ""
  echo -e "  Usage:"
  echo -e "  ${CYAN}./scripts/migrate.sh your_database_url${RESET}"
  echo ""
  echo -e "  Example (Render external URL):"
  echo -e "  ${CYAN}./scripts/migrate.sh postgresql://user:pass@host/db${RESET}"
  echo ""
  exit 1
fi

DATABASE_URL="$1"

# ─────────────────────────────────────────
#  Mask URL for display
# ─────────────────────────────────────────
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')

echo -e "  ${BOLD}Target database:${RESET}"
echo -e "  ${CYAN}${MASKED_URL}${RESET}"
echo ""

# ─────────────────────────────────────────
#  Confirm
# ─────────────────────────────────────────
read -p "  Run migrations against this database? (y/N) " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "  ${YELLOW}Cancelled.${RESET}"
  echo ""
  exit 0
fi

echo ""
echo -e "  ${BOLD}Running migrations...${RESET}"
echo ""

# ─────────────────────────────────────────
#  Run migration
# ─────────────────────────────────────────
(DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy > /tmp/noted_output 2>&1) &
pid=$!

spinner "$pid" "Applying migrations"

if [ $? -eq 0 ]; then
  printf "\r  ${GREEN}✅${RESET}  Applying migrations\n"
else
  printf "\r  ${RED}❌${RESET}  Applying migrations\n"
  echo ""
  echo -e "  ${RED}Error output:${RESET}"
  cat /tmp/noted_output | sed 's/^/  /'
  echo ""
  exit 1
fi

# ─────────────────────────────────────────
#  Show migration output
# ─────────────────────────────────────────
echo ""
echo -e "  ${YELLOW}────────────────────────────${RESET}"
echo -e "  ${GREEN}${BOLD}Migrations applied successfully!${RESET}"
echo ""
echo -e "  ${BOLD}Details:${RESET}"
grep -E "migration|applied|found" /tmp/noted_output | sed 's/^/  /'
echo ""