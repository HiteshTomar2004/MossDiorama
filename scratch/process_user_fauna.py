import os
import numpy as np
from PIL import Image
from collections import deque

out_dir = 'e:/Portfolio-Website/public/assets/fauna'
os.makedirs(out_dir, exist_ok=True)
scratch_dir = 'C:/Users/Hitesh/.gemini/antigravity/brain/1236b551-173e-4e3f-8c97-d9f77a2d2075/scratch'

# =====================================================================
# 1. PROCESS WAYFINDER BIRD SPRITES (bird_still & bird_fly)
# =====================================================================
print("Processing Wayfinder Bird Sprites...")
bird_still_im = Image.open('e:/Portfolio-Website/bird_still').convert('RGBA')
bird_fly_im = Image.open('e:/Portfolio-Website/bird_fly').convert('RGBA')

# bird_still is 960 x 450. Let's find columns and rows
# Let's inspect rows/cols:
# Let's find distinct connected components in alpha channel:
still_alpha = np.array(bird_still_im.split()[-1])
# Find column slices
col_has_content = (still_alpha > 10).any(axis=0)
row_has_content = (still_alpha > 10).any(axis=1)

# Let's slice bird_still into individual frame images
# Grid test: 960 / 6 = 160 width, 450 / 3 = 150 height
sw, sh = 160, 150
still_frames = []
for r in range(3):
    for c in range(6):
        box = (c * sw, r * sh, (c + 1) * sw, (r + 1) * sh)
        crop = bird_still_im.crop(box)
        bbox = crop.getbbox()
        if bbox and (bbox[2] - bbox[0] > 20) and (bbox[3] - bbox[1] > 20):
            still_frames.append(crop)

print(f"Found {len(still_frames)} still frames.")

# bird_fly: 495 x 825. 3 cols x 5 rows of 165x165
fw, fh = 165, 165
fly_frames = []
for r in range(5):
    for c in range(3):
        box = (c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)
        crop = bird_fly_im.crop(box)
        bbox = crop.getbbox()
        if bbox and (bbox[2] - bbox[0] > 20) and (bbox[3] - bbox[1] > 20):
            fly_frames.append(crop)

print(f"Found {len(fly_frames)} fly frames.")

# Save clean normalized frames to public/assets/fauna/
# For still: We only need 2-3 clean frames (perched calm, head tilt)
# Let's auto-crop and center them in 256x256
def normalize_sprite(im, size=256):
    bbox = im.getbbox()
    if not bbox:
        return im.resize((size, size))
    cropped = im.crop(bbox)
    w, h = cropped.size
    max_side = max(w, h)
    scale = (size * 0.85) / max_side
    nw = max(1, int(w * scale))
    nh = max(1, int(h * scale))
    resized = cropped.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas

# Select top 2 still frames (perched calm & alert)
for i in range(min(3, len(still_frames))):
    norm = normalize_sprite(still_frames[i])
    norm.save(os.path.join(out_dir, f"bird_still_{i}.png"))
print("Saved bird_still_0, 1, 2")

# Select top 4 fly frames (wing flap cycle)
for i in range(min(4, len(fly_frames))):
    norm = normalize_sprite(fly_frames[i])
    norm.save(os.path.join(out_dir, f"bird_fly_{i}.png"))
print("Saved bird_fly_0, 1, 2, 3")


# =====================================================================
# 2. EXTRACT EXACT WAYFINDER FOX SPRITES FROM USER IMAGES
# =====================================================================
print("Extracting Wayfinder Fox Sprites...")
fox_sleep_src = r'C:\Users\Hitesh\.gemini\antigravity\brain\1236b551-173e-4e3f-8c97-d9f77a2d2075\.user_uploaded\media_1789230009207.png'
fox_awake_src = r'C:\Users\Hitesh\.gemini\antigravity\brain\1236b551-173e-4e3f-8c97-d9f77a2d2075\.user_uploaded\media_1789230026505.png'

def isolate_fox(img_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img)
    H, W, _ = arr.shape
    
    # In the screenshot, the fox has bright orange fur (R > 180, G > 70, B < 60),
    # white muzzle (R > 200, G > 200, B > 180),
    # black outline / nose / paw (R < 50, G < 50, B < 50),
    # and little white sleep mark 'z'.
    # The background is dark olive-green terrain (R: 50-80, G: 60-90, B: 35-55) or tent corner in bottom-left.
    
    # Let's identify fox pixels by color properties:
    # 1. Orange fur:
    is_orange = (arr[:, :, 0] > 160) & (arr[:, :, 1] > 60) & (arr[:, :, 2] < 70)
    # 2. White muzzle / inner ear / 'z':
    is_white = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 170) & (arr[:, :, 2] > 140)
    # 3. Dark paws / black outline:
    # Outline is dark and near the fox body
    is_dark = (arr[:, :, 0] < 55) & (arr[:, :, 1] < 55) & (arr[:, :, 2] < 55)
    
    # Background seed from corners:
    # Outer background is connected to borders
    is_bg = np.zeros((H, W), dtype=bool)
    
    # Any pixel that is dark green / grass
    is_grass = (arr[:, :, 0] < 120) & (arr[:, :, 1] < 130) & (arr[:, :, 2] < 90) & ~is_dark & ~is_orange & ~is_white
    
    # Also bottom-left tent:
    is_tent = (arr[:, :, 0] > 140) & (arr[:, :, 1] > 150) & (arr[:, :, 2] > 165)
    
    bg_mask = is_grass | is_tent
    
    # Flood-fill background from perimeter
    visited = np.zeros((H, W), dtype=bool)
    q = deque()
    
    for x in range(W):
        if bg_mask[0, x] or arr[0, x, 1] > arr[0, x, 0]: # Greenish
            visited[0, x] = True
            q.append((0, x))
        if bg_mask[H - 1, x] or is_tent[H - 1, x]:
            visited[H - 1, x] = True
            q.append((H - 1, x))
            
    for y in range(H):
        if bg_mask[y, 0] or is_tent[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if bg_mask[y, W - 1]:
            visited[y, W - 1] = True
            q.append((y, W - 1))
            
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx]:
                # Don't cross into fox orange or white
                if not is_orange[ny, nx] and not is_white[ny, nx]:
                    # If it's not the fox body outline, flood fill
                    # The black ground line at bottom:
                    if arr[ny, nx, 0] < 20 and arr[ny, nx, 1] < 20 and arr[ny, nx, 2] < 20 and ny > H - 15:
                        continue # Keep black ground line of fox
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    # The fox is where NOT visited
    fox_mask = ~visited
    
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[:, :, :3] = arr
    rgba[:, :, 3] = np.where(fox_mask, 255, 0)
    
    res = Image.fromarray(rgba, 'RGBA')
    return normalize_sprite(res, 512)

fox_sleep_im = isolate_fox(fox_sleep_src)
fox_sleep_im.save(os.path.join(out_dir, "wayfinder_fox_sleep.png"))
# Also overwrite fox_sleep_0 and fox_sleep_1
fox_sleep_im.save(os.path.join(out_dir, "fox_sleep_0.png"))
fox_sleep_im.save(os.path.join(out_dir, "fox_sleep_1.png"))

fox_awake_im = isolate_fox(fox_awake_src)
fox_awake_im.save(os.path.join(out_dir, "wayfinder_fox_awake.png"))
# Also overwrite fox_sit_0 and fox_sit_1
fox_awake_im.save(os.path.join(out_dir, "fox_sit_0.png"))
fox_awake_im.save(os.path.join(out_dir, "fox_sit_1.png"))

print("Successfully isolated and saved Wayfinder Fox assets!")
