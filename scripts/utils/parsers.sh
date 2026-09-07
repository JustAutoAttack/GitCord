#!/usr/bin/env bash
# ==============================================================================
# Script Name: parsers.sh
# Description: Shared argument parsing, help detection, and target matching.
# ==============================================================================

handle_help() {
    local help_callback="$1"
    shift
    for arg in "$@"; do
        if [[ "$arg" == "-h" || "$arg" == "--help" ]]; then
            "$help_callback"
            exit 0
        fi
    done
}

parse_args() {
    local -n target_dest=$1
    shift
    
    # Initialize global VERBOSE flag
    VERBOSE=false
    target_dest=()

    for arg in "$@"; do
        if [[ "$arg" == "-v" || "$arg" == "--verbose" ]]; then
            VERBOSE=true
        else
            target_dest+=("$arg")
        fi
    done

    # Default to "all" if no targets remain
    if [ ${#target_dest[@]} -eq 0 ]; then
        target_dest=("all")
    fi
}

has_target() {
    local target_name="$1"
    shift
    local aliases=("$@")

    for t in "${TARGETS[@]}"; do
        if [ "$t" = "all" ] || [ "$t" = "$target_name" ]; then
            return 0
        fi
        for alias in "${aliases[@]}"; do
            if [ "$t" = "$alias" ]; then
                return 0
            fi
        done
    done
    return 1
}