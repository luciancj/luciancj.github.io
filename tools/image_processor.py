#!/usr/bin/env python3
"""
CRT Style Image Processor
Converts images to match the Macrodata Refinement aesthetic
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import argparse
import os

# Color palettes from the game
MOBILE_PALETTE = {
    'bg': (1, 10, 19),      # #010A13
    'fg': (171, 255, 233),   # #ABFFE9
    'select': (238, 255, 255) # #EEFFFF
}

SHADER_PALETTE = {
    'bg': (17, 17, 17),      # #111111
    'fg': (153, 153, 255),   # #99f
    'select': (255, 255, 255) # #fff
}

def rgb_distance(c1, c2):
    """Calculate Euclidean distance between two RGB colors"""
    return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

def process_image(input_path, output_path, palette='mobile', add_scanlines=True, 
                  add_glow=True, scale=1.0, transparent_bg=True):
    """
    Process an image to match the CRT aesthetic
    
    Args:
        input_path: Path to input image
        output_path: Path to save processed image
        palette: 'mobile' or 'shader' color palette
        add_scanlines: Add horizontal scanline effect
        add_glow: Add glow/bloom effect
        scale: Scale factor for output
        transparent_bg: Keep background transparent
    """
    
    # Load image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Scale if needed
    if scale != 1.0:
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Get palette colors
    colors = MOBILE_PALETTE if palette == 'mobile' else SHADER_PALETTE
    fg_color = colors['fg']
    bg_color = colors['bg']
    
    # Convert image data
    data = np.array(img)
    
    # Create new image
    result = Image.new('RGBA', img.size, (0, 0, 0, 0))
    result_data = np.array(result)
    
    # Process each pixel
    for y in range(data.shape[0]):
        for x in range(data.shape[1]):
            r, g, b, a = data[y, x]
            
            # Skip fully transparent pixels
            if a == 0:
                continue
            
            # Calculate brightness (inverted - darker pixels become brighter)
            brightness = (r + g + b) / 3 / 255.0
            inverted_brightness = 1.0 - brightness  # Invert: black becomes white
            
            # Apply foreground color to ALL non-transparent pixels (keep all details)
            # Apply the cyan/green color to the inverted brightness
            new_r = int(fg_color[0] * inverted_brightness)
            new_g = int(fg_color[1] * inverted_brightness)
            new_b = int(fg_color[2] * inverted_brightness)
            # Keep original alpha to preserve all details
            result_data[y, x] = [new_r, new_g, new_b, a]
    
    result = Image.fromarray(result_data)
    
    # Add glow effect
    if add_glow:
        # Create a blurred version for the glow
        glow = result.copy()
        glow = glow.filter(ImageFilter.GaussianBlur(radius=5))
        
        # Composite glow behind the original
        glowed = Image.new('RGBA', result.size, (0, 0, 0, 0))
        glowed = Image.alpha_composite(glowed, glow)
        glowed = Image.alpha_composite(glowed, result)
        result = glowed
    
    # Add scanlines
    if add_scanlines:
        scanline_img = Image.new('RGBA', result.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(scanline_img)
        
        # Draw every other line
        for y in range(0, result.height, 2):
            draw.line([(0, y), (result.width, y)], fill=(0, 0, 0, 40))
        
        result = Image.alpha_composite(result, scanline_img)
    
    # Enhance contrast slightly
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.2)
    
    # Save result
    result.save(output_path, 'PNG')
    print(f"✓ Processed image saved to: {output_path}")
    print(f"  Size: {result.width}x{result.height}")
    print(f"  Palette: {palette}")
    print(f"  Effects: Scanlines={add_scanlines}, Glow={add_glow}")

def batch_process(input_dir, output_dir, **kwargs):
    """Process all images in a directory"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    
    for filename in os.listdir(input_dir):
        if any(filename.lower().endswith(ext) for ext in image_extensions):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, f"crt_{filename}")
            
            print(f"\nProcessing: {filename}")
            process_image(input_path, output_path, **kwargs)

def main():
    parser = argparse.ArgumentParser(
        description='Convert images to match Macrodata Refinement CRT aesthetic'
    )
    parser.add_argument('input', help='Input image file or directory')
    parser.add_argument('-o', '--output', help='Output file or directory')
    parser.add_argument('-p', '--palette', choices=['mobile', 'shader'], 
                       default='mobile', help='Color palette to use')
    parser.add_argument('--no-scanlines', action='store_true', 
                       help='Disable scanline effect')
    parser.add_argument('--no-glow', action='store_true', 
                       help='Disable glow effect')
    parser.add_argument('-s', '--scale', type=float, default=1.0,
                       help='Scale factor (e.g., 0.5 for half size)')
    parser.add_argument('--solid-bg', action='store_true',
                       help='Use solid background instead of transparent')
    parser.add_argument('--batch', action='store_true',
                       help='Process all images in input directory')
    
    args = parser.parse_args()
    
    # Determine output path
    if args.output:
        output = args.output
    elif args.batch:
        output = args.input + '_processed'
    else:
        name, ext = os.path.splitext(args.input)
        output = f"{name}_crt{ext}"
    
    # Process
    if args.batch:
        batch_process(
            args.input, output,
            palette=args.palette,
            add_scanlines=not args.no_scanlines,
            add_glow=not args.no_glow,
            scale=args.scale,
            transparent_bg=not args.solid_bg
        )
    else:
        process_image(
            args.input, output,
            palette=args.palette,
            add_scanlines=not args.no_scanlines,
            add_glow=not args.no_glow,
            scale=args.scale,
            transparent_bg=not args.solid_bg
        )

if __name__ == '__main__':
    main()
