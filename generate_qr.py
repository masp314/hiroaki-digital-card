"""Generate QR images from enabled links in config.js."""
from pathlib import Path
import re
import sys

try:
    import qrcode
except ImportError:
    sys.exit("qrcode is not installed. Run: python -m pip install qrcode[pil]")

ROOT = Path(__file__).resolve().parent
CONFIG = (ROOT / "config.js").read_text(encoding="utf-8")

blocks = re.findall(r"\{\s*id:\s*\"([^\"]+)\"(.*?)\n\s*\}", CONFIG, re.S)
links = []
for item_id, body in blocks:
    url_match = re.search(r'url:\s*"([^"]+)"', body)
    enabled_match = re.search(r'enabled:\s*(true|false)', body)
    enabled = enabled_match is None or enabled_match.group(1) == "true"
    if url_match and enabled:
        links.append((item_id, url_match.group(1)))

if not links:
    sys.exit("No enabled links were found in config.js")

qr_dir = ROOT / "qr"
qr_dir.mkdir(exist_ok=True)
for old in qr_dir.glob("*.png"):
    old.unlink()

for item_id, url in links:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(qr_dir / f"{item_id}.png")

print(f"Generated {len(links)} QR code(s): {', '.join(item_id for item_id, _ in links)}")
