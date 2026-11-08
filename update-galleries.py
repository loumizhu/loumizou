#!/usr/bin/env python3
"""
Update Gallery HTML
Run this script (or update-galleries.exe) from the site folder whenever you add, remove or rename images.

Image texts live in gallery-data.json, keyed by the image path ("characters/images/50_Desert-princess.webp").
Each entry: title, alt, tooltip, project, description, craft, tags[]. An image without an entry still works:
it gets a title made from its file name, and the script lists it so you can write its texts.
"""

from html import escape
from pathlib import Path
import json
import re

BASE_URL = "https://loumizhu.github.io/loumizou/"
DATA_FILE = Path('.') / 'gallery-data.json'
LD_START, LD_END = '<!-- lz-gallery-ld -->', '<!-- /lz-gallery-ld -->'
DATA = json.loads(DATA_FILE.read_text(encoding='utf-8')) if DATA_FILE.exists() else {}
missing = []


def get_image_name(filename):
    # Remove numbered prefix, extension, separators; capitalize words
    name = re.sub(r'^\d+[\s\-_]*', '', filename)
    name = re.sub(r'\.[^/.]+$', '', name).replace('_', ' ').replace('-', ' ')
    return ' '.join(word.capitalize() for word in name.split())


def card_html(info, contact_href):
    """HTML shown in the lightbox side card (PhotoSwipe caption)."""
    tags = ''.join(f'<li>{escape(t)}</li>' for t in info.get('tags', []))
    parts = [
        f'<p class="lz-card-project">{escape(info["project"])}</p>' if info.get('project') else '',
        f'<h2 class="lz-card-title">{escape(info["title"])}</h2>',
        f'<p class="lz-card-desc">{escape(info["description"])}</p>' if info.get('description') else '',
        f'<p class="lz-card-craft">{escape(info["craft"])}</p>' if info.get('craft') else '',
        f'<ul class="lz-card-tags">{tags}</ul>' if tags else '',
        f'<a class="lz-card-cta" href="{contact_href}">Have an idea like this? Tell me about it</a>',
    ]
    return '<div class="lz-card">' + ''.join(parts) + '</div>'


def gallery_jsonld(page_url, entries):
    images = []
    for key, info in entries:
        obj = {"@type": "ImageObject", "contentUrl": BASE_URL + key, "url": BASE_URL + key,
               "name": info["title"], "creditText": "Loumizou", "creator": {"@id": BASE_URL + "#loumizou"},
               "copyrightNotice": "© Loumizou"}
        for src, dst in (("description", "description"), ("tooltip", "caption"), ("alt", "abstract")):
            if info.get(src):
                obj[dst] = info[src]
        if info.get("tags"):
            obj["keywords"] = ", ".join(info["tags"])
        images.append(obj)
    ld = {"@context": "https://schema.org", "@type": "ImageGallery", "@id": page_url + "#gallery",
          "url": page_url, "isPartOf": {"@id": BASE_URL + "#website"}, "image": images}
    body = json.dumps(ld, ensure_ascii=False, indent=1).replace('</', '<\\/')
    return f'{LD_START}\n<script type="application/ld+json">\n{body}\n</script>\n{LD_END}\n'


def update_gallery(html_file):
    html_path = Path(html_file)
    page_dir = html_path.parent
    images_dir = page_dir / 'images'
    if not images_dir.exists():
        return False

    image_files = sorted([f for f in images_dir.iterdir()
                          if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']])
    if not image_files:
        return False

    content = html_path.read_text(encoding='utf-8')
    if 'vce-image-masonry-gallery-list' not in content:
        return False

    gallery_id_match = re.search(r'data-photoswipe-gallery="([^"]+)"', content)
    gallery_id = gallery_id_match.group(1) if gallery_id_match else 'gallery'

    # Always use 3 columns and gap-15 to match main page style
    num_columns = 3
    content = re.sub(r'vce-image-masonry-gallery--gap-\d+', 'vce-image-masonry-gallery--gap-15', content)
    content = re.sub(r'vce-image-masonry-gallery--columns-\d+', 'vce-image-masonry-gallery--columns-3', content)

    columns = [[] for _ in range(num_columns)]
    for index, img_file in enumerate(image_files):
        columns[index % num_columns].append((index, img_file))

    # DOM position of each logical index (PhotoSwipe walks the DOM column by column)
    dom_pos_of = {}
    for col_images in columns:
        for logical_index, _ in col_images:
            dom_pos_of[logical_index] = len(dom_pos_of)

    rel_dir = page_dir.as_posix().strip('./')
    prefix = '../' * (len(rel_dir.split('/')) if rel_dir else 0)
    contact_href = f'{prefix}about/index.html'
    page_url = BASE_URL + (rel_dir + '/' if rel_dir else '')

    entries = []
    columns_html = []
    for col_images in columns:
        items = []
        for logical_index, img_file in col_images:
            dom_pos = dom_pos_of[logical_index]
            img_path = f"images/{img_file.name}"
            key = f"{rel_dir}/{img_path}" if rel_dir else img_path
            info = DATA.get(key)
            if not info:
                missing.append(key)
                info = {"title": get_image_name(img_file.name)}
            info = dict(info)
            info.setdefault("alt", info["title"])
            entries.append((key, info))
            title = escape(info["title"])
            extra = f' data-lz-title="{title}"'
            if info.get("tooltip"):
                extra += f' data-lz-tip="{escape(info["tooltip"])}"'
            caption = escape(card_html(info, contact_href)) if info.get("description") else title
            items.append(
                f'<a href="{img_path}" data-photoswipe-image="{gallery_id}" data-photoswipe-index="{dom_pos}" '
                f'data-photoswipe-item="photoswipe-{gallery_id}" class="vce-image-masonry-gallery-item" '
                f'data-pswp-uid="{dom_pos + 1}" data-caption="{title}"{extra} data-photoswipe-caption="{caption}">'
                f'<img decoding="async" class="vce-image-masonry-gallery-img" src="{img_path}" alt="{escape(info["alt"])}"></a>')
        columns_html.append(f'<div class="vce-image-masonry-gallery-column">{"".join(items)}</div>')
    new_gallery_content = ''.join(columns_html)

    # Replace the gallery list content.
    # Consume the last column's </div> too: new_gallery_content already closes every column.
    pattern = r'(<div class="vce-image-masonry-gallery-list">).*?</div>(\s*</div>\s*</div>)'
    content = re.sub(pattern, lambda m: m.group(1) + new_gallery_content + m.group(2), content, count=1, flags=re.DOTALL)

    # Structured data listing every image (Google Images, AI search)
    content = re.sub(re.escape(LD_START) + r'.*?' + re.escape(LD_END) + r'\n?', '', content, flags=re.DOTALL)
    content = content.replace('</head>', gallery_jsonld(page_url, entries) + '</head>', 1)

    html_path.write_text(content, encoding='utf-8', newline='')
    return True, len(image_files)


root_dir = Path('.')
for html_file in sorted(root_dir.rglob('*.html')):
    if html_file.name == 'original_index.html':
        continue
    if (html_file.parent / 'images').exists():
        result = update_gallery(html_file)
        if result:
            print(f"Updated gallery: {html_file} ({result[1]} images)")

if missing:
    print(f"\n{len(missing)} image(s) have no texts in gallery-data.json yet:")
    for key in missing:
        print("  ", key)
print("Done! Run this script whenever you add new images to update the galleries.")
