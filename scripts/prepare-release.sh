#!/bin/bash

# Release Assets Preparation Script
# This script prepares all necessary files for GitHub Release

set -e

VERSION=$(node -p "require('./package.json').version")
RELEASE_DIR="release-assets"

echo "🚀 Preparing release assets for version $VERSION..."

# Clean and create release directory
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

echo "📦 1. Creating NPM package..."
npm pack
mv linux-do-analyzer-*.tgz "$RELEASE_DIR/linux-do-analyzer-$VERSION.tgz"

echo "🌐 2. Creating standalone web application..."
mkdir -p standalone

# Copy essential web files
cp index.html standalone/
cp about.html standalone/ 2>/dev/null || echo "  ⚠️  about.html not found, skipping..."
cp help.html standalone/ 2>/dev/null || echo "  ⚠️  help.html not found, skipping..."
cp faq.html standalone/ 2>/dev/null || echo "  ⚠️  faq.html not found, skipping..."
cp privacy.html standalone/ 2>/dev/null || echo "  ⚠️  privacy.html not found, skipping..."

# Copy directories
cp -r js/ standalone/ 2>/dev/null || echo "  ⚠️  js/ directory not found, skipping..."
cp -r css/ standalone/ 2>/dev/null || echo "  ⚠️  css/ directory not found, skipping..."

# Copy metadata files
cp package.json standalone/
cp README.md standalone/
cp LICENSE standalone/ 2>/dev/null || echo "  ⚠️  LICENSE not found, skipping..."

# Create deployment instructions
cat > standalone/DEPLOYMENT.md << 'EOF'
# Standalone Deployment Guide

This package contains all files needed to deploy Linux.do Analyzer as a static website.

## Quick Start

1. Extract this archive to your web server directory
2. Serve the files using any static web server
3. Access `index.html` in your browser

## Deployment Options

### Static Hosting Services
- **GitHub Pages**: Upload files to your repository
- **Vercel**: Connect your repository for automatic deployment
- **Netlify**: Drag and drop this folder to Netlify
- **Cloudflare Pages**: Connect repository or upload files

### Local Development
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve -p 8080

# Using PHP
php -S localhost:8080
```

### Web Server Configuration

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/extracted/files;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/extracted/files
    DirectoryIndex index.html

    <Directory /path/to/extracted/files>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Requirements

- Any modern web browser
- Static web server (for local development)
- No server-side processing required

## Features

- ✅ 100% client-side processing
- ✅ No database required
- ✅ Privacy-first design
- ✅ Works offline after initial load
- ✅ Responsive design for mobile/desktop

For more information, visit: https://github.com/dext7r/linux-do-analyzer
EOF

# Create standalone archive
cd standalone
zip -r "../$RELEASE_DIR/linux-do-analyzer-standalone.zip" . -x "*.DS_Store" "*/.*"
cd ..

echo "📚 3. Creating documentation package..."
mkdir -p docs
cp README.md docs/
cp package.json docs/
cp LICENSE docs/ 2>/dev/null || echo "  ⚠️  LICENSE not found, creating placeholder..."
if [ ! -f docs/LICENSE ]; then
    echo "MIT License - See repository for full text" > docs/LICENSE
fi

# Copy GitHub workflows if they exist
if [ -d ".github" ]; then
    cp -r .github/ docs/
fi

# Create comprehensive documentation
cat > docs/INSTALLATION.md << 'EOF'
# Installation Guide

## NPM Installation

### Global Installation
```bash
npm install -g linux-do-analyzer
linux-do-analyzer
```

### Using NPX (No Installation)
```bash
npx linux-do-analyzer
```

### Using PNPX
```bash
pnpx linux-do-analyzer
```

## Local Development

### Clone Repository
```bash
git clone https://github.com/dext7r/linux-do-analyzer.git
cd linux-do-analyzer
```

### Using Node.js
```bash
npm install
npm start
```

### Using Deno
```bash
deno task serve
```

## CLI Usage

```bash
# Start server (default port 8080)
linux-do-analyzer

