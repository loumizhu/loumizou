#!/usr/bin/env python3
"""
Embed Gallery Metadata
Writes the texts from gallery-data.json into each WebP file as EXIF and XMP.

The metadata is injected at the RIFF container level (new EXIF / XMP chunks), so the
compressed image bitstream is never touched and the pictures lose no quality.

Run this after editing gallery-data.json:
    python embed-gallery-metadata.py
"""

from pathlib import Path
from xml.sax.saxutils import escape
import json
import struct

import piexif
from PIL import Image

DATA_FILE = Path('.') / 'gallery-data.json'
ARTIST = 'Loumizou'
COPYRIGHT = '\u00a9 Loumizou'
EXIF_PREFIX = b'Exif\x00\x00'


def xp(value):
    """Windows XP EXIF tags are UTF-16LE strings."""
    return value.encode('utf-16-le') + b'\x00\x00'


def build_exif(info):
    zeroth = {
        piexif.ImageIFD.ImageDescription: info.get('description', '').encode('utf-8'),
        piexif.ImageIFD.XPTitle: xp(info.get('title', '')),
        piexif.ImageIFD.XPSubject: xp(info.get('tooltip') or info.get('project', '')),
        piexif.ImageIFD.XPKeywords: xp(';'.join(info.get('tags', []))),
        piexif.ImageIFD.Artist: ARTIST.encode('utf-8'),
        piexif.ImageIFD.Copyright: COPYRIGHT.encode('utf-8'),
    }
    raw = piexif.dump({'0th': zeroth, 'Exif': {}, 'GPS': {}, '1st': {}, 'thumbnail': None})
    return raw[len(EXIF_PREFIX):] if raw.startswith(EXIF_PREFIX) else raw


def build_xmp(info):
    keywords = ''.join(f'<rdf:li>{escape(tag)}</rdf:li>' for tag in info.get('tags', []))
    return f'''<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Loumizou Portfolio">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">{escape(info.get("title", ""))}</rdf:li></rdf:Alt></dc:title>
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">{escape(info.get("description", ""))}</rdf:li></rdf:Alt></dc:description>
   <dc:subject><rdf:Bag>{keywords}</rdf:Bag></dc:subject>
   <dc:creator><rdf:Seq><rdf:li>{ARTIST}</rdf:li></rdf:Seq></dc:creator>
   <photoshop:Credit>{ARTIST}</photoshop:Credit>
   <xmp:Rights>{escape(COPYRIGHT)}</xmp:Rights>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>'''.encode('utf-8')


def split_chunks(data):
    if data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        raise ValueError('not a WebP RIFF file')
    chunks = []
    pos = 12
    while pos + 8 <= len(data):
        fourcc = data[pos:pos + 4]
        size = struct.unpack('<I', data[pos + 4:pos + 8])[0]
        payload = data[pos + 8:pos + 8 + size]
        if len(payload) != size:
            raise ValueError('truncated chunk')
        chunks.append([fourcc, payload])
        pos += 8 + size + (size & 1)
    return chunks


def join_chunks(chunks):
    body = b'WEBP'
    for fourcc, payload in chunks:
        body += fourcc + struct.pack('<I', len(payload)) + payload
        if len(payload) & 1:
            body += b'\x00'
    return b'RIFF' + struct.pack('<I', len(body)) + body


def inject_metadata(path, exif, xmp):
    data = path.read_bytes()
    chunks = [chunk for chunk in split_chunks(data) if chunk[0] not in (b'EXIF', b'XMP ')]
    fourccs = {chunk[0] for chunk in chunks}
    if b'VP8X' not in fourccs:
        # Simple-format WebP has no VP8X header, so EXIF / XMP would be ignored.
        # Add one from the (already decoded) pixel dimensions; the bitstream is untouched.
        width, height = Image.open(path).size
        flags = 0x08 | 0x04  # EXIF + XMP
        if b'ALPH' in fourccs:
            flags |= 0x10
        if b'ICCP' in fourccs:
            flags |= 0x20
        vp8x = bytes([flags, 0, 0, 0]) + (width - 1).to_bytes(3, 'little') + (height - 1).to_bytes(3, 'little')
        chunks.insert(0, [b'VP8X', vp8x])
    for chunk in chunks:
        # VP8X flags advertise the EXIF (0x08) and XMP (0x04) chunks.
        if chunk[0] == b'VP8X' and chunk[1]:
            chunk[1] = bytes([chunk[1][0] | 0x08 | 0x04]) + chunk[1][1:]
    chunks.append([b'EXIF', exif])
    chunks.append([b'XMP ', xmp])
    new_data = join_chunks(chunks)
    if new_data != data:
        path.write_bytes(new_data)


def main():
    data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
    updated = skipped = 0
    for key, info in sorted(data.items()):
        path = Path(key)
        if path.suffix.lower() != '.webp' or not path.is_file():
            skipped += 1
            continue
        inject_metadata(path, build_exif(info), build_xmp(info))
        updated += 1
        print(f'Embedded metadata: {key}')

    print(f'\nDone. {updated} WebP file(s) updated, {skipped} entry(ies) skipped.')


if __name__ == '__main__':
    main()
