#!/usr/bin/env python3
"""Maison Canis · generación única de las imágenes de la web con OpenRouter.

La web NO llama a OpenRouter: este script se ejecuta una vez (o cuando se quiera
rehacer alguna foto) y deja los JPG en images/.

Uso:
    export OPENROUTER_API_KEY=...        # o ponerla en .env (ignorado por git)
    python3 tools/generar-imagenes.py                 # genera las que falten
    python3 tools/generar-imagenes.py hero-inicio     # fuerza una concreta
    python3 tools/generar-imagenes.py --lista         # muestra nombres y coste estimado

Requiere Pillow (pip install pillow). La clave nunca se escribe en ningún archivo.
"""
import base64, io, json, os, sys, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "images"
RAW = ROOT / "tools" / "originales"          # copias sin recortar (ignoradas por git)

PRO = "google/gemini-3-pro-image-preview"
FLASH = "google/gemini-3.1-flash-image-preview"

STYLE = (
    "Editorial luxury campaign photograph for a quiet, exclusive fashion house for dogs. "
    "Soft diffused overcast daylight from the left, warm ivory and stone neutral palette with muted forest-green and "
    "bronze accents, natural colour, fine film grain, restrained minimal composition with generous negative space, "
    "shot on a medium-format camera, 85mm lens, shallow depth of field. "
    "Absolutely no text, no letters, no logos, no labels, no watermark, no people's faces. "
    "Clean image: no props, no bowls, no furniture, no windows, no objects on the floor, nothing in the foreground. "
)
DOG = (
    "The dog is a slender FEMALE fawn-and-white whippet (no male anatomy visible, belly line clean) with correct canine anatomy: one head, two ears, four legs with paws, "
    "one tail, natural proportions, calm dignified expression, no genitals visible. "
)

# archivo: (modelo, aspecto, tamaño final px (ancho, alto), referencias, prompt)
# Las referencias son nombres de imágenes ya generadas (images/) o rutas a archivos (tools/referencias/).
VEND = (
    "The dog wears the 'Vendôme' coat: a long double-breasted coat in heather-grey wool flannel, adapted to a dog's body: tailored peak-lapel collar, "
    "two vertical rows of two large, clearly JET-BLACK glossy buttons on the chest (the buttons must be black, not brown or tan), and a matching wool tie belt around the waist knotted in a soft bow at the side. "
    "The coat covers the back and chest and falls just past the ribs. No hood, no logos, impeccable tailoring. "
    "Reproduce the cut, fabric and colour of the garment in the attached design reference, but fitted on the dog; do not include the woman from the reference. "
)
MONT = (
    "The dog wears the 'Montaigne' down jacket: a glossy black lacquered nylon puffer jacket with horizontal channel quilting, a high standing collar, "
    "a hood lowered and resting folded at the back of the neck, and a black zip closing along the chest. It covers the back and chest and ends at the ribs. "
    "No logos, no patches, no text. Reproduce the glossy quilted look of the attached design reference, but adapted and fitted to the dog's body; do not include any human. "
)
RIV = (
    "The dog wears the 'Rivoli' cape: a camel-coloured double-faced cashmere cape that drapes over the back and chest like a short cloak, "
    "closing at the throat with a single large antique-brass toggle button, with softly finished raw edges and a clean hem that ends mid-body, leaving the legs free. "
    "No hood, no logos, impeccable tailoring. "
)
IMAGES = {
 "vendome-01": (PRO, "4:5", (1200, 1500), ["tools/referencias/abrigo-cruzado-ref.jpg"], STYLE + DOG + VEND +
   "Studio portrait, the whippet standing in full profile facing right on a seamless pale stone-grey backdrop with a soft floor shadow. The dog fills about 75% of the frame width. Full body visible including all four legs and paws."),
 "montaigne-01": (PRO, "4:5", (1200, 1500), ["tools/referencias/plumifero-ref.jpg"], STYLE.replace("Soft diffused overcast daylight from the left, warm ivory and stone neutral palette", "Dramatic low-key lighting: soft side light plus a subtle rim light, deep charcoal-black backdrop") + DOG + MONT +
   "Studio portrait, the whippet standing in full profile facing right on a seamless deep charcoal backdrop with a faint floor reflection. The dog fills about 75% of the frame width. Full body visible including all four legs and paws."),
 "rivoli-01": (PRO, "4:5", (1200, 1500), [], STYLE.replace("warm ivory and stone neutral palette", "warm terracotta and sand palette") + DOG + RIV +
   "Studio portrait, the whippet standing in full profile facing right on a seamless warm terracotta-clay backdrop with a soft floor shadow. The dog fills about 75% of the frame width. Full body visible including all four legs and paws."),
 "hero-inicio": (PRO, "16:9", (2000, 1125), ["vendome-01"], STYLE + DOG + VEND +
   "Wide horizontal composition: the whippet stands in full profile on the left third of the frame, facing right, in front of a plain smooth pale limestone wall with subtle texture, no columns or architecture; wide empty wall on the right. "
   "The dog is large in the frame: paws to ears about 70% of the image height. Full body visible including all four legs and paws. Serene, museum-like."),
 "guia-medicion": (PRO, "3:2", (1500, 1000), [], STYLE + DOG +
   "The female fawn whippet stands calmly in profile, entirely inside the frame with a margin around all four paws, tail and head, on a pale wooden floor in a bright room, while bare hands (no gloves, no face, correct anatomy) hold a cream cloth tape measure around its chest right behind the front legs. No clothing on the dog. Photographed so that no genitals are visible. Camera slightly farther away so the whole dog is visible."),
}

