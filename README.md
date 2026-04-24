# Game Match

Aplicacion web en React + Vite que recomienda videojuegos a partir de un flujo simple:

1. El usuario elige plataforma.
2. El sistema muestra 5 juegos para calificar (1-5 estrellas).
3. Se obtiene una recomendacion final basada en preferencias y genero.

La app consume la API de GameBrain a traves de un proxy local (`/api/gamebrain`) y tiene un fallback de datos estaticos cuando no hay token o falla la API.

## Stack tecnico

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Framer Motion
- Vitest + Testing Library

## Requisitos

- Node.js 20+ recomendado
- npm 10+ recomendado

## Variables de entorno

Crea un archivo `.env` en la raiz (puedes copiar `.env.example`):

```env
VITE_GAMEBRAIN_API_URL=https://api.gamebrain.co/v1
VITE_GAMEBRAIN_API_KEY=tu_api_key_aqui
```

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

Scripts disponibles:

- `npm run dev`: servidor local
- `npm run build`: build de produccion
- `npm run preview`: previsualizar build
- `npm run test`: ejecutar tests

## Flujo funcional

- `src/App.tsx` controla pasos del flujo (`platform -> questions -> result`).
- `src/lib/gamebrainApi.ts` consulta GameBrain y normaliza datos.
- `src/lib/recommendationEngine.ts` calcula promedio, generos favoritos y score.
- `src/components/*` renderiza selector de plataforma, preguntas y resultado.

---

## API: consultas, endpoints y payloads

### Resumen de integracion

La app **no llama directamente** a `https://api.gamebrain.co/v1` desde componentes.  
Todas las consultas pasan por el proxy de Vite:

- Base local: `http://localhost:5173/api/gamebrain`
- Base remota real: `https://api.gamebrain.co/v1` (configurable con `VITE_GAMEBRAIN_API_URL`)

El proxy:

- Reescribe `/api/gamebrain/*` -> `/*` en el host remoto.
- Inyecta header `x-api-key` si existe `VITE_GAMEBRAIN_API_KEY`.

Adicionalmente, el cliente agrega:

- Query params: `lang=es&locale=es`
- Header: `Accept-Language: es-ES,es;q=0.9,en;q=0.7`
- Header/query de autenticacion segun configuracion (`x-api-key` y/o `api-key`)

### Endpoint 1: buscar juegos (preguntas iniciales)

- **Metodo:** `GET`
- **Endpoint local:** `/api/gamebrain/games`
- **Uso:** obtener juegos para armar las 5 preguntas
- **Parametros query usados por la app:**
  - `query` (string): plataforma (`PC`, `PlayStation`, `Xbox`, `Nintendo`)
  - `limit` (number): cantidad maxima (ejemplo: `10`)
  - `lang=es`
  - `locale=es`
  - `api-key` (opcional, si hay token)

Ejemplo de request:

```http
GET /api/gamebrain/games?query=PC&limit=10&lang=es&locale=es HTTP/1.1
Host: localhost:5173
Accept-Language: es-ES,es;q=0.9,en;q=0.7
x-api-key: <API_KEY_OPCIONAL>
```

Ejemplo de payload de respuesta (API remota, puede variar):

```json
{
  "data": [
    {
      "id": 3498,
      "name": "Grand Theft Auto V",
      "description": "Juego de accion y mundo abierto...",
      "genres": [{ "name": "Action" }, { "name": "Adventure" }],
      "cover": { "url": "https://..." },
      "rating": 95
    }
  ]
}
```

### Endpoint 2: detalle de juego (enriquecimiento de descripcion)

- **Metodo:** `GET`
- **Endpoint local:** `/api/gamebrain/games/:id`
- **Uso:** enriquecer descripcion en espanol cuando la descripcion inicial es insuficiente o no parece en espanol
- **Parametros query usados por la app:**
  - `lang=es`
  - `locale=es`
  - `api-key` (opcional)

Ejemplo de request:

```http
GET /api/gamebrain/games/3498?lang=es&locale=es HTTP/1.1
Host: localhost:5173
Accept-Language: es-ES,es;q=0.9,en;q=0.7
x-api-key: <API_KEY_OPCIONAL>
```

Ejemplo de payload de respuesta:

```json
{
  "id": 3498,
  "name": "Grand Theft Auto V",
  "description": "Descripcion detallada en espanol...",
  "genres": [{ "name": "Accion" }, { "name": "Aventura" }],
  "cover": { "url": "https://..." },
  "rating": { "rating": 95 }
}
```

### Endpoint 3: recomendacion final

La recomendacion final usa el mismo endpoint de busqueda (`GET /games`) con query compuesta:

- **Metodo:** `GET`
- **Endpoint local:** `/api/gamebrain/games`
- **Uso:** buscar 1 juego ordenado por rating
- **Parametros query usados por la app:**
  - `query`: `"<plataforma> <genero1> <genero2> <genero3>"`
  - `limit=1`
  - `sort=computed_rating`
  - `sort-order=desc`
  - `lang=es`
  - `locale=es`
  - `api-key` (opcional)

Ejemplo de request:

```http
GET /api/gamebrain/games?query=PC%20RPG%20Accion&limit=1&sort=computed_rating&sort-order=desc&lang=es&locale=es HTTP/1.1
Host: localhost:5173
Accept-Language: es-ES,es;q=0.9,en;q=0.7
x-api-key: <API_KEY_OPCIONAL>
```

Ejemplo de payload de respuesta:

```json
{
  "data": [
    {
      "id": 1234,
      "name": "Juego recomendado",
      "description": "Descripcion...",
      "genres": ["RPG", "Accion"],
      "coverUrl": "https://...",
      "computed_rating": 92
    }
  ]
}
```

### Payload interno que usa la app

Independientemente del formato remoto (`data`, `results` o `games`), la app normaliza el resultado a:

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "descriptionInSpanish": true,
  "platform": "PC | PlayStation | Xbox | Nintendo",
  "genres": ["string"],
  "coverUrl": "string | undefined",
  "score": 90
}
```

## Fallback y manejo de errores

- Si no hay `VITE_GAMEBRAIN_API_KEY`, la app usa juegos estaticos locales (`FALLBACK`).
- Si una consulta falla, tambien cae a fallback por plataforma.
- Si no se logran 5 juegos para preguntas, se muestra mensaje de error al usuario.

## Tests

Tests actuales en `src/__tests__/recommendationEngine.test.ts`:

- promedio de estrellas
- priorizacion de generos
- scoring de candidato alineado vs no alineado

Ejecutar:

```bash
npm run test
```

## Notas de seguridad

- No subas `.env` al repositorio.
- Usa `.env.example` como plantilla.
- La API key debe rotarse si fue expuesta accidentalmente.
