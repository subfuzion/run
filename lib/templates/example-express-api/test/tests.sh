#!/bin/bash
set -e

URL="${1:-http://localhost:8080}"

get() {
  local route="$1"
  curl -w "\n%{http_code}\n\n" -X GET -H "Content-type: application/json" "$URL/$route"
}

post() {
  local route="$1"
  local data="$2"
  curl -w "\n%{http_code}\n\n" -X POST -H "Content-type: application/json" -d "$data" "$URL/$route"
}

put() {
  local route="$1"
  local data="$2"
  curl -w "\n%{http_code}\n\n" -X PUT -H "Content-type: application/json" -d "$data" "$URL/$route"
}

delete() {
  local route="$1"
  curl -w "\n%{http_code}\n\n" -X DELETE -H "Content-type: application/json" "$URL/$route"
}


echo "Initialize database"
get "users/initialize"


echo "List users (expect node)"
get "users"

echo "Add new users"
post "users" '{"name": "foo"}'
post "users" '{"name": "bar"}'

echo "List users (expect node, foo, bar)"
get "users"

echo "Update foo using name of existing user 'bar' (expect to fail)"
put "users/foo" '{"name": "bar"}'

echo "Update user who doesn't exist (expect to fail)"
put "users/foo" '{"name": "baz"}'

echo "Update foo"
put "users/foo" '{"name": "baz"}'

echo "Get baz"
get "users/baz"

echo "Delete baz"
delete "users/baz"

echo "Get baz (expect to fail)"
get "users/baz"

echo "List users (expect node, bar)"
get "users"

echo "Reinitialize database"
get "users/initialize"
