# 輪廻戦場 再構築版 V3.7.1-JP runtime

Japanese card-owned runtime assets. Release: v2026.10.16.1. Creative Workshop, its test script, asset-library integration, update endpoints and workshop UI are excluded. Normal shop and crafting features remain.

## Sources and licensing

- World engine: Unspoken-MomoTea/Battlefield-of-Reincarnation, V2.0.8, commit f2583b3cdf6ab880a254dfe405b33dbafe302f54; GPL-3.0 license in licenses/Battlefield-of-Reincarnation. The readable root JavaScript is the maintained localized source.
- Calculator, status bar, opening and settlement: Frank0200/lunhui-jsDelivr v1.0.15-JP, Apache-2.0. Status lifecycle and rarity filter are synchronized with the current Chinese releases. Original licenses are retained under licenses/.
- MVU: maintained Japanese TypeScript in source/MagVarUpdate; the account-setting compatibility layer preserves machine keys, enum values, nondefault values, unknown fields and existing storage format. Run its targeted settings test and webpack production build, then rewrite the external imports to the pinned paths in DEPENDENCIES.json.
- Schema registration helper: maintained source under source/tavern_resource; generated mvu_zod.js imports repository-owned modules.
- Vendor library provenance and integrity: DEPENDENCIES.json and LICENSES.json. Fonts: FONTS.json, FONT-LICENSES.json and the individual OFL texts.

## Compatibility boundary

Japanese UI and model instructions retain opaque backend schema identifiers and explicit Chinese input aliases needed to read older chats. Existing card/avatar identity is preserved by the consuming project. World snapshots never restore player currency or quests and reject cross-chat restoration. Market parsing accepts both Japanese and legacy Chinese headings, including fullwidth delimiters and colon-bearing scalar values.

This repository contains runtime assets and source only. Character cards, worldbook prose, account data, credentials, chats and test-session records are not published here.
