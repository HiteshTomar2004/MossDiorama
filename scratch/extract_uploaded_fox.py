import os
import numpy as np
from PIL import Image
from collections import deque

src_path = r'C:\Users\Hitesh\.gemini\antigravity\brain\1236b551-173e-4e3f-8c97-d9f77a2d2075\.user_uploaded\media_1789230616347.png'
out_dir = 'e:/Portfolio-Website/public/assets/fauna'
scratch_dir = 'C:/Users/Hitesh/.gemini/antigravity/brain/1236b551-173e-4e3f-8c97-d9f77a2d2075/scratch'
os.makedirs(out_dir, exist_ok=True)
os.makedirs(scratch_dir, exist_ok=True)

img = Image.open(src_path).convert('RGBA')
W, H = img.size
print(f"Loaded image {W}x{H}")

panel_w = W // 4 # 256
frames = []

for i in range(4):
    box = (i * panel_w, 0, (i + 1) * panel_w, H)
    crop = img.crop(box)
    
    arr = np.array(crop)
    cH, cW, _ = arr.shape
    
    # White background detection (flood fill from borders)
    # Check if pixel is white/near-white
    is_white = (arr[:, :, 0] >= 242) & (arr[:, :, 1] >= 242) & (arr[:, :, 2] >= 242)
    
    visited = np.zeros((cH, cW), dtype=bool)
    q = deque()
    
    # Border pixels that are white
    for x in range(cW):
        if is_white[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if is_white[cH - 1, x]:
            visited[cH - 1, x] = True
            q.append((cH - 1, x))
            
    for y in range(cH):
        if is_white[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if is_white[y, cW - 1] and not visited[y, cW - 1]:
            visited[y, cW - 1] = True
            q.append((y, cW - 1))
            
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < cH and 0 <= nx < cW and not visited[ny, nx]:
                if is_white[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    # Transparent where visited
    arr[visited, 3] = 0
    
    # Soft alpha feathering for edges adjacent to background
    res = Image.fromarray(arr, 'RGBA')
    
    # Crop to non-empty bbox with clean margins
    bbox = res.getbbox()
    if bbox:
        # Add 6px margin
        m_box = (
            max(0, bbox[0] - 6),
            max(0, bbox[1] - 6),
            min(cW, bbox[2] + 6),
            min(cH, bbox[3] + 6)
        )
        tight = res.crop(m_box)
    else:
        tight = res
        
    frames.append(tight)
    print(f"Panel {i}: size {tight.size}")

# Save the 4 frames into public/assets/fauna/
# Panel 0: Sleeping with 'z'
frames[0].save(os.path.join(out_dir, "fox_sleep_0.png"))
# Panel 1: Half-awake / waking up
frames[1].save(os.path.join(out_dir, "fox_sleep_1.png"))
# Panel 2: Wide open alert eye looking at cat
frames[2].save(os.path.join(out_dir, "fox_sit_0.png"))
# Panel 3: Sweet stretch / head turned
frames[3].save(os.path.join(out_dir, "fox_sit_1.png"))

# Also save an animated GIF in scratch for inspection
frames[0].save(
    os.path.join(scratch_dir, "fox_animation_preview.gif"),
    save_all=True,
    append_images=frames[1:],
    duration=600,
    loop=0,
    disposal=2
)

print("Successfully extracted and saved all 4 Fox frames!")
