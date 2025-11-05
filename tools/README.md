# CRT Image Processor

Tool to convert images to match the Macrodata Refinement aesthetic.

## Installation

```bash
pip install pillow numpy
```

## Usage

### Process a single image:
```bash
python tools/image_processor.py your-logo.png
```

This will create `your-logo_crt.png` with the CRT effect applied.

### Custom output path:
```bash
python tools/image_processor.py your-logo.png -o images/logo-crt.png
```

### Options:

- `-p, --palette` - Choose palette: `mobile` (cyan) or `shader` (blue)
- `-s, --scale` - Scale the image (e.g., `-s 0.5` for half size)
- `--no-scanlines` - Disable scanline effect
- `--no-glow` - Disable glow effect
- `--solid-bg` - Use solid background instead of transparent
- `--batch` - Process all images in a directory

### Examples:

```bash
# Process with shader palette (blue tint)
python tools/image_processor.py logo.png -p shader

# Process and scale to 50% size
python tools/image_processor.py logo.png -s 0.5

# Process all images in a folder
python tools/image_processor.py images/ --batch
```

## Quick Start for University Logo

1. Save your university logo as `muegyetem.png` in the root directory
2. Run:
```bash
python tools/image_processor.py muegyetem.png -o images/muegyetem-crt.png
```
3. The processed logo will be saved in the `images/` folder

The tool will:
- Convert black areas to the cyan/teal color (#ABFFE9)
- Add a subtle glow effect
- Apply CRT-style scanlines
- Keep the transparent background