# Recortes sin coste: detalles sacados del original de alta resolución (tools/originales/*.png)
# nombre: (origen, caja (x0, y0, x1, y1) en fracciones del original, tamaño final)
DERIVED = {
 "vendome-02": ("vendome-01", (0.45, 0.38, 0.80, 0.66), (1000, 1000)),
 "vendome-03": ("vendome-01", (0.12, 0.42, 0.52, 0.74), (1000, 1000)),
 "vendome-04": ("vendome-01", (0.08, 0.36, 0.90, 0.80), (1500, 1000)),
 "montaigne-02": ("montaigne-01", (0.40, 0.29, 0.76, 0.58), (1000, 1000)),
 "montaigne-03": ("montaigne-01", (0.18, 0.33, 0.50, 0.585), (1000, 1000)),
 "montaigne-04": ("montaigne-01", (0.22, 0.28, 0.78, 0.58), (1500, 1000)),
 "rivoli-02": ("rivoli-01", (0.50, 0.22, 0.85, 0.50), (1000, 1000)),
 "rivoli-03": ("rivoli-01", (0.12, 0.34, 0.50, 0.64), (1000, 1000)),
 "rivoli-04": ("rivoli-01", (0.08, 0.28, 0.82, 0.68), (1500, 1000)),
 "hero-inicio-movil": ("vendome-01", (0.0, 0.0, 1.0, 1.0), (1200, 1500)),
}

