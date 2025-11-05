# Adding Your University Logo

## Quick Method (Direct Upload)

1. Save your university logo (the black with transparent background image you have) to the `images/` folder as `muegyetem.png`

2. Since it has a transparent background, you can use it directly with color tinting. In `terminal-sketch.js`, change:
   ```javascript
   const LOGO_PATH = 'images/lumon.png';
   ```
   to:
   ```javascript
   const LOGO_PATH = 'images/muegyetem.png';
   ```

3. The p5.js `tint()` function will automatically apply the cyan color to your black logo!

## Better Method (With CRT Processing)

For the best results that truly match the aesthetic:

1. **Install Python dependencies** (if you don't have them):
   ```bash
   pip install pillow numpy
   ```

2. **Save your logo** to the root directory as `muegyetem.png`

3. **Process the image**:
   ```bash
   python tools/image_processor.py muegyetem.png -o images/muegyetem-crt.png
   ```

4. **Update the code** in `terminal-sketch.js`:
   ```javascript
   const LOGO_PATH = 'images/muegyetem-crt.png';
   ```

5. **Commit and push**:
   ```bash
   git add images/muegyetem-crt.png terminal-sketch.js
   git commit -m "Add university logo"
   git push
   ```

## What the Image Processor Does

The Python tool will:
- ✓ Convert black areas to the exact cyan/teal color (#ABFFE9)
- ✓ Add a subtle CRT glow effect
- ✓ Apply authentic scanlines
- ✓ Preserve transparency
- ✓ Enhance contrast for better visibility

## Adjusting Logo Size

If the logo appears too large or small, you can:

1. Use the `-s` scale option when processing:
   ```bash
   python tools/image_processor.py muegyetem.png -o images/muegyetem-crt.png -s 0.8
   ```

2. Or resize it in the code (in `terminal-sketch.js`, find where the logo is drawn and add):
   ```javascript
   // Before drawing the logo
   lumon.resize(200, 0); // Resize to 200px width, auto height
   ```

## Alternative: Use Online Tool

If you don't want to use Python, you can:
1. Upload your logo to an online image editor like Photoshop or GIMP
2. Change the black color to #ABFFE9 (cyan)
3. Add a slight outer glow effect (cyan, 5px blur)
4. Export as PNG with transparency
5. Save to `images/` folder and update the path

Your university logo will look great with the CRT aesthetic! 🎓
