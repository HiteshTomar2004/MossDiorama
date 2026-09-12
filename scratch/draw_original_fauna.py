import os
import math
from PIL import Image, ImageDraw

out_dir = 'e:/Portfolio-Website/public/assets/fauna'
os.makedirs(out_dir, exist_ok=True)
scratch_dir = 'C:/Users/Hitesh/.gemini/antigravity/brain/1236b551-173e-4e3f-8c97-d9f77a2d2075/scratch'

# Helper for supersampled drawing
def create_canvas(w=512, h=512, ss=2):
    im = Image.new('RGBA', (w * ss, h * ss), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    return im, draw, ss

def finalize_and_crop(im, target_w=512, target_h=512, pad_pct=0.05):
    bbox = im.getbbox()
    if not bbox:
        return im.resize((target_w, target_h), Image.LANCZOS)
    cropped = im.crop(bbox)
    cw, ch = cropped.size
    
    # Scale to fit inside target canvas with padding
    avail_w = target_w * (1.0 - pad_pct * 2)
    avail_h = target_h * (1.0 - pad_pct * 2)
    scale = min(avail_w / cw, avail_h / ch)
    
    nw = max(1, int(cw * scale))
    nh = max(1, int(ch * scale))
    resized = cropped.resize((nw, nh), Image.LANCZOS)
    
    out = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    # Place bottom-aligned or centered
    ox = (target_w - nw) // 2
    oy = target_h - nh - int(target_h * pad_pct)
    out.paste(resized, (ox, oy), resized)
    return out

# =====================================================================
# 1. ORIGINAL CURLED FOX (Modeled on User Reference Design)
# =====================================================================
def draw_curled_fox(is_awake=False):
    im, draw, ss = create_canvas(512, 320, ss=2)
    
    # Baseline for ground
    base_y = 280 * ss
    cx = 256 * ss
    
    # Colors
    c_orange = (235, 95, 15, 255)
    c_cream = (252, 242, 222, 255)
    c_paw = (50, 48, 55, 255)
    c_black = (18, 16, 20, 255)
    c_ear_inner = (248, 235, 205, 255)
    c_white = (255, 255, 255, 255)
    
    outline_w = int(6.5 * ss)
    
    # Flat black ground line at bottom
    draw.line([(cx - 210 * ss, base_y), (cx + 210 * ss, base_y)], fill=c_black, width=int(5 * ss))
    
    # 1. Dark Front Paw resting on baseline
    paw_box = [cx - 150 * ss, base_y - 25 * ss, cx - 80 * ss, base_y + 2 * ss]
    draw.ellipse(paw_box, fill=c_paw, outline=c_black, width=int(4 * ss))
    # Paw toes
    draw.line([(cx - 125 * ss, base_y - 18 * ss), (cx - 125 * ss, base_y)], fill=c_black, width=int(3 * ss))
    draw.line([(cx - 105 * ss, base_y - 18 * ss), (cx - 105 * ss, base_y)], fill=c_black, width=int(3 * ss))
    
    # 2. Main Curled Body Arched Shape
    # Big rounded back sweeping from left haunches to right tail curve
    body_pts = []
    # Arched back curve
    for i in range(30):
        t = i / 29.0
        # Parametric arch
        ang = math.pi * (1.0 - t * 0.95)
        bx = cx + math.cos(ang) * 190 * ss + (20 * ss if t > 0.5 else -10 * ss)
        by = base_y - math.sin(ang) * 220 * ss
        body_pts.append((bx, by))
    
    # Tail sweep curving under and up
    body_pts.extend([
        (cx + 195 * ss, base_y - 50 * ss),
        (cx + 175 * ss, base_y),
        (cx + 80 * ss, base_y),
        (cx + 20 * ss, base_y - 80 * ss),
        (cx + 10 * ss, base_y - 160 * ss),
    ])
    
    # Draw body polygon
    draw.polygon(body_pts, fill=c_orange, outline=c_black, width=outline_w)
    
    # Tail separation groove line running along inner curl
    draw.arc([cx + 20 * ss, base_y - 230 * ss, cx + 180 * ss, base_y - 30 * ss], 80, 260, fill=c_black, width=int(5 * ss))
    
    # 3. Head & Snout (resting peacefully on baseline in front of paws)
    # Head diamond wedge
    snout_tip_x = cx + 45 * ss
    snout_tip_y = base_y - 8 * ss
    
    head_top_x = cx - 90 * ss
    head_top_y = base_y - 120 * ss
    
    head_pts = [
        (head_top_x, head_top_y),
        (head_top_x + 85 * ss, head_top_y + 25 * ss),
        (snout_tip_x, snout_tip_y - 8 * ss),
        (snout_tip_x - 15 * ss, snout_tip_y + 6 * ss),
        (snout_tip_x - 55 * ss, base_y),
        (head_top_x - 20 * ss, base_y - 35 * ss)
    ]
    draw.polygon(head_pts, fill=c_orange, outline=c_black, width=outline_w)
    
    # Cream under-muzzle & cheek
    cream_pts = [
        (head_top_x - 15 * ss, base_y - 30 * ss),
        (snout_tip_x - 50 * ss, base_y),
        (snout_tip_x - 15 * ss, snout_tip_y + 6 * ss),
        (snout_tip_x - 20 * ss, snout_tip_y - 4 * ss),
        (cx - 30 * ss, base_y - 35 * ss),
        (head_top_x + 20 * ss, base_y - 45 * ss),
    ]
    draw.polygon(cream_pts, fill=c_cream, outline=c_black, width=int(4.5 * ss))
    
    # Black nose tip
    nose_pts = [
        (snout_tip_x - 20 * ss, snout_tip_y - 10 * ss),
        (snout_tip_x, snout_tip_y - 8 * ss),
        (snout_tip_x - 15 * ss, snout_tip_y + 6 * ss)
    ]
    draw.polygon(nose_pts, fill=c_black)
    
    # 4. Triangular Ears
    # Left Ear (back)
    ear_l = [
        (head_top_x - 10 * ss, head_top_y + 15 * ss),
        (head_top_x - 15 * ss, head_top_y - 85 * ss),
        (head_top_x + 35 * ss, head_top_y - 20 * ss)
    ]
    draw.polygon(ear_l, fill=c_orange, outline=c_black, width=outline_w)
    # Inner ear cream
    draw.polygon([
        (head_top_x - 5 * ss, head_top_y + 5 * ss),
        (head_top_x - 10 * ss, head_top_y - 65 * ss),
        (head_top_x + 25 * ss, head_top_y - 20 * ss)
    ], fill=c_ear_inner)
    
    # Right Ear (front)
    ear_r = [
        (head_top_x + 45 * ss, head_top_y + 20 * ss),
        (head_top_x + 65 * ss, head_top_y - 75 * ss),
        (head_top_x + 85 * ss, head_top_y + 25 * ss)
    ]
    draw.polygon(ear_r, fill=c_orange, outline=c_black, width=outline_w)
    draw.polygon([
        (head_top_x + 52 * ss, head_top_y + 15 * ss),
        (head_top_x + 65 * ss, head_top_y - 55 * ss),
        (head_top_x + 78 * ss, head_top_y + 18 * ss)
    ], fill=c_ear_inner)
    
    # 5. Eyes (Sleeping vs Awake!)
    eye_cx = cx - 40 * ss
    eye_cy = base_y - 55 * ss
    
    if not is_awake:
        # Sleeping curved closed eye line (peaceful curve)
        draw.arc([eye_cx - 24 * ss, eye_cy - 16 * ss, eye_cx + 16 * ss, eye_cy + 16 * ss], 25, 175, fill=c_black, width=int(6.5 * ss))
        # Second eyelid crease
        draw.line([(cx - 10 * ss, eye_cy - 8 * ss), (cx - 5 * ss, eye_cy + 15 * ss)], fill=c_black, width=int(5.5 * ss))
        
        # Floating cute white sleep "z" mark above back!
        zx = cx - 140 * ss
        zy = base_y - 220 * ss
        z_pts = [
            (zx - 8 * ss, zy - 12 * ss),
            (zx + 8 * ss, zy - 12 * ss),
            (zx - 8 * ss, zy + 12 * ss),
            (zx + 8 * ss, zy + 12 * ss)
        ]
        draw.line(z_pts[:2], fill=c_white, width=int(5 * ss))
        draw.line(z_pts[1:3], fill=c_white, width=int(5 * ss))
        draw.line(z_pts[2:], fill=c_white, width=int(5 * ss))
    else:
        # Awake! Big cartoon white eye with focused black pupil looking at cat!
        eye_r = 19 * ss
        draw.ellipse([eye_cx - eye_r, eye_cy - eye_r * 1.15, eye_cx + eye_r, eye_cy + eye_r * 1.15], fill=c_white, outline=c_black, width=int(5 * ss))
        # Black pupil
        draw.ellipse([eye_cx - 4 * ss, eye_cy - eye_r * 0.7, eye_cx + 12 * ss, eye_cy + eye_r * 0.7], fill=c_black)
        # Specular white dot shine
        draw.ellipse([eye_cx + 1 * ss, eye_cy - 10 * ss, eye_cx + 7 * ss, eye_cy - 3 * ss], fill=c_white)
        # Eyebrow furrow
        draw.line([(cx - 12 * ss, eye_cy - 12 * ss), (cx - 6 * ss, eye_cy + 12 * ss)], fill=c_black, width=int(5.5 * ss))
    
    return finalize_and_crop(im, 512, 320)

# =====================================================================
# 2. ORIGINAL WAYFINDER-STYLE BIRDS (Low-Frame Songbird)
# =====================================================================
def draw_songbird(frame_type='perch'): # 'perch', 'alert', 'fly_up', 'fly_down'
    im, draw, ss = create_canvas(256, 256, ss=2)
    
    cx = 128 * ss
    cy = 135 * ss
    
    c_orange = (235, 95, 20, 255)     # Warm robin breast
    c_brown = (75, 70, 75, 255)       # Charcoal slate back & wing
    c_cream = (252, 245, 230, 255)    # Pale chin/belly
    c_beak = (245, 158, 11, 255)      # Golden beak
    c_black = (18, 16, 20, 255)
    c_white = (255, 255, 255, 255)
    outline_w = int(5 * ss)
    
    if frame_type in ('perch', 'alert'):
        # Head angle: level or tilted
        tilt_y = -6 * ss if frame_type == 'alert' else 0
        
        # Tail feathers pointing down-left
        tail_pts = [
            (cx - 35 * ss, cy + 25 * ss),
            (cx - 75 * ss, cy + 65 * ss),
            (cx - 60 * ss, cy + 70 * ss),
            (cx - 25 * ss, cy + 35 * ss)
        ]
        draw.polygon(tail_pts, fill=c_brown, outline=c_black, width=outline_w)
        
        # Chubby Oval Body
        body_box = [cx - 42 * ss, cy - 35 * ss, cx + 38 * ss, cy + 45 * ss]
        draw.ellipse(body_box, fill=c_orange, outline=c_black, width=outline_w)
        
        # Cream under-breast
        draw.chord([cx - 20 * ss, cy - 5 * ss, cx + 35 * ss, cy + 42 * ss], 330, 150, fill=c_cream)
        
        # Folded Wing on flank
        wing_pts = [
            (cx - 28 * ss, cy - 15 * ss),
            (cx + 8 * ss, cy - 12 * ss),
            (cx - 5 * ss, cy + 35 * ss),
            (cx - 45 * ss, cy + 38 * ss)
        ]
        draw.polygon(wing_pts, fill=c_brown, outline=c_black, width=outline_w)
        
        # Head
        hx = cx + 18 * ss
        hy = cy - 35 * ss + tilt_y
        draw.ellipse([hx - 26 * ss, hy - 26 * ss, hx + 26 * ss, hy + 26 * ss], fill=c_orange, outline=c_black, width=outline_w)
        
        # Beak (sharp cute triangle)
        beak_pts = [
            (hx + 22 * ss, hy - 6 * ss),
            (hx + 42 * ss, hy + 2 * ss),
            (hx + 22 * ss, hy + 8 * ss)
        ]
        draw.polygon(beak_pts, fill=c_beak, outline=c_black, width=outline_w)
        
        # Big Round Cartoon Eye
        ex = hx + 8 * ss
        ey = hy - 4 * ss
        draw.ellipse([ex - 9 * ss, ey - 9 * ss, ex + 9 * ss, ey + 9 * ss], fill=c_black)
        draw.ellipse([ex - 4 * ss, ey - 6 * ss, ex + 1 * ss, ey - 1 * ss], fill=c_white) # Shine
        
        # Feet clutching perch
        draw.line([(cx - 8 * ss, cy + 45 * ss), (cx - 8 * ss, cy + 58 * ss)], fill=c_black, width=int(4 * ss))
        draw.line([(cx + 12 * ss, cy + 45 * ss), (cx + 12 * ss, cy + 58 * ss)], fill=c_black, width=int(4 * ss))
        
    elif frame_type == 'fly_up':
        # Flapping wings UP
        # Body
        draw.ellipse([cx - 30 * ss, cy - 25 * ss, cx + 30 * ss, cy + 35 * ss], fill=c_orange, outline=c_black, width=outline_w)
        
        # Wings Spread High
        wing_l = [(cx - 15 * ss, cy - 10 * ss), (cx - 75 * ss, cy - 70 * ss), (cx - 45 * ss, cy - 20 * ss)]
        draw.polygon(wing_l, fill=c_brown, outline=c_black, width=outline_w)
        wing_r = [(cx + 15 * ss, cy - 10 * ss), (cx + 75 * ss, cy - 70 * ss), (cx + 45 * ss, cy - 20 * ss)]
        draw.polygon(wing_r, fill=c_brown, outline=c_black, width=outline_w)
        
        # Head & Beak
        draw.ellipse([cx + 10 * ss, cy - 40 * ss, cx + 45 * ss, cy - 5 * ss], fill=c_orange, outline=c_black, width=outline_w)
        draw.polygon([(cx + 42 * ss, cy - 26 * ss), (cx + 58 * ss, cy - 20 * ss), (cx + 42 * ss, cy - 14 * ss)], fill=c_beak, outline=c_black, width=outline_w)
        draw.ellipse([cx + 28 * ss, cy - 26 * ss, cx + 38 * ss, cy - 16 * ss], fill=c_black)
        
    elif frame_type == 'fly_down':
        # Flapping wings DOWN
        draw.ellipse([cx - 30 * ss, cy - 25 * ss, cx + 30 * ss, cy + 35 * ss], fill=c_orange, outline=c_black, width=outline_w)
        
        # Wings Spread Low
        wing_l = [(cx - 15 * ss, cy - 5 * ss), (cx - 75 * ss, cy + 40 * ss), (cx - 45 * ss, cy + 5 * ss)]
        draw.polygon(wing_l, fill=c_brown, outline=c_black, width=outline_w)
        wing_r = [(cx + 15 * ss, cy - 5 * ss), (cx + 75 * ss, cy + 40 * ss), (cx + 45 * ss, cy + 5 * ss)]
        draw.polygon(wing_r, fill=c_brown, outline=c_black, width=outline_w)
        
        # Head & Beak
        draw.ellipse([cx + 10 * ss, cy - 40 * ss, cx + 45 * ss, cy - 5 * ss], fill=c_orange, outline=c_black, width=outline_w)
        draw.polygon([(cx + 42 * ss, cy - 26 * ss), (cx + 58 * ss, cy - 20 * ss), (cx + 42 * ss, cy - 14 * ss)], fill=c_beak, outline=c_black, width=outline_w)
        draw.ellipse([cx + 28 * ss, cy - 26 * ss, cx + 38 * ss, cy - 16 * ss], fill=c_black)

    return finalize_and_crop(im, 256, 256)

# =====================================================================
# RENDER ALL ORIGINAL ASSETS
# =====================================================================
print("Rendering Original Graphic Storybook Fauna...")

# 1. Foxes
fox_sleep = draw_curled_fox(is_awake=False)
fox_sleep.save(os.path.join(out_dir, "fox_sleep_0.png"))
fox_sleep.save(os.path.join(out_dir, "fox_sleep_1.png"))

fox_awake = draw_curled_fox(is_awake=True)
fox_awake.save(os.path.join(out_dir, "fox_sit_0.png"))
fox_awake.save(os.path.join(out_dir, "fox_sit_1.png"))
print("Saved fox_sleep and fox_sit frames.")

# 2. Birds (Low Frame Wayfinder Robin)
b_perch = draw_songbird('perch')
b_perch.save(os.path.join(out_dir, "parrot_0.png"))

b_alert = draw_songbird('alert')
b_alert.save(os.path.join(out_dir, "parrot_1.png"))

b_fly_up = draw_songbird('fly_up')
b_fly_up.save(os.path.join(out_dir, "parrot_2.png"))

b_fly_down = draw_songbird('fly_down')
b_fly_down.save(os.path.join(out_dir, "parrot_3.png"))
print("Saved bird frames (parrot_0, 1, 2, 3).")

print("ALL ORIGINAL ASSETS GENERATED!")
