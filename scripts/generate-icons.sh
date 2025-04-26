#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed. Please install it first."
    exit 1
fi

# Set paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ICON_SOURCE="$PROJECT_ROOT/client/public/icons/icon.svg"
ICONS_DIR="$PROJECT_ROOT/client/public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

# Generate regular icons
convert "$ICON_SOURCE" -resize 192x192 "$ICONS_DIR/icon-192x192.png"
convert "$ICON_SOURCE" -resize 512x512 "$ICONS_DIR/icon-512x512.png"

# Generate maskable icons (with padding)
convert "$ICON_SOURCE" -resize 154x154 -gravity center -background "#0f172a" -extent 192x192 "$ICONS_DIR/icon-maskable-192x192.png"
convert "$ICON_SOURCE" -resize 410x410 -gravity center -background "#0f172a" -extent 512x512 "$ICONS_DIR/icon-maskable-512x512.png"

# Generate apple touch icon
convert "$ICON_SOURCE" -resize 180x180 "$ICONS_DIR/apple-touch-icon.png"

# Generate favicon
convert "$ICON_SOURCE" -resize 32x32 "$PROJECT_ROOT/client/public/favicon.ico"

echo "Icons generated successfully!"
