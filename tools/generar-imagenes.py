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
    "Editorial luxury campaign photograph for a quiet, exclusive Parisian-Portuguese house of dog couture. "
    "Soft diffused overcast daylight from the left, warm ivory and stone neutral palette with muted forest-green and "
    "bronze accents, natural colour, fine film grain, restrained minimal composition with generous negative space, "
    "shot on a medium-format camera, 85mm lens, shallow depth of field. "
    "Absolutely no text, no letters, no logos, no labels, no watermark, no people's faces. "
    "Clean image: no props, no bowls, no furniture, no windows, no objects on the floor, nothing in the foreground. "
)
DOG = (
    "The dog is a slender female fawn-and-white whippet with correct canine anatomy: one head, two ears, four legs with paws, "
    "one tail, natural proportions, calm dignified expression, no genitals visible. "
)
GAB = (
    "The dog wears the 'Auteuil' rain coat: a sand-coloured (warm khaki beige) dense cotton gabardine coat cut straight, "
    "covering the back and chest, with a high fold-over collar closed by four small round horn-brown corozo buttons down the chest, "
    "no belt, no straps, no buckles, no hood, no logos, impeccable tailoring. "
)
JER = (
    "The dog wears the 'Passy' jumper: an oatmeal-coloured (warm cream beige) fine-gauge smooth cashmere knit jumper with a soft "
    "folded turtleneck collar and a ribbed hem, no pattern, no logos. "
)
ABR = (
    "The dog wears the 'Marais' coat: a loden-green (deep muted olive green) boiled-wool coat quilted in a regular square-grid lattice (squares about five centimetres), "
    "with a high lined collar and a concealed placket, no visible buttons, no straps, no belts, no buckles, no logos, impeccable tailoring. "
)

