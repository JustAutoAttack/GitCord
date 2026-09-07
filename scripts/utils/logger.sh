#!/usr/bin/env bash
# ==============================================================================
# Script Name: logger.sh
# Description: Standardized logging functions.
# ==============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"

log_info()    { echo -e "${COLOR_INFO}[INFO]${COLOR_RESET} $1"; }
log_success() { echo -e "${COLOR_SUCCESS}[SUCCESS]${COLOR_RESET} $1"; }
log_warn()    { echo -e "${COLOR_WARN}[WARNING]${COLOR_RESET} $1"; }
log_fail()    { echo -e "${COLOR_ERROR}[FAIL]${COLOR_RESET} $1"; }
log_error()   { echo -e "${COLOR_ERROR}[ERROR]${COLOR_RESET} $1"; exit 1; }