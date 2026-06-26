# Abdonur — Online Ordering

Arabic empanada ordering system for Abdonur branches in Córdoba, Argentina.

- **Production:** https://abdonur.vercel.app
- **Admin login:** https://abdonur.vercel.app/admin

## Branches

| Branch | Address | Orders WhatsApp |
|---|---|---|
| **San Vicente** | Ambrosio Funes 1241, San Vicente, Córdoba | +54 9 351 706-1970 |
| **Alta Córdoba** | Fragueiro 2118, Alta Córdoba | +54 9 351 761-9358 |
| **Alberdi** | Av. Colón 3228, Alberdi, Córdoba | +54 9 351 205-2055 |
| **Nueva Córdoba** | Nueva Córdoba (delivery only) | +54 9 351 761-9358 |
| **Marqués** | Luciano de Figueroa 305, esq Pimentel | +54 9 351 240-4046 |
| **Gral. Pueyrredón** | Av. Patria 920, esquina Armenia | +54 9 351 817-6818 |

Wholesale & franchise: **3513224810**

### Public URLs

| Branch | Path |
|---|---|
| San Vicente | `/sucursal/san-vicente` |
| Alta Córdoba | `/sucursal/alta-cordoba` |
| Alberdi | `/sucursal/alberdi` |
| Nueva Córdoba | `/sucursal/nueva-cordoba` |
| Marqués | `/sucursal/marques` |
| Gral. Pueyrredón | `/sucursal/pueyrredon` |

## Admin

Login at `/admin`. Branch users are redirected to their panel; `admin` goes to the super-admin dashboard.

| Panel | URL |
|---|---|
| Login | `/admin` |
| Super admin | `/admin/admin` |
| Branch panel | `/admin/sucursal/[slug]` |

Order flow: **New → Confirmed → On the way / Ready → Completed** (or **Cancelled** from New/Confirmed).

Credentials: local `docs/CREDENCIALES_ADMIN.md` (gitignored). Template: `docs/CREDENCIALES_ADMIN.example.md`.

### Testing mode (optional)

Set `ADMIN_TESTING_MODE=true` to allow `/admin/*` without login and skip session checks in `updateOrderStatus`.

## Development

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm test` | Unit tests |
| `npm run db:clear-orders` | Delete all orders (Supabase API) |
| `npm run db:apply-whatsapp-migration` | Update branch WhatsApp numbers |
| `npm run db:apply-cancellation-migration` | Apply cancellation migration (Postgres URL) |
| `npm run db:test-cancel-order` | Smoke test order cancellation |

Apply SQL migrations to the linked Supabase project:

```bash
supabase db push --linked
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL, RLS)
- **Hosting:** Vercel

## Language policy

- **English:** code, commits, migrations, developer docs, scripts
- **Spanish:** customer- and staff-facing UI copy only

See `.cursor/rules/english-codebase.mdc`.
