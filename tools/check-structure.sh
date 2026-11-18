#!/usr/bin/env bash
# Verifies that every path listed in docs/architecture/structure.manifest.txt exists.
# Usage (from anywhere):  bash tools/check-structure.sh
set -u
cd "$(dirname "$0")/.." || exit 2
MANIFEST="docs/architecture/structure.manifest.txt"
if [ ! -f "$MANIFEST" ]; then echo "Missing $MANIFEST"; exit 2; fi
missing=0
total=0
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  case "$line" in
    ''|\#*) continue ;;
  esac
  total=$((total + 1))
  case "$line" in
    */) [ -d "$line" ] || { echo "MISSING dir : $line"; missing=$((missing + 1)); } ;;
    *)  [ -f "$line" ] || { echo "MISSING file: $line"; missing=$((missing + 1)); } ;;
  esac
done < "$MANIFEST"
if [ -e backend/bagisto ]; then
  echo "NOTE: backend/bagisto exists. It is expected only after Phase 1."
fi
echo "Checked $total paths, $missing missing."
if [ "$missing" -eq 0 ]; then
  echo "OK: structure matches the manifest."
  exit 0
else
  echo "FAIL"
  exit 1
fi
