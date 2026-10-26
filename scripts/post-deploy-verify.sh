#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://sismosmart.com}"
WWW_HTTPS_URL="${WWW_HTTPS_URL:-https://www.sismosmart.com}"
BARE_HTTP_URL="${BARE_HTTP_URL:-http://sismosmart.com}"
CANONICAL_BASE_URL="${CANONICAL_BASE_URL:-https://sismosmart.com}"
VERIFY_CANONICAL_REDIRECTS="${VERIFY_CANONICAL_REDIRECTS:-true}"

pass=0
fail=0

record_pass() {
  printf 'PASS %s\n' "$1"
  pass=$((pass + 1))
}

record_fail() {
  printf 'FAIL %s\n' "$1"
  fail=$((fail + 1))
}

check_follow_status() {
  local url="$1"
  local description="$2"
  local expected="${3:-200}"
  local status

  status="$(curl -sS -L -o /dev/null -w "%{http_code}" --max-time 20 "$url" || true)"
  if [ "$status" = "$expected" ]; then
    record_pass "$description -> HTTP $status"
  else
    record_fail "$description -> HTTP $status, expected $expected"
  fi
}

check_redirect_location() {
  local url="$1"
  local description="$2"
  local expected_prefix="$3"
  local status location

  status="$(curl -sS -o /dev/null -D /tmp/sismosmart_headers.txt -w "%{http_code}" --max-time 20 "$url" || true)"
  location="$(awk 'tolower($1) == "location:" {print $2}' /tmp/sismosmart_headers.txt | tr -d '\r' | tail -1)"

  if [[ "$status" =~ ^30[1278]$ ]] && [[ "$location" == "$expected_prefix"* ]]; then
    record_pass "$description -> HTTP $status $location"
  else
    record_fail "$description -> HTTP $status $location, expected redirect to $expected_prefix"
  fi
}

check_content() {
  local url="$1"
  local pattern="$2"
  local description="$3"
  local body

  body="$(curl -sS -L --max-time 20 "$url" || true)"
  if grep -Eiq "$pattern" <<<"$body"; then
    record_pass "$description"
  else
    record_fail "$description"
  fi
}

check_form_runtime() {
  local url="$1"
  local target="$2"
  local description="$3"
  local body_file status

  body_file="$(mktemp)"
  status="$(curl -sS -o "$body_file" -w "%{http_code}" --max-time 20 "$url" || true)"

  if [ "$status" = "200" ] &&
    grep -Eq '"configured"[[:space:]]*:[[:space:]]*true' "$body_file" &&
    grep -Eq '"ok"[[:space:]]*:[[:space:]]*true' "$body_file" &&
    grep -Eq '"target"[[:space:]]*:[[:space:]]*"'"$target"'"' "$body_file"; then
    record_pass "$description -> configured"
  else
    record_fail "$description -> HTTP $status or runtime configuration missing"
  fi

  rm -f "$body_file"
}

check_api_validation() {
  local url="$1"
  local description="$2"
  local status

  status="$(
    curl -sS -o /dev/null -w "%{http_code}" --max-time 20 \
      -H "content-type: application/json" \
      -X POST \
      --data '{}' \
      "$url" || true
  )"

  if [[ "$status" =~ ^(400|429)$ ]]; then
    record_pass "$description -> validation HTTP $status"
  else
    record_fail "$description -> HTTP $status, expected validation response"
  fi
}

check_api_payload_limit() {
  local url="$1"
  local description="$2"
  local payload_file status

  payload_file="$(mktemp)"
  {
    printf '{"padding":"'
    head -c 33000 /dev/zero | tr '\0' 'x'
    printf '"}'
  } >"$payload_file"

  status="$(
    curl -sS -o /dev/null -w "%{http_code}" --max-time 20 \
      -H "content-type: application/json" \
      -X POST \
      --data-binary "@$payload_file" \
      "$url" || true
  )"

  if [ "$status" = "413" ]; then
    record_pass "$description -> payload limit HTTP 413"
  else
    record_fail "$description -> HTTP $status, expected 413"
  fi

  rm -f "$payload_file"
}

submit_form_once() {
  local url="$1"
  local payload="$2"
  local description="$3"
  local success_message="${4:-delivered once}"
  local body_file status

  body_file="$(mktemp)"
  status="$(
    curl -sS -o "$body_file" -w "%{http_code}" --max-time 30 \
      -H "content-type: application/json" \
      -X POST \
      --data "$payload" \
      "$url" || true
  )"

  if [ "$status" = "200" ] && grep -Eq '"ok"[[:space:]]*:[[:space:]]*true' "$body_file"; then
    record_pass "$description -> $success_message"
  else
    record_fail "$description -> HTTP $status"
  fi

  rm -f "$body_file"
}

