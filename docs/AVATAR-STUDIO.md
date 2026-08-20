# Champion player cards

Players choose one curated full-body pixel champion and a public callsign. This
is deliberately not an avatar upload system: everyone gets a fast, coherent
character card and student photos are never collected.

The initial four champion templates and their copy live in
`config/avatar.ts`. Each has a name, role, origin line, playful perk, three
stats, and a sprite position. Edit those strings freely before launch.

## Replacing the placeholder art

`public/media/avatar-champions.png` is a temporary original four-character
sprite sheet. To use your own art, either keep the sheet structure or change
the rendering component to point each champion at an individual PNG.

For the current sheet implementation:

1. Create one transparent PNG with four equal-width columns and one
   full-body character in each column. Keep the head, shirt, trousers, and
   shoes fully inside each column.
2. Use a 4:1 canvas (for example 2048 × 512) and name it
   `avatar-champions.png`.
3. Replace `public/media/avatar-champions.png`.
4. Keep the champion order aligned with `CHAMPION_TEMPLATES` in
   `config/avatar.ts`, or update the `spritePosition` entries.

The visible shirt is part of the character art. Export your TEDx merch artwork
onto each character’s torso rather than using a floating overlay, so sleeves,
fit, and silhouette stay intact at every size.

## Safe future changes

Add templates; do not rename or remove an existing template ID during the
campaign, since saved player cards store that ID. Old detailed avatar JSON is
safely normalized to the default champion.
