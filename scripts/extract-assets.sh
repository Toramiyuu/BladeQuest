#!/usr/bin/env bash
# extract-assets.sh — One-time script to extract craftpix assets into public/assets/
# Run from project root: bash scripts/extract-assets.sh
set -e

DOWNLOADS="/Users/harvey/Downloads"
ASSETS="public/assets"

echo "Creating asset directories..."
mkdir -p "$ASSETS/sprites/npcs"
mkdir -p "$ASSETS/backgrounds"
mkdir -p "$ASSETS/icons/weapons"
mkdir -p "$ASSETS/icons/armor"
mkdir -p "$ASSETS/icons/items"

echo "Extracting NPC sprites (village peasants)..."
unzip -jo "$DOWNLOADS/craftpix-net-126405-village-npc-pixel-art-character-sprite-pack.zip" \
  "Peasants_1/Idle.png" \
  "Peasants_1/Dialogue.png" \
  "Peasants_3/Idle.png" \
  "Peasants_3/Sell.png" \
  -d /tmp/npc_extract 2>/dev/null

cp /tmp/npc_extract/Idle.png "$ASSETS/sprites/npcs/blacksmith-idle.png" 2>/dev/null || true
cp /tmp/npc_extract/Dialogue.png "$ASSETS/sprites/npcs/blacksmith-dialogue.png" 2>/dev/null || true
# Note: Idle and Sell need careful ordering since both have same basename
unzip -jo "$DOWNLOADS/craftpix-net-126405-village-npc-pixel-art-character-sprite-pack.zip" \
  "Peasants_3/Idle.png" -d /tmp/p3idle 2>/dev/null
unzip -jo "$DOWNLOADS/craftpix-net-126405-village-npc-pixel-art-character-sprite-pack.zip" \
  "Peasants_3/Sell.png" -d /tmp/p3sell 2>/dev/null
unzip -jo "$DOWNLOADS/craftpix-net-126405-village-npc-pixel-art-character-sprite-pack.zip" \
  "Peasants_1/Idle.png" -d /tmp/p1idle 2>/dev/null
unzip -jo "$DOWNLOADS/craftpix-net-126405-village-npc-pixel-art-character-sprite-pack.zip" \
  "Peasants_1/Dialogue.png" -d /tmp/p1diag 2>/dev/null

cp /tmp/p1idle/Idle.png "$ASSETS/sprites/npcs/blacksmith-idle.png"
cp /tmp/p1diag/Dialogue.png "$ASSETS/sprites/npcs/blacksmith-dialogue.png"
cp /tmp/p3idle/Idle.png "$ASSETS/sprites/npcs/merchant-idle.png"
cp /tmp/p3sell/Sell.png "$ASSETS/sprites/npcs/merchant-sell.png"

echo "Extracting NPC sprites (elf)..."
unzip -jo "$DOWNLOADS/craftpix-net-514604-npc-elf-2d-pixel-art-character-sprite-pack.zip" \
  "Elf_3/Idle.png" -d /tmp/e3idle 2>/dev/null
unzip -jo "$DOWNLOADS/craftpix-net-514604-npc-elf-2d-pixel-art-character-sprite-pack.zip" \
  "Elf_3/Dialogue.png" -d /tmp/e3diag 2>/dev/null
cp /tmp/e3idle/Idle.png "$ASSETS/sprites/npcs/guildmaster-idle.png"
cp /tmp/e3diag/Dialogue.png "$ASSETS/sprites/npcs/guildmaster-dialogue.png"

echo "Extracting hub backgrounds (farm market)..."
FARM_ZIP="$DOWNLOADS/craftpix-net-879016-cartoon-medieval-farm-market-tileset-for-platformer.zip"
unzip -jo "$FARM_ZIP" \
  "PNG/Background/Cartoon_Medieval_Farm_Market_Level_Set_Background - Layer 00.png" \
  -d /tmp/farm_bg 2>/dev/null
unzip -jo "$FARM_ZIP" \
  "PNG/Background/Cartoon_Medieval_Farm_Market_Level_Set_Background - Layer 01.png" \
  -d /tmp/farm_bg1 2>/dev/null
cp "/tmp/farm_bg/Cartoon_Medieval_Farm_Market_Level_Set_Background - Layer 00.png" "$ASSETS/backgrounds/hub-bg-far.png"
cp "/tmp/farm_bg1/Cartoon_Medieval_Farm_Market_Level_Set_Background - Layer 01.png" "$ASSETS/backgrounds/hub-bg-near.png"

echo "Extracting weapon icons (pack 1, icons 01-30)..."
WEAPON_ZIP="$DOWNLOADS/craftpix-net-204068-100-pixel-art-weapon-icons.zip"
for i in $(seq -w 01 30); do
  unzip -jo "$WEAPON_ZIP" "Icons/icon_${i}.png" -d "$ASSETS/icons/weapons" 2>/dev/null || true
done
# Rename to weapon-XX.png
for f in "$ASSETS/icons/weapons"/icon_*.png; do
  base=$(basename "$f" .png)
  num=${base#icon_}
  mv "$f" "$ASSETS/icons/weapons/weapon-${num}.png" 2>/dev/null || true
done

echo "Extracting armor icons (pack 1, icons 01-30)..."
ARMOR_ZIP="$DOWNLOADS/craftpix-net-339915-100-pixel-art-armor-icons.zip"
for i in $(seq -w 01 30); do
  unzip -jo "$ARMOR_ZIP" "Icons/Iicons_7_${i}.png" -d "$ASSETS/icons/armor" 2>/dev/null || true
done
# Rename to armor-XX.png
for f in "$ASSETS/icons/armor"/Iicons_7_*.png; do
  [ -f "$f" ] || continue
  base=$(basename "$f" .png)
  num=${base#Iicons_7_}
  mv "$f" "$ASSETS/icons/armor/armor-${num}.png" 2>/dev/null || true
done

echo "Extracting RPG item icons (pack, icons 01-15)..."
ITEMS_ZIP="$DOWNLOADS/craftpix-net-975646-things-for-rpg-game-32x32-pixel-art.zip"
for i in $(seq -w 01 15); do
  unzip -jo "$ITEMS_ZIP" "Icons/icons_30_${i}.png" -d "$ASSETS/icons/items" 2>/dev/null || true
done
# Rename to item-XX.png
for f in "$ASSETS/icons/items"/icons_30_*.png; do
  [ -f "$f" ] || continue
  base=$(basename "$f" .png)
  num=${base#icons_30_}
  mv "$f" "$ASSETS/icons/items/item-${num}.png" 2>/dev/null || true
done

echo ""
echo "Extraction complete! Assets written to $ASSETS/"
echo "NPC sprites:"
ls "$ASSETS/sprites/npcs/" 2>/dev/null
echo "Backgrounds:"
ls "$ASSETS/backgrounds/" 2>/dev/null
echo "Weapon icons:"
ls "$ASSETS/icons/weapons/" 2>/dev/null | wc -l | xargs echo "  count:"
echo "Armor icons:"
ls "$ASSETS/icons/armor/" 2>/dev/null | wc -l | xargs echo "  count:"
echo "Item icons:"
ls "$ASSETS/icons/items/" 2>/dev/null | wc -l | xargs echo "  count:"
