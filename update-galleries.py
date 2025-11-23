#!/usr/bin/env python3
"""
Update Gallery HTML
Run this script whenever you add new images to update the galleries.
"""

from pathlib import Path
import re

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
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Get gallery ID
    gallery_id_match = re.search(r'data-photoswipe-gallery="([^"]+)"', content)
    gallery_id = gallery_id_match.group(1) if gallery_id_match else 'gallery'
    
    # Always use 3 columns and gap-15 to match main page style
    num_columns = 3
    
    # Update the wrapper classes to match main page style
    gap_pattern = r'vce-image-masonry-gallery--gap-\d+'
    columns_pattern = r'vce-image-masonry-gallery--columns-\d+'
    
    # Replace gap class
    content = re.sub(gap_pattern, 'vce-image-masonry-gallery--gap-15', content)
    # Replace columns class
    content = re.sub(columns_pattern, 'vce-image-masonry-gallery--columns-3', content)
    
    # Build columns
    columns = [[] for _ in range(num_columns)]
    for index, img_file in enumerate(image_files):
        column_index = index % num_columns
        columns[column_index].append((index, img_file))
    
    # Create a list of all items in DOM order with their logical index and DOM position
    dom_order_items = []
    for col_index, col_images in enumerate(columns):
        for logical_index, img_file in col_images:
            dom_order_items.append((logical_index, img_file, len(dom_order_items)))
    
    # Build HTML - use DOM position as data-photoswipe-index so PhotoSwipe shows correct image
    columns_html = []
    for col_index, col_images in enumerate(columns):
        items = []
        for logical_index, img_file in col_images:
            # Find DOM position for this logical index
            dom_pos = next((pos for idx, _, pos in dom_order_items if idx == logical_index), logical_index)
            img_path = f"images/{img_file.name}"
            # Use DOM position as index so PhotoSwipe shows the correct image
            items.append(f'<a href="{img_path}" data-photoswipe-image="{gallery_id}" data-photoswipe-index="{dom_pos}" data-photoswipe-item="photoswipe-{gallery_id}" class="vce-image-masonry-gallery-item" data-pswp-uid="{dom_pos + 1}"><img decoding="async" class="vce-image-masonry-gallery-img" src="{img_path}" alt=""></a>')
        columns_html.append(f'<div class="vce-image-masonry-gallery-column">{"".join(items)}</div>')
    
    new_gallery_content = ''.join(columns_html)
    
    # Replace the gallery list content
    pattern = r'(<div class="vce-image-masonry-gallery-list">).*?(</div>\s*</div>\s*</div>)'
    replacement = r'\1' + new_gallery_content + r'\2'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, len(image_files)

# Process all HTML files
root_dir = Path('.')
for html_file in root_dir.rglob('*.html'):
    html_path = Path(html_file)
    if (html_path.parent / 'images').exists():
        result = update_gallery(html_file)
        if result:
            success, count = result
            if success:
                print(f"Updated gallery: {html_file} ({count} images)")

print("Done! Run this script whenever you add new images to update the galleries.")

