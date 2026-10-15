# 輪廻戦場 再構築版 V3.7.1-JP runtime

Japanese card-owned runtime assets. Release: v2026.10.16.5. Creative Workshop, its test script, asset-library integration, update endpoints and workshop UI are excluded. Remote model-list probes are disabled. Normal shop and crafting actions remain.

## Sources and licensing

- World engine: Unspoken-MomoTea/Battlefield-of-Reincarnation, V2.0.8, commit f2583b3cdf6ab880a254dfe405b33dbafe302f54; GPL-3.0 license in licenses/Battlefield-of-Reincarnation. The readable root JavaScript is the maintained localized source.
- Calculator, status bar, opening and settlement: Frank0200/lunhui-jsDelivr v1.0.15-JP, Apache-2.0. Status lifecycle and rarity filter are synchronized with the current Chinese releases. Original licenses are retained under licenses/.
- MVU: maintained Japanese TypeScript in source/MagVarUpdate. Runtime fields and enums are Japanese. Main-reply variable updates are mandatory; the extra-model response dispatcher and retry control are removed. Settings use the private `rinne_jp_mvu_settings` namespace, importing shared legacy settings without overwriting other cards. False, zero, unknown preferences and retention settings survive that import. Run the targeted Japanese settings contract and webpack production build, then rewrite external imports to the pinned paths in DEPENDENCIES.json.
- Schema registration helper: maintained source under source/MagVarUpdate/vendor-source/tavern_resource; generated mvu_zod.js imports repository-owned modules.
- Vendor library provenance and integrity: DEPENDENCIES.json and LICENSES.json. Fonts: FONTS.json, FONT-LICENSES.json and the individual OFL texts.

## Compatibility boundary

Chinese strings remain only where required as legacy input spellings, historical parser alternatives, or upstream development comments. `日本語データ移行.js` follows the actual schema: it migrates known fields and enums, preserves entity names and free text, prefers an existing canonical value, and returns a copy. Merely viewing old saves does not rewrite them. Existing card/avatar identity is preserved by the consuming project. World snapshots never restore player currency or quests and reject cross-chat restoration. Market parsing accepts Japanese and legacy headings, fullwidth delimiters and colon-bearing scalar values.

The maintained runtime files are `補助計算.js`, `ステータスパネル.js`, `世界進行.js`, `開始画面.html`, and `決算画面.html`. The calculator publishes readiness only after MVU initialization; an old iframe cannot clear the readiness of its replacement instance. Cover displays subscribe to that readiness and continue observing local state.

JSON Pointer paths are canonicalized before command extraction, preserving literal dots and brackets in entity names. Open attribute maps migrate only declared attribute names; unknown values remain intact. The main-output schema accepts old settings shapes and always normalizes them to the fixed mode.

This repository contains runtime assets and source only. Character cards, worldbook prose, account data, credentials, chats and test-session records are not published here.

The five opening identities have distinct canonical values and descriptions. Single-world mode uses 転移者. Old identity, active-form and asset-type values migrate at the schema boundary. World-time ownership and narrative-time synchronization are independent fields, and all 24 selected worldbook entries use the Japanese worldbook name.