# archivo: (modelo, aspecto, tamaño final px (ancho, alto), referencias, prompt)
IMAGES = {
 "hero-inicio": (PRO, "16:9", (2000, 1125), ["gabardina-01"], STYLE + DOG + GAB +
   "Wide horizontal composition: the whippet stands in full profile on the left third of the frame, facing right, in front of a plain pale limestone wall with subtle texture; "
   "wide empty stone space on the right. The dog is large in the frame: its body from paws to ears occupies about 70% of the image height. Full body visible including all four legs and paws. Serene, museum-like."),
 "hero-inicio-movil": (PRO, "4:5", (1200, 1500), ["gabardina-01"], STYLE + DOG + GAB +
   "Vertical composition: the whippet stands in full profile, facing right, centred in the lower two thirds, in front of a plain smooth pale limestone wall with subtle texture and NO columns, NO doors, NO architecture details; empty wall above. The dog is large in the frame: it spans about 80% of the image width and 55% of its height. Full body visible including all four legs and paws."),
 "home-maison": (FLASH, "4:5", (1200, 1500), [], STYLE +
   "Close view of a seamstress's hands (no face) cutting and pinning a paper dog-coat pattern on a pale linen-covered table in a quiet atelier, "
   "a tailor's chalk, a brass thimble and a spool of cream thread beside it. Hands with natural, correct anatomy and five fingers each."),
 "gabardina-01": (PRO, "4:5", (1200, 1500), [], STYLE + DOG + GAB +
   "Studio portrait, the whippet standing in full profile facing right on a seamless warm stone-grey backdrop with a soft floor shadow. The dog fills about 75% of the frame width, centred. Full body visible including all four legs and paws."),
 "gabardina-02": (FLASH, "1:1", (1000, 1000), ["gabardina-01"], STYLE +
   "Macro detail of the same sand-coloured gabardine coat: the high collar and two horn-brown corozo buttons with the dense twill weave visible, tight crop, no dog's face, soft shadow."),
 "gabardina-03": (FLASH, "1:1", (1000, 1000), ["gabardina-01"], STYLE +
   "The sand gabardine coat laid open flat, showing its interior lined in fine natural linen with thin cream-and-ivory stripes; crisp seams, still life on pale stone surface, top-down."),
 "gabardina-04": (PRO, "3:2", (1500, 1000), ["gabardina-01"], STYLE + DOG + GAB +
   "The whippet walking on a wet cobblestone street in light rain, side view, soft grey mist, old pale stone façades blurred behind, droplets beading on the sand coat. Full body with all four legs."),
 "jersey-01": (PRO, "4:5", (1200, 1500), [], STYLE + DOG + JER +
   "Studio portrait, the whippet sitting upright, three-quarter view, on a seamless uniform warm stone-grey backdrop with soft shadow, no coloured bands or edges in the background. Correct anatomy of seated dog, both front paws visible."),
 "jersey-02": (FLASH, "1:1", (1000, 1000), ["jersey-01"], STYLE +
   "Extreme macro of the oatmeal fine-gauge cashmere knit, smooth stockinette stitches with a soft halo of fibres, raking light, fills the whole frame."),
 "jersey-03": (FLASH, "1:1", (1000, 1000), ["jersey-01"], STYLE +
   "A turtleneck collar tube of an oatmeal cashmere dog jumper, wide soft cylinder folded over on itself once (a fold-over roll collar, not a sleeve cuff), standing upright on a pale surface, no dog visible, tight crop."),
 "jersey-04": (FLASH, "3:2", (1500, 1000), ["jersey-01"], STYLE +
   "The oatmeal cashmere dog jumper neatly folded on a light oak wooden surface, a small sprig of dried lavender beside it, still life, side light."),
 "abrigo-01": (PRO, "4:5", (1200, 1500), [], STYLE + DOG + ABR +
   "Studio portrait, the whippet standing in full profile facing right on a seamless warm stone-grey backdrop with soft floor shadow. The dog fills about 75% of the frame width, centred. Full body visible including all four legs and paws."),
 "abrigo-02": (FLASH, "1:1", (1000, 1000), ["abrigo-01"], STYLE +
   "Macro detail of a flat piece of loden-green boiled wool quilted in a lattice of clear DIAMOND shapes (lozenges standing on their points, rotated 45 degrees, about five centimetres), soft puffed relief and fine stitching lines, raking light, fills the whole frame. No dog, no animal, no collar."),
 "abrigo-03": (FLASH, "1:1", (1000, 1000), ["abrigo-01"], STYLE +
   "Detail of a DEEP DARK loden-green (very dark olive, same dark tone as a hunting-coat) quilted wool coat's placket: a fabric flap lifted slightly to reveal discreet antique-brass snap fasteners, tight crop, no dog visible."),
 "abrigo-04": (PRO, "3:2", (1500, 1000), ["abrigo-01"], STYLE + DOG + ABR +
   "The whippet strolling along a gravel path in a park in autumn, side view, golden and russet leaves softly blurred, low misty light. Full body with all four legs."),
 "maison-retrato": (PRO, "4:5", (1200, 1500), [], STYLE +
   "Portrait of an elegant grey Italian greyhound (galga italiana) seated beside a tall window with sheer linen curtain, soft window light on its face, "
   "plain ivory wall, correct canine anatomy, one head two ears four legs, dignified gaze toward camera. No clothing."),
 "maison-materiales": (FLASH, "4:5", (1200, 1500), [], STYLE +
   "Still life on a pale oak table: folded swatches of sand cotton gabardine, striped natural linen, oatmeal cashmere knit and loden-green wool, arranged in a calm grid, top-down, plus a small brass thimble."),
 "maison-atelier": (FLASH, "3:2", (1500, 1000), [], STYLE +
   "A quiet atelier cutting table with paper patterns, long tailor's shears, chalk and a tape measure, large north-facing window, whitewashed walls, no people."),
 "maison-costura": (FLASH, "1:1", (1000, 1000), [], STYLE +
   "Macro of a hand-finished buttonhole stitched in cream silk thread on loden-green wool cloth, tiny precise stitches, no text."),
 "guia-medicion": (PRO, "3:2", (1500, 1000), [], STYLE + DOG +
   "The female fawn whippet stands calmly in profile, entirely inside the frame with a margin around all four paws, tail and head, on a pale wooden floor in a bright room, while bare hands (no gloves, no face, correct anatomy) hold a cream cloth tape measure around its chest right behind the front legs. Camera slightly farther away so the whole dog is visible. No clothing on the dog. Photographed so that no genitals are visible."),
}

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
def generate(name, spec):
    from PIL import Image
    model, aspect, size, refs, prompt = spec
    content = [{"type": "text", "text": prompt}]
    for r in refs:
        content.append({"type": "image_url", "image_url": {"url": data_url(OUT / (r + ".jpg"))}})
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
    for intento in range(5):           # OpenRouter responde 402/429 de forma intermitente
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                res = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code not in (402, 429, 500, 502, 503) or intento == 4:
                raise
            time.sleep(15 * (intento + 1))
    msg = res["choices"][0]["message"]
    imgs = msg.get("images") or []
    if not imgs:
        raise RuntimeError("sin imagen: " + json.dumps(msg)[:300])
    raw = base64.b64decode(imgs[0]["image_url"]["url"].split(",", 1)[1])
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
    print(name, model, im.size, (OUT / (name + ".jpg")).stat().st_size // 1024, "KB", res.get("usage", {}).get("cost", ""))

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--lista" in args:
        for n, s in IMAGES.items():
            print(n, s[0], s[1], s[2])
        sys.exit()
    todo = args or list(IMAGES)
    for n in todo:
        generate(n, IMAGES[n])
