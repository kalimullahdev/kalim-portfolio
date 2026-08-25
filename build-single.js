const fs = require('fs');
const path = require('path');

const root = __dirname;

// 1. Read index.html
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 2. Inline CSS
const cssFiles = [
  'css/variables.css',
  'css/main.css',
  'css/components.css',
  'css/responsive.css'
];

let combinedCss = '';
cssFiles.forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    combinedCss += `\n/* ===== ${f} ===== */\n` + fs.readFileSync(p, 'utf8');
  }
});

// Remove existing CSS link tags
html = html.replace(/<link\s+rel="stylesheet"\s+href="css\/[^"]+"\s*>/g, '');
// Inject style block before </head>
html = html.replace('</head>', `<style>\n${combinedCss}\n</style>\n</head>`);

// 3. Convert all images to Base64
const imageMap = {};
const imgDir = path.join(root, 'assets/images');
if (fs.existsSync(imgDir)) {
  fs.readdirSync(imgDir).forEach(file => {
    const filePath = path.join(imgDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      let mime = 'image/jpeg';
      if (ext === '.png') mime = 'image/png';
      else if (ext === '.svg') mime = 'image/svg+xml';
      else if (ext === '.webp') mime = 'image/webp';
      
      const b64 = fs.readFileSync(filePath).toString('base64');
      const dataUri = `data:${mime};base64,${b64}`;
      imageMap[`assets/images/${file}`] = dataUri;
    }
  });
}

// 4. Inline JS Files in correct dependency order
const jsFiles = [
  'js/data.js',
  'js/sound.js',
  'js/canvas.js',
  'js/terminal.js',
  'js/command-palette.js',
  'js/app.js'
];

let combinedJs = '';
jsFiles.forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Replace image paths in JS with base64
    Object.keys(imageMap).forEach(imgPath => {
      content = content.split(imgPath).join(imageMap[imgPath]);
    });
    combinedJs += `\n/* ===== ${f} ===== */\n` + content;
  }
});

// Remove existing script tags for local JS
html = html.replace(/<script\s+src="js\/[^"]+"><\/script>/g, '');

// Replace image paths in HTML with base64
Object.keys(imageMap).forEach(imgPath => {
  html = html.split(imgPath).join(imageMap[imgPath]);
});

// Inject combined script before </body>
html = html.replace('</body>', `<script>\n${combinedJs}\n</script>\n</body>`);

// Write out standalone HTML
const outputPath = path.join(root, 'kalim-portfolio-single.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`[SUCCESS] Generated self-contained bundle: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
