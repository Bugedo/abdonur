# Empanadas Árabes Abdonur — Sistema de Pedidos Online

## URLs

- **Sitio público:** https://abdonur.vercel.app
- **Panel admin (hub):** https://abdonur.vercel.app/admin

---

## Paneles de Administración

### 🧪 Modo Testing (actual)

El sistema está en **modo testing**: todos los paneles admin son accesibles **sin usuario ni contraseña**. Entrando a `/admin` se ve un hub central con links a cada panel.

| Panel | URL | Descripción |
|---|---|---|
| **Hub Admin** | `/admin` | Página central con acceso a todos los paneles |
| **Super Admin** | `/admin/admin` | Ve TODAS las sucursales y todos los pedidos |
| **San Vicente** | `/admin/sucursal/{id}` | Pedidos de Abdonur San Vicente |
| **Alta Córdoba** | `/admin/sucursal/{id}` | Pedidos de Abdonur Alta Córdoba |
| **Alberdi** | `/admin/sucursal/{id}` | Pedidos de Abdonur Alberdi |
| **Nueva Córdoba** | `/admin/sucursal/{id}` | Pedidos de Abdonur Nueva Córdoba |
| **Marqués** | `/admin/sucursal/{id}` | Pedidos de Abdonur Marqués |
| **Gral. Pueyrredón** | `/admin/sucursal/{id}` | Pedidos de Abdonur Gral. Pueyrredón |

> **Nota:** Los `{id}` son UUIDs de Supabase. Desde el hub (`/admin`) se accede directamente con un click.

### Cómo usar los paneles

1. Ir a **`/admin`** → Se muestra el hub con todas las sucursales y el panel general.
2. Click en **"👑 Super Admin"** → Ve todos los pedidos de todas las sucursales, con stats globales y resumen por sucursal.
3. Click en una **sucursal** → Ve solo los pedidos de esa sucursal, con stats y datos de la misma.
4. Click en un **pedido** → Ve el detalle completo (cliente, items, método de entrega, pago, dirección, notas).
5. Desde el detalle se puede **cambiar el estado** del pedido: Nuevo → Confirmado → Completado / Cancelado.

### Desactivar modo testing (para producción)

Cambiar `TESTING_MODE = true` → `TESTING_MODE = false` en estos 2 archivos:
- `middleware.ts` — reactiva la autenticación en rutas `/admin/*`
- `actions/updateOrderStatus.ts` — reactiva la verificación de permisos al cambiar estado de pedidos

Con el modo testing desactivado, los usuarios deben loguearse en `/admin/login` y serán redirigidos al panel correspondiente según su rol.

---

## Sucursales

| Sucursal | Dirección | Teléfono / WhatsApp |
|---|---|---|
| **Abdonur San Vicente** | Ambrosio Funes 1241, San Vicente, Córdoba | 3517061970 |
| **Abdonur Alta Córdoba** | Fragueiro 2118, Alta Córdoba | 3517619358 |
| **Abdonur Alberdi** | Av. Colón 3228, Alberdi, Córdoba | 3512052055 |
| **Abdonur Nueva Córdoba** | Nueva Córdoba (Solo Delivery) | 3517619358 |
| **Abdonur Marqués** | Luciano de Figueroa 305, esq Pimentel | 3517539009 |
| **Abdonur Gral. Pueyrredón** | Av. Patria 920, esquina Armenia | 3518176818 |

Venta por mayor y franquicia: **3513224810**

---

## Credenciales de Administración (para cuando se desactive el modo testing)

### Admins por Sucursal (branch_admin)

| Sucursal | Email | Contraseña |
|---|---|---|
| San Vicente | sanvicente@abdonur.com | Abdonur2026! |
| Alta Córdoba | altacordoba@abdonur.com | Abdonur2026! |
| Alberdi | alberdi@abdonur.com | Abdonur2026! |
| Nueva Córdoba | nuevacordoba@abdonur.com | Abdonur2026! |
| Marqués | marques@abdonur.com | Abdonur2026! |
| Gral. Pueyrredón | pueyrredon@abdonur.com | Abdonur2026! |

### Super Admin (ve todas las sucursales)

| Rol | Email | Contraseña |
|---|---|---|
| Super Admin | superadmin@abdonur.com | Abdonur2026! |

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
