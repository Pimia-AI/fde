# FDE · Pimia Forge

Web pública de **https://fde.airealbusiness.com**: qué es un *Forward Deployed Engineer* (FDE) y
cómo trabaja con las empresas en Pimia Forge, desde la consultoría hasta el MVP que el negocio
valida. Es la puerta de entrada para los FDE que construyen verticales para Pimia,
airealbusiness, Boksia y wab ai.

## Páginas

| Ruta | Fichero |
|---|---|
| `/` | `index.html` |
| `/fde` | `fde.html` — qué es un FDE |
| `/metodo` | `metodo.html` — de la consultoría al MVP validado |
| `/plataforma` | `plataforma.html` — lo que ofrece la plataforma |
| `/plataformas` | `plataformas.html` — Pimia, airealbusiness, Boksia y wab ai |
| `/preguntas` | `preguntas.html` — preguntas frecuentes |
| `/empezar` | `empezar.html` — solicitud de acceso |

HTML, CSS y JavaScript sin frameworks ni build. El CSS y el JS compartidos están en `assets/` y se
sirven en `/assets-landing/`. La marca se cambia en `BRAND_NAME` (`assets/site.js`) y en el
`<title>`/`og:title` de cada página.

## Vista previa

```sh
python3 preview.py   # http://127.0.0.1:8765
```

El formulario de `/empezar` envía a `/api/landing/access`, un servicio que no forma parte de este
repositorio; en local responde 503 y la página muestra el aviso de contacto por correo.

La plataforma funciona con [InsForge](https://github.com/InsForge/InsForge), open source.
