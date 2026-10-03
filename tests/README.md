# Isolated data-loader regression tests

Run `node --test tests/data.test.cjs` with an already installed Node.js 18+.
No package install is needed. CI uses the Node.js already on its hosted runner.

The tests execute the actual shared `data.js` in a VM with deterministic minimal
WinJS list and Windows storage substitutes. They cover asynchronous initial load,
reload replacement, observable-list identity, row identity, empty input, repeated
loads without duplicates, callback ordering, and malformed JSON retaining state.

This fixes a latent exported `csvData` consistency bug. The current chart consumes
`jsonData`; these tests do not establish that the visible chart was broken.

The production code remains legacy-compatible JavaScript. These host tests do not
build or run the Windows 8.1 / Windows Phone 8.1 applications, WinJS, Chart.js, or
jQuery. Their historical SDKs and dependency versions are unchanged. No Windows
application or UI compatibility claim is made by a passing host test.