verify_form_delivery_once() {
  if [ "${VERIFY_FORM_DELIVERY:-false}" != "true" ]; then
    record_pass "Synthetic form delivery -> disabled"
    return
  fi

  local run_id test_email contact_payload waitlist_payload honeypot_payload
  run_id="${FORM_TEST_RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"
  test_email="${FORM_TEST_EMAIL:-sismosmart@gmail.com}"

  contact_payload="$(printf '{"name":"SismoSmart CI","email":"%s","subject":"Production form verification %s","message":"Automated SismoSmart production contact delivery verification. Run %s. This is a controlled test record.","consent":true,"locale":"en","source":"production-form-verification","website":""}' "$test_email" "$run_id" "$run_id")"
  waitlist_payload="$(printf '{"name":"SismoSmart CI","email":"%s","organization":"SismoSmart","interest_type":"production-verification","message":"Automated SismoSmart waitlist delivery verification. Run %s. This is a controlled test record.","consent":true,"locale":"en","source":"production-form-verification","website":""}' "$test_email" "$run_id")"
  honeypot_payload="$(printf '{"name":"SismoSmart Bot Check","email":"%s","subject":"Honeypot verification %s","message":"This payload must be acknowledged without forwarding to the destination.","consent":true,"locale":"en","source":"production-form-verification","website":"https://example.invalid/bot"}' "$test_email" "$run_id")"

  # Each request is intentionally issued once and curl retries are not enabled.
  submit_form_once "$BASE_URL/api/contact" "$contact_payload" "Contact form synthetic record $run_id"
  submit_form_once "$BASE_URL/api/waitlist" "$waitlist_payload" "Waitlist form synthetic record $run_id"
  submit_form_once "$BASE_URL/api/contact" "$honeypot_payload" "Contact honeypot $run_id" "acknowledged without forwarding"
}

check_ssl_expiry() {
  local host="$1"
  local min_days="${2:-30}"
  local expiry expiry_epoch now_epoch remaining_days

  expiry="$(
    echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null |
      openssl x509 -noout -enddate 2>/dev/null |
      cut -d= -f2-
  )"

  if [ -z "$expiry" ]; then
    record_fail "SSL expiry could not be read for $host"
    return
  fi

  expiry_epoch="$(date -u -d "$expiry" +%s)"
  now_epoch="$(date -u +%s)"
  remaining_days=$(((expiry_epoch - now_epoch) / 86400))

  if [ "$remaining_days" -ge "$min_days" ]; then
    record_pass "SSL valid for $remaining_days days"
  else
    record_fail "SSL valid for only $remaining_days days"
  fi
}

ssl_base_url="$CANONICAL_BASE_URL"
if [ "$VERIFY_CANONICAL_REDIRECTS" != "true" ]; then
  ssl_base_url="$BASE_URL"
fi
canonical_host="${ssl_base_url#https://}"
canonical_host="${canonical_host%%/*}"

printf 'SismoSmart post-deploy verification\n'
printf 'Base URL: %s\n\n' "$BASE_URL"

check_follow_status "$BASE_URL" "Canonical site"
if [ "$VERIFY_CANONICAL_REDIRECTS" = "true" ]; then
  check_follow_status "$WWW_HTTPS_URL" "www site"
else
  record_pass "www/canonical checks -> disabled"
fi
check_follow_status "$BASE_URL/en" "English homepage"
check_follow_status "$BASE_URL/tr" "Turkish homepage"
check_follow_status "$BASE_URL/en/product" "English product page"
check_follow_status "$BASE_URL/tr/product" "Turkish product page"
check_follow_status "$BASE_URL/tr/contact" "Turkish contact page"
if [ "$VERIFY_CANONICAL_REDIRECTS" = "true" ]; then
  check_redirect_location "$WWW_HTTPS_URL" "www HTTPS canonical redirect" "$CANONICAL_BASE_URL"
  check_redirect_location "$BARE_HTTP_URL" "Bare HTTP canonical redirect" "$CANONICAL_BASE_URL"
fi
check_follow_status "$BASE_URL/robots.txt" "robots.txt"
check_follow_status "$BASE_URL/sitemap.xml" "sitemap.xml"
check_follow_status "$BASE_URL/favicon.ico" "favicon"
check_follow_status "$BASE_URL/images/device/sismosmart-device-hero.webp" "Device hero image"
check_follow_status "$BASE_URL/images/device/sismosmart-device-front.webp" "Device front image"
check_follow_status "$BASE_URL/images/device/sismosmart-device-side.webp" "Device side image"
check_follow_status "$BASE_URL/images/device/sismosmart-device-low-profile.webp" "Device low-profile image"
check_follow_status "$BASE_URL/images/device/sismosmart-device-installation.webp" "Device installation image"
check_content "$BASE_URL/en" "SismoSmart" "English homepage contains brand name"
check_content "$BASE_URL/en" "<title>|canonical|hreflang|og:title|application/ld\\+json" "English homepage contains SEO metadata"
robots_html=""
if ! robots_html="$(curl -sS -L --max-time 20 "$BASE_URL/en")"; then
  record_fail "Failed to fetch English homepage for robots check"
elif printf '%s' "$robots_html" | grep -Eiq "<meta[^>]+name=[\"']robots[\"'][^>]+noindex"; then
  record_fail "English homepage must not contain robots noindex"
else
  record_pass "English homepage has no robots noindex"
fi
check_api_validation "$BASE_URL/api/contact" "Contact API"
check_api_validation "$BASE_URL/api/waitlist" "Waitlist API"
check_api_payload_limit "$BASE_URL/api/contact" "Contact API"
check_api_payload_limit "$BASE_URL/api/waitlist" "Waitlist API"
if [ "${VERIFY_FORM_RUNTIME:-true}" = "true" ]; then
  check_form_runtime "$BASE_URL/api/contact" "contact" "Contact forwarding runtime"
  check_form_runtime "$BASE_URL/api/waitlist" "waitlist" "Waitlist forwarding runtime"
else
  record_pass "Form runtime health checks -> disabled"
fi
verify_form_delivery_once
check_ssl_expiry "$canonical_host" 30

printf '\nResult: %s passed, %s failed\n' "$pass" "$fail"

if [ "$fail" -gt 0 ]; then
  exit 1
fi
