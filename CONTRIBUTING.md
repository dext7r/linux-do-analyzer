# Contributing to Linux.do Analyzer

🎉 Thank you for your interest in contributing to Linux.do Analyzer! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js ≥18.0.0
- npm ≥8.0.0 (or yarn/pnpm)
- Git
- Modern web browser for testing

### Quick Start

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/linux-do-analyzer.git
   cd linux-do-analyzer
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/dext7r/linux-do-analyzer.git
   ```

## 🛠️ Development Setup

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use Deno
deno task dev
```

### Project Structure

```
linux-do-analyzer/
├── 📄 server.js           # Node.js server
├── 📄 package.json        # NPM configuration
├── 📁 bin/                # CLI executable
├── 📁 js/                 # JavaScript modules
│   ├── app.js             # Main application
│   ├── data-manager.js    # Data storage
│   ├── zip-parser.js      # File parsing
│   ├── data-analyzer.js   # Analysis engine
│   ├── chart-renderer.js  # Visualization
│   └── ui-manager.js      # UI management
├── 📁 css/                # Styles
├── 📁 .github/            # GitHub workflows
└── 📁 scripts/            # Build scripts
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm start               # Start production server
npm run serve           # Start server on port 8080

# Testing
npm test                # Run tests
npm run lint            # Code linting
npm run format          # Code formatting

# Building
npm run build           # Build for production
npm run clean           # Clean cache
```

## 🔧 Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Development Guidelines

- **ES6+ Syntax**: Use modern JavaScript features
- **Modular Design**: Keep functions small and focused
- **Error Handling**: Add proper error handling
- **Comments**: Add JSDoc comments for functions
- **Console**: Avoid console.log in production code

### 3. Testing Your Changes

```bash
# Test CLI functionality
node bin/cli.js --help
node bin/cli.js --version

# Test server
npm start
# Visit http://localhost:8080

# Test with sample data
# Upload a test ZIP file to verify functionality
```

## 📥 Pull Request Process

### 1. Before Submitting

- [ ] Update documentation if needed
- [ ] Add/update tests for new features
- [ ] Ensure all tests pass
- [ ] Follow coding standards
- [ ] Update CHANGELOG.md if applicable

### 2. Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub and click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Should Include**
   - Clear description of changes
   - Issue number (if applicable)
   - Screenshots (for UI changes)
   - Testing instructions

### 3. Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Browser/OS information**
- **Screenshots** if applicable
- **Console errors** if any

### Feature Requests

Use the feature request template and include:

- **Clear description** of the feature
- **Use case** explaining why it's needed
- **Proposed implementation** if you have ideas
- **Alternatives considered**

### Questions

For questions about usage, please:
- Check the README and documentation first
- Search existing issues
- Create a new issue with the "question" label

## 📏 Coding Standards

### JavaScript Style

```javascript
// ✅ Good
function analyzeData(data) {
    if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
    }

    return data
        .filter(item => item.isValid)
        .map(item => processItem(item));
}

// ❌ Avoid
function analyzeData(data){
var result=[];
for(var i=0;i<data.length;i++){
if(data[i].isValid){
result.push(processItem(data[i]));
}
}
return result;
}
```

### File Organization

- **One class per file** when possible
- **Clear naming**: Use descriptive names
- **Consistent exports**: Use ES6 modules
- **Import order**: External libraries first, then local modules

### Error Handling

```javascript
// ✅ Proper error handling
async function parseZipFile(file) {
    try {
        const zip = await JSZip.loadAsync(file);
        return await processZipContents(zip);
    } catch (error) {
        console.error('Failed to parse ZIP file:', error);
        throw new Error(`ZIP parsing failed: ${error.message}`);
    }
}
```

## 🧪 Testing

### Manual Testing

1. **Basic functionality**
   - Upload test ZIP files
   - Verify all chart types render
   - Test responsive design
   - Check error handling

2. **CLI testing**
   - Test all command-line options
   - Verify server startup
   - Test port binding

3. **Cross-browser testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

### Automated Testing

```bash
# Run all tests
npm test

# Test specific functionality
npm run test:cli
npm run test:server
```

## 🚀 Release Process

Releases are automated via GitHub Actions:

1. **Version bump**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Create and push tag**
   ```bash
   git push origin main --tags
   ```

3. **Automated process**
   - GitHub Actions runs tests
   - Publishes to NPM
   - Creates GitHub Release
   - Uploads release assets

## 💡 Tips for Contributors

### First Time Contributors

- Look for issues labeled "good first issue"
- Start with documentation improvements
- Ask questions if anything is unclear

### Regular Contributors

- Consider becoming a maintainer
- Help review other PRs
- Improve CI/CD processes

### Advanced Contributors

- Add new analysis features
- Improve performance
- Enhance security

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Email**: Contact maintainers directly for sensitive issues

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Added to package.json contributors

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Linux.do Analyzer! 🎉