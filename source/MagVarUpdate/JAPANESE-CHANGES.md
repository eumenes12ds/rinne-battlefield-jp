# Japanese runtime for Aetherium-JP

Source: MagicalAstrogy/MagVarUpdate commit b13b43bac24d585f2b523c12e423bb803fa9dd7c (the current Chinese card URL resolved to these exact upstream bundle bytes at task start). Changes are limited to Japanese locale selection, the 469-message Japanese dictionary, button labels and six help pages. The existing Japanese project translation memory was checked against all current keys and placeholders; two new messages were translated manually. No translation or generation API was used.

The schema adapter remains StageDog/tavern_resource commit 14e03abb53e56210b0351ef02873739c967c5406. Its current upstream bytes match the prior verified source exactly. The Japanese source and rebuilt adapter have been reused, with relative dependency references updated to this repository. The source and AFPL license are included under vendor-source/tavern_resource.

The source package.json keeps the upstream exact pi-ai and genai package versions. The reused build compiler installation is recorded separately by build-toolchain-package.json and build-toolchain-package-lock.json. To reproduce, install that toolchain in a separate directory using npm ci --legacy-peer-deps --ignore-scripts, make its node_modules available here, then CI=true node node_modules/webpack-cli/bin/cli.js --mode production. Rewrite external imports against ../../DEPENDENCIES.json. Runtime modules are pinned independently in that ledger.

Host globals supplied by Tavern Helper (jQuery, Vue, Zod, YAML, lodash, toastr and helper APIs) remain host-owned. Provider service endpoints in optional secondary-model code are service configuration, not downloadable runtime dependencies; no such provider was called during localization.
