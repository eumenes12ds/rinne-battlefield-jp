# Inline status panel

The terminal is displayed once, after the latest assistant message body, including the character-creation greeting. The cover greeting has no terminal. It is outside `.mes_text`, so it is not included in the saved message text or duplicated by message rendering.

The original tabs, detail dialogs, edit operations and MVU readers/writers are retained. The terminal follows page scrolling, uses a wrapping horizontal tab bar and expands to its content height. There is no floating ball, drag handler, close control or saved open-state requirement. Detail dialogs remain dialogs.

Dialogs use the visible viewport between the host navigation and composer. Their close control remains reachable when the header, viewport or keyboard changes; dialog resize subscriptions are removed with the owning runtime. This was added after actual 8090 acceptance exposed a header overlap absent from the initial isolated host fixture.

Message rendering, swipes, deletion and MVU updates keep the single terminal attached to the current message. Runtime disposal disconnects the observer, cancels refresh work, unsubscribes events and removes only that instance's DOM. All delegated jQuery listeners share an instance cleanup namespace. A retired instance does not remove a replacement instance.

The character-creation greeting hides the update-mode explanation while retaining automatic main-only synchronization. `主AI追従出力` enforcement, stable preset identifiers and worldbook linkage are unchanged.

The cover is inline card data, not an external page. Its checkbox only gated the entrance button and caption; it did not store consent or initialize variables. The card now omits that checkbox and the diagnostic block and calls the same native greeting-swipe API directly.

Validation before publication used Chromium and WebKit at 1440 and 390 px, replayed a historical Japanese MVU snapshot, checked all nine tabs, settings, latest-message movement, deletion/remount, repeated initialization and disposal. Paid model requests were not used. Detailed local user-end acceptance is recorded in the main project's task report.
