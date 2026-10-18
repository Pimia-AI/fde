"""Vista previa local: sirve las rutas públicas (/fde, /metodo…) y /assets-landing/ como en producción.

    python3 preview.py   ->  http://127.0.0.1:8765

El formulario /empezar responde siempre 503 aquí: su backend no forma parte de este repositorio.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
ROUTES = {'/': 'index.html', **{f'/{name}': f'{name}.html' for name in
          ('fde', 'metodo', 'plataforma', 'plataformas', 'preguntas', 'empezar')}}

class Handler(SimpleHTTPRequestHandler):
    def route(self):
        path = unquote(urlsplit(self.path).path)
        if path in ROUTES:
            self.path = '/' + ROUTES[path]
            return True
        if path.startswith('/assets-landing/'):
            name = path.removeprefix('/assets-landing/')
            if name in ('site.css', 'site.js'):
                self.path = '/assets/' + name
                return True
        self.send_error(404)
        return False

    def do_GET(self):
        if self.route():
            super().do_GET()

    def do_POST(self):
        body = b'{"status":"unavailable"}'
        self.send_response(503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_HEAD(self):
        if self.route():
            super().do_HEAD()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8765), partial(Handler, directory=str(ROOT)))
    print('Vista previa: http://127.0.0.1:8765', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
