# Organized findings

This is a **map**. It is not PROTOCOL.md. The executable index is
`src/lib/appsec/knowledge.ts` (compiled once per pull set). Agents that need
facts open **one record** and follow pointers. They do not load this file, or
PROTOCOL, into a system prompt.

Pointers name associated pulls, files, and data. They are not the contents.

| Record | Members | Points at |
|---|---|---|
| `K-SQLI-SEARCH` | `SG-SQLI-SEARCH`, `ZAP-SQLI-SEARCH` | pulls, `routes/search.ts`, Q-RECORD |
| `K-REDIRECT` | `SG-REDIRECT`, `ZAP-REDIRECT` | pulls, `routes/redirect.ts`, Q-RECORD |
| `K-JWT` | `SG-JWT-KEY`, `TRV-JSONWEBTOKEN`, `TRV-EXPRESS-JWT`, `BB-JWT-NONE` | pulls, `lib/insecurity.ts`, Q-RECORD |
| `SG-SQLI-LOGIN` | self | `routes/login.ts` |
| `SG-XSS-REVIEW` | self | review-table component |
| `SG-MD5` | self | `lib/insecurity.ts` |
| `TRV-SANITIZE-HTML` | self | package `sanitize-html` |
| `TRV-LIBXMLJS2` | self | package `libxmljs2` (v16) |
| `TRV-LIBXMLJS` | self | package `libxmljs` (v17) |
| `TRV-GLOB7` | self | package `glob` (v16) |
| `ZAP-CSP` | self | endpoint CSP |
| `ZAP-TIMESTAMP` | self | known FP |
| `ZAP-SCOREBOARD` | self | legacy score-board (v16) |
| `IAC-DOCKER-ROOT` | self | `Dockerfile` |
| `BB-IDOR-BASKET` | self | `GET /rest/basket/{id}` |
| `BB-XSS-NOPOC` | self | intake, no PoC |
| `BB-ADVISORY` | self | v17 Security Advisory |

Queries that read this index: `Q-KNOW`, `Q-RECORD`, `Q-CLUSTER`, `Q-FINDING`.
Delta counts stay a script (`Q-DELTA`), not a graph walk.

Canon: [PROTOCOL.md](../PROTOCOL.md). Why: [ADR 0005](../docs/adr/0005-organized-findings-index.md).
