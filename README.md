# Empanadas Árabes Abdonur — Sistema de Pedidos Online

## URLs

- **Sitio público:** https://abdonur.vercel.app
- **Panel admin (hub):** https://abdonur.vercel.app/admin

---

## Paneles de Administración

### 🔐 Modo Producción (actual)

El panel admin funciona con login en **`/admin`**. Según el usuario ingresado, redirige automáticamente al panel correspondiente.

| Panel | URL | Descripción |
|---|---|---|
| **Login Admin** | `/admin` | Acceso con usuario y contraseña |
| **Super Admin** | `/admin/admin` | Ve TODAS las sucursales y todos los pedidos |
| **San Vicente** | `/admin/sucursal/san-vicente` | Pedidos de Abdonur San Vicente |
| **Alta Córdoba** | `/admin/sucursal/alta-cordoba` | Pedidos de Abdonur Alta Córdoba |
| **Alberdi** | `/admin/sucursal/alberdi` | Pedidos de Abdonur Alberdi |
| **Nueva Córdoba** | `/admin/sucursal/nueva-cordoba` | Pedidos de Abdonur Nueva Córdoba |
| **Marqués** | `/admin/sucursal/marques` | Pedidos de Abdonur Marqués |
| **Gral. Pueyrredón** | `/admin/sucursal/pueyrredon` | Pedidos de Abdonur Gral. Pueyrredón |

### URLs públicas por sucursal

| Sucursal | URL |
|---|---|
| San Vicente | `/sucursal/san-vicente` |
| Alta Córdoba | `/sucursal/alta-cordoba` |
| Alberdi | `/sucursal/alberdi` |
| Nueva Córdoba | `/sucursal/nueva-cordoba` |
| Marqués | `/sucursal/marques` |
| Gral. Pueyrredón | `/sucursal/pueyrredon` |

### Cómo usar los paneles

1. Ir a **`/admin`** e ingresar usuario + contraseña.
2. Si el usuario es de sucursal, redirige a **`/admin/sucursal/[slug]`**.
3. Si el usuario es `admin`, redirige a **`/admin/admin`**.
4. Desde el listado se puede abrir cada pedido y cambiar estado: Nuevo → Confirmado → Completado / Cancelado.

### Activar modo testing (opcional)

Definir variable de entorno:
- `ADMIN_TESTING_MODE=true`

Con eso:
- `middleware.ts` deja pasar rutas `/admin/*` sin login
- `actions/updateOrderStatus.ts` omite validación de sesión admin

Sin esa variable (o en `false`), el sistema exige login en `/admin`.

---

## Sucursales

| Sucursal | Dirección | WhatsApp Pedidos |
|---|---|---|
| **Abdonur San Vicente** | Ambrosio Funes 1241, San Vicente, Córdoba | +39 379 102 5851 |
| **Abdonur Alta Córdoba** | Fragueiro 2118, Alta Córdoba | +39 379 102 5851 |
| **Abdonur Alberdi** | Av. Colón 3228, Alberdi, Córdoba | +39 379 102 5851 |
| **Abdonur Nueva Córdoba** | Nueva Córdoba (Solo Delivery) | +39 379 102 5851 |
| **Abdonur Marqués** | Luciano de Figueroa 305, esq Pimentel | +39 379 102 5851 |
| **Abdonur Gral. Pueyrredón** | Av. Patria 920, esquina Armenia | +39 379 102 5851 |

Venta por mayor y franquicia: **3513224810**

---

## Credenciales de Administración

### Admins por Sucursal (branch_admin)

| Sucursal | Usuario | Contraseña |
|---|---|---|
| San Vicente | sanvicente | 123456 |
| Alta Córdoba | altacordoba | 123456 |
| Alberdi | alberdi | 123456 |
| Nueva Córdoba | nuevacordoba | 123456 |
| Marqués | marques | 123456 |
| Gral. Pueyrredón | pueyrredon | 123456 |

### Super Admin (ve todas las sucursales)

| Rol | Usuario | Contraseña |
|---|---|---|
| Super Admin | admin | 123456 |

---

## Menú

### Empanadas Árabes
- Empanada Árabe (unidad): $1.600
- Docena de Empanadas Árabes: $18.000

### Comidas
- Almuerzo o Cena para 2: $19.500
- Quebbe (1 Kg): $18.400 / (Porción): $4.500
- Niños Envueltos (1 Kg): $27.000 / (Porción): $7.000
- Puré de Garbanzos (1 Kg): $11.900 / (Porción): $2.600
- Laben (250 cm3): $2.400
- Aceitunas a la Árabe (1 Kg): $21.000 / (Porción): $4.000

### Postres
- Namura (Porción): $1.600
- Backlawa (Porción): $2.500

> Nuestros productos NO son aptos para Celíacos.
> Todos nuestros productos SÍ son aptos para APLV, excepto los postres.

---

## Stack Técnico

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (Auth, PostgreSQL, RLS)
- **Hosting:** Vercel
- **Instagram:** @abdonurcomidasarabes
