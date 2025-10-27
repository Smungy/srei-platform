# 🎮 Sistema de Autenticación Opcional - SREI

## Concepto

SREI implementa un modelo **"prueba antes de registrarte"** que reduce la fricción y aumenta la conversión.

---

## 🌐 Acceso Público vs Autenticado

### **Usuarios NO Registrados** (Modo Público)

✅ **Pueden:**

- Acceder a la sección de videojuegos `/games`
- Buscar y explorar juegos libremente
- Ver toda la información de cada juego:
  - Imágenes, descripción, rating
  - Trailer, requisitos del sistema
  - Links de descarga
- Recibir recomendaciones básicas de IA (sin personalización)

❌ **No pueden:**

- Guardar juegos favoritos
- Tener historial de búsquedas
- Recibir recomendaciones personalizadas
- Agregar ratings o notas personales

---

### **Usuarios Registrados** (Modo Completo)

✅ **Todo lo anterior más:**

- 💾 Guardar juegos en favoritos
- 📊 Historial de búsquedas persistente
- 🎯 Recomendaciones personalizadas basadas en:
  - Juegos guardados
  - Historial de búsquedas
  - Interacciones (clicks, tiempo de visualización)
  - Ratings dados
- ⭐ Sistema de ratings (1-5 estrellas)
- 📝 Notas personales en cada juego
- 📈 Dashboard con estadísticas

---

## 🔄 Flujo de Conversión

### 1. Usuario llega a la app

```
Landing Page → Click en "Videojuegos" → Acceso directo (sin login)
```

### 2. Usuario explora

```
Selecciona géneros → Ve recomendaciones → Explora juegos
```

### 3. Usuario intenta guardar

```
Click en "Guardar" → Redirect a /auth/sign-up?message=register-to-save
↓
Mensaje amigable: "¡Regístrate para guardar tus favoritos!"
```

### 4. Usuario se registra

```
Sign Up → Perfil creado automáticamente → Redirect a /games
↓
Ahora puede usar todas las funciones premium
```

---

## 🛠️ Implementación Técnica

### Middleware (lib/supabase/middleware.ts)

```typescript
// Rutas públicas que NO requieren autenticación
const publicRoutes = [
  "/",
  "/games", // ← Sección de videojuegos pública
  "/auth",
  "/login",
];
```

### Componente SaveGameButton

```typescript
// Si no está autenticado → Redirect a sign-up
if (!isAuthenticated) {
  router.push("/auth/sign-up?message=register-to-save");
}

// Si está autenticado → Guarda el juego
if (isAuthenticated && onSave) {
  await onSave();
}
```

### Page de Games (app/games/page.tsx)

```typescript
// No hace redirect - solo verifica estado
const { data } = await supabase.auth.getClaims();
const isAuthenticated = !!data?.claims;

// UI condicional
{
  !isAuthenticated && <div>💡 Tip: Regístrate para guardar favoritos</div>;
}
```

---

## 💡 Ventajas de este Enfoque

### 1. **Menor Fricción**

- Usuario prueba sin barreras
- Experimenta el valor antes de comprometerse

### 2. **Mayor Conversión**

- Conversión en el momento de mayor interés (cuando encuentra un juego que le gusta)
- Mensaje contextual ("¡Guarda este juego que te gusta!")

### 3. **Valor Claro**

- Usuario ve exactamente qué gana con el registro
- No es "regístrate porque sí"

### 4. **Engagement Natural**

- Los que se registran ya están comprometidos
- Han usado la app y les gusta

---

## 📊 Tracking (Para Futuro)

Puedes analizar:

- % de usuarios que exploran sin registrarse
- % que intentan guardar favoritos
- % de conversión en página de sign-up
- Juegos más populares que generan registros

---

## 🔮 Extensiones Futuras

### Límites Soft (Opcional)

```
- No registrados: 5 búsquedas por sesión
- Mensaje: "Regístrate para búsquedas ilimitadas"
```

### Preview de Favoritos

```
- Mostrar sección de favoritos deshabilitada
- CTA: "Tus favoritos aparecerán aquí"
```

### Social Proof

```
- "Únete a X usuarios que ya guardan sus juegos favoritos"
```

---

## 🎯 Siguientes Pasos

1. ✅ Sistema de autenticación opcional implementado
2. ⏭️ Crear componente de selección de géneros
3. ⏭️ Integrar RAWG API para obtener juegos
4. ⏭️ Implementar sistema de favoritos (solo autenticados)
5. ⏭️ Dashboard de usuario (favoritos, historial)
