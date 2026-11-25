# My Day v1.3.1 — Me Time + colourful tiles

Development/testing only. Do not upload the ZIP as a single repository file; upload its contents to the matching paths.

## Included
- Me Time greeting, mood/needs check-in, rotating offline daily advice
- My Moments, postpartum Little Wins templates, flower celebrations, Blossom Garden and Play Corner
- Colour-coded surfaces for Home, Lists, Appointments and Me Time; no continuously animated LED effects
- Static visual changes only; no migration or change to localStorage key `myday-v1`
- Service worker cache bumped to `myday-v131-colour-tiles`

## Release safeguards
1. Create or use a separate branch; do not merge directly to main.
2. On the existing Android installation, export and verify a backup before testing updates. Do not uninstall the app or clear site storage.
3. Check both light and dark themes, scrolling, text/input readability and flower animation.
4. Confirm tasks, appointments, lists, sticky notes and existing Me Time entries persist after refresh.
5. Verify the updated homepage icon separately; Chrome/Android can retain installed icons.

Local tests are not a substitute for Android device acceptance.

Shopping list visibility fix: Additional named lists are shown as separate coloured tiles below the active list; top list selectors wrap instead of requiring horizontal swipes. Data format and myday-v1 key unchanged.