def derive(name):
    from PIL import Image
    src, box, size = DERIVED[name]
    im = Image.open(RAW / (src + ".png")).convert("RGB")
    w, h = im.size
    c = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    tw, th = size
    r = tw / th; cw, ch = c.size
    if cw / ch > r:
        nw = int(ch * r); c = c.crop(((cw - nw) // 2, 0, (cw - nw) // 2 + nw, ch))
    else:
        nh = int(cw / r); c = c.crop((0, (ch - nh) // 2, cw, (ch - nh) // 2 + nh))
    c.resize(size, Image.LANCZOS).save(OUT / (name + ".jpg"), "JPEG", quality=82, optimize=True, progressive=True)
    print(name, "recorte de", src, size)

def load_key():
    k = os.environ.get("OPENROUTER_API_KEY", "")
    env = ROOT / ".env"
    if not k and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("OPENROUTER_API_KEY="):
                k = line.split("=", 1)[1].strip()
    return k

def data_url(path):
    return "data:image/jpeg;base64," + base64.b64encode(path.read_bytes()).decode()

# Nota: images/guia-medicion.jpg es un recorte (cuello, manos y cinta) del original 2528×1696 generado con este prompt.

def generate_kie(prompt, aspect, big, res4k=False):
    """Alternativa cuando OpenRouter no tiene saldo: Kie API (modelo nano-banana-pro).
    La clave va en el entorno (KIE_API_KEY) o en .env; en el entorno de desarrollo la inyecta el proxy.
    Kie solo admite imágenes de referencia por URL pública, así que aquí se usa solo el texto."""
    import time
    headers = {"Content-Type": "application/json"}
    key = os.environ.get("KIE_API_KEY", "")
    env = ROOT / ".env"
    if not key and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("KIE_API_KEY="):
                key = line.split("=", 1)[1].strip()
    if key:
        headers["Authorization"] = "Bearer " + key
    body = {"model": "nano-banana-pro", "input": {"prompt": prompt, "image_input": [], "aspect_ratio": aspect,
            "resolution": "4K" if res4k else ("2K" if big else "1K"), "output_format": "png"}}
    req = urllib.request.Request("https://api.kie.ai/api/v1/jobs/createTask", json.dumps(body).encode(), headers)
    res = json.load(urllib.request.urlopen(req, timeout=120))
    if res.get("code") != 200:
        raise RuntimeError("Kie: " + json.dumps(res)[:300])
    task = res["data"]["taskId"]
    for _ in range(90):
        time.sleep(6)
        r = urllib.request.Request("https://api.kie.ai/api/v1/jobs/recordInfo?taskId=" + task, headers=headers)
        d = json.load(urllib.request.urlopen(r, timeout=60)).get("data") or {}
        if d.get("state") == "success":
            url = json.loads(d["resultJson"])["resultUrls"][0]
            return urllib.request.urlopen(url, timeout=120).read()
        if d.get("state") == "fail":
            raise RuntimeError("Kie: " + str(d.get("failMsg")))
    raise RuntimeError("Kie: tiempo agotado")

def generate(name, spec):
    from PIL import Image
    model, aspect, size, refs, prompt = spec
    content = [{"type": "text", "text": prompt}]
    for r in refs:
        path = (ROOT / r) if "/" in r else (OUT / (r + ".jpg"))
        content.append({"type": "image_url", "image_url": {"url": data_url(path)}})
        content[0]["text"] += " Keep the exact same garment, fabric, colour and lighting as in the reference image."
    body = {"model": model, "modalities": ["image", "text"],
            "image_config": {"aspect_ratio": aspect, "image_size": "2K" if size[0] > 1300 else "1K"},
            "messages": [{"role": "user", "content": content}]}
    headers = {"Content-Type": "application/json"}
    key = load_key()
    if key:  # en el entorno de desarrollo la clave la inyecta el proxy
        headers["Authorization"] = "Bearer " + key
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", json.dumps(body).encode(), headers)
    import time
    raw = None
    for intento in range(3):           # OpenRouter primero
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                res = json.load(r)
            msg = res["choices"][0]["message"]
            imgs = msg.get("images") or []
            if not imgs:
                raise RuntimeError("sin imagen: " + json.dumps(msg)[:300])
            raw = base64.b64decode(imgs[0]["image_url"]["url"].split(",", 1)[1])
            used = "openrouter"
            break
        except urllib.error.HTTPError as e:
            if e.code == 402:           # sin saldo: pasa a Kie API
                break
            if e.code not in (429, 500, 502, 503) or intento == 2:
                raise
            time.sleep(15 * (intento + 1))
    if raw is None:
        used = "kie"
        import re
        raw = generate_kie(re.sub(r"Reproduce [^.]*\.", "", prompt), aspect, size[0] > 1300, res4k=(aspect == "4:5" and name.endswith("-01") and name != "hero-inicio-movil"))
    RAW.mkdir(exist_ok=True)
    (RAW / (name + ".png")).write_bytes(raw)
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    # recorte centrado a la proporción final y reducción
    tw, th = size
    ratio = tw / th
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / ratio); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize(size, Image.LANCZOS)
    im.save(OUT / (name + ".jpg"), "JPEG", quality=80, optimize=True, progressive=True)
    print(name, used, im.size, (OUT / (name + ".jpg")).stat().st_size // 1024, "KB")

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--lista" in args:
        for n, s in IMAGES.items():
            print(n, s[0], s[1], s[2])
        for n in DERIVED:
            print(n, "recorte")
        sys.exit()
    todo = args or (list(IMAGES) + list(DERIVED))
    for n in todo:
        if n in DERIVED:
            derive(n)
        else:
            generate(n, IMAGES[n])

# Nota: hero-inicio.jpg es una composición: la foto vendome-01 (original 4K) sobre un fondo de estudio
# extendido a 16:9, porque la versión 16:9 generada tenía las patas cortadas por el borde inferior.
