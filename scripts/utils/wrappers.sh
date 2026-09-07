#!/usr/bin/env bash
# ==============================================================================
# Script Name: wrappers.sh
# Description: Execution wrappers with self-contained logger import, subshell 
#              isolation, and clean success/failure logging.
# ==============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/logger.sh"

run_step() {
    local description="$1"
    shift
    local cmd="$*"
    local verbose="${VERBOSE:-false}"

    if [ "$verbose" = true ]; then
        log_info "$description..."
        ( eval "$cmd" )
    else
        log_info "$description..."
        local temp_log="/tmp/monorepo_$(date +%s%N).log"
        
        if ( eval "$cmd" ) > "$temp_log" 2>&1; then
            log_success "$description completed."
            rm -f "$temp_log"
        else
            echo ""
            log_fail "$description failed."
            echo -e "${COLOR_ERROR}--- Failure Output ---${COLOR_RESET}"
            cat "$temp_log"
            echo -e "${COLOR_ERROR}----------------------${COLOR_RESET}\n"
            rm -f "$temp_log"
            exit 1
        fi
    fi
}