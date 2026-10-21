# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service status and server timestamp |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Inspect, create, or expire the signed demo session |
| GET/POST/DELETE | `/api/watchlist` | Demo session | List, upsert, or remove user-owned symbols |
| POST | `/api/options/calculate` | Public | Calculate theoretical price, Greeks, and optional implied volatility |

All write inputs are validated. `/api/options/calculate` accepts rates and volatility as percentages and time as calendar days; the response states model assumptions and the investment disclaimer.