# Specify port
linux-do-analyzer --port 3000

# Development mode
linux-do-analyzer --dev

# Show help
linux-do-analyzer --help

# Show version
linux-do-analyzer --version
```

## Online Usage

Visit: https://linux-do-analyzer.jhun.edu.kg/

No installation required!
EOF

zip -r "$RELEASE_DIR/linux-do-analyzer-docs.zip" docs/ -x "*.DS_Store" "*/.*"

echo "💻 4. Creating CLI binary package..."
mkdir -p cli-package
cp server.js cli-package/
cp -r bin/ cli-package/
cp package.json cli-package/
cp README.md cli-package/

cat > cli-package/install.sh << 'EOF'
#!/bin/bash
echo "Installing Linux.do Analyzer CLI..."
npm install -g .
echo "✅ Installation complete!"
echo "Run 'linux-do-analyzer --help' to get started."
EOF

chmod +x cli-package/install.sh

cat > cli-package/install.bat << 'EOF'
@echo off
echo Installing Linux.do Analyzer CLI...
npm install -g .
echo Installation complete!
echo Run 'linux-do-analyzer --help' to get started.
pause
EOF

zip -r "$RELEASE_DIR/linux-do-analyzer-cli.zip" cli-package/ -x "*.DS_Store" "*/.*"

echo "📋 5. Creating checksums..."
cd "$RELEASE_DIR"
sha256sum *.tgz *.zip > checksums.txt
cd ..

echo "🎯 6. Generating release notes..."
cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# Linux.do Analyzer v$VERSION

## 🚀 What's New

This release includes the complete Linux.do forum data analysis tool with enhanced features and improved performance.

## 📦 Installation Options

### NPM Package
\`\`\`bash
npm install -g linux-do-analyzer
\`\`\`

### Standalone Web Application
Download \`linux-do-analyzer-standalone.zip\` and deploy to any static hosting service.

### CLI Tool
Download \`linux-do-analyzer-cli.zip\` for command-line usage.

## 🌐 Online Usage

Try it online without installation: [https://linux-do-analyzer.jhun.edu.kg/](https://linux-do-analyzer.jhun.edu.kg/)

## 📋 Release Assets

- **linux-do-analyzer-$VERSION.tgz** - NPM package for Node.js environments
- **linux-do-analyzer-standalone.zip** - Complete web application for static hosting
- **linux-do-analyzer-docs.zip** - Complete documentation and installation guides
- **linux-do-analyzer-cli.zip** - CLI tool package with installers
- **checksums.txt** - SHA256 checksums for all assets

## ✨ Features

- 🔒 **Privacy First** - 100% client-side processing
- 📊 **Rich Analytics** - Comprehensive data visualization
- 🎨 **Modern UI** - Responsive design with dark theme
- 🚀 **Multiple Deployment Options** - NPM, standalone, or online
- 📱 **Mobile Friendly** - Works perfectly on all devices

## 🛠️ Technical Details

- **Node.js**: ≥18.0.0 required
- **Browser Support**: Modern browsers (ES6+)
- **Dependencies**: Zero runtime dependencies for web version
- **Package Size**: ~$(du -sh linux-do-analyzer-$VERSION.tgz | cut -f1)

## 🔧 Verification

Verify package integrity using checksums:
\`\`\`bash
sha256sum -c checksums.txt
\`\`\`

For support and issues, visit: https://github.com/dext7r/linux-do-analyzer/issues
EOF

echo "✅ Release assets preparation complete!"
echo ""
echo "📊 Summary:"
echo "   Release directory: $RELEASE_DIR/"
echo "   Package version: $VERSION"
echo ""
echo "📦 Created assets:"
ls -la "$RELEASE_DIR/"

# Cleanup
rm -rf standalone docs cli-package

echo ""
echo "🎉 All release assets are ready in the '$RELEASE_DIR' directory!"
echo "   You can now create a GitHub release and upload these files."