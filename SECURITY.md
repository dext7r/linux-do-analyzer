# Security Policy

## 🔒 Security Principles

Linux.do Analyzer is designed with security and privacy as top priorities. This document outlines our security practices and how to report security issues.

## 🛡️ Security Features

### Privacy Protection
- **100% Client-Side Processing**: All data analysis occurs in the browser
- **No Data Upload**: Files are never transmitted to external servers
- **Local Storage Only**: Data is stored locally using IndexedDB
- **No Tracking**: No analytics or tracking scripts are included
- **Open Source**: All code is publicly auditable

### Data Security
- **File Validation**: Strict validation of uploaded ZIP files
- **Size Limits**: 10MB maximum file size to prevent DoS
- **Type Checking**: Only accepts .zip files
- **Memory Management**: Efficient cleanup of processed data
- **Sandboxed Processing**: Browser security sandbox protects system

### Application Security
- **Input Sanitization**: All user inputs are properly sanitized
- **XSS Prevention**: Content Security Policy and input validation
- **Path Traversal Protection**: Prevents directory traversal attacks
- **Error Handling**: Secure error messages without sensitive information

## 🔍 Supported Versions

Security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Active support  |
| 1.9.x   | ⚠️ Security fixes only |
| < 1.9   | ❌ No longer supported |

## 📢 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**For Security Issues (Non-Public):**
- Email: h7ml@qq.com
- Subject: [SECURITY] Linux.do Analyzer Vulnerability Report
- Include: Detailed description, steps to reproduce, impact assessment

**For General Issues:**
- GitHub Issues: https://github.com/dext7r/linux-do-analyzer/issues
- Use the "security" label

### What to Include

Please provide the following information:
- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** and affected versions
- **Proof of concept** (if applicable)
- **Suggested fix** (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 1 week
- **Fix Development**: 2-4 weeks (depending on severity)
- **Release**: Coordinated disclosure after fix is ready

### Security Update Process

1. **Assessment**: Evaluate severity and impact
2. **Development**: Create and test security fix
3. **Testing**: Verify fix doesn't break functionality
4. **Release**: Publish security update
5. **Disclosure**: Public disclosure after users have time to update

## ⚠️ Security Considerations

### For Users

**Safe Usage:**
- Only upload your own Linux.do data exports
- Use the latest version of the application
- Keep your browser updated
- Verify the authentic domain when using online version

**What We Don't Access:**
- Your uploaded files
- Your analysis results
- Your browsing behavior
- Any personal information

### For Developers

**Code Security:**
- Use `npm audit` to check dependencies
- Validate all inputs and file contents
- Sanitize any dynamic content
- Follow secure coding practices
- Regular security reviews

**Deployment Security:**
- HTTPS enforcement for online deployments
- Content Security Policy headers
- Secure cookie configuration
- Regular dependency updates

## 🔐 Technical Security Details

### Client-Side Security

```javascript
// Example: File validation
function validateZipFile(file) {
    // Check file type
    if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
        throw new Error('Invalid file type');
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large');
    }

    return true;
}
```

### Server-Side Security (for self-hosted)

```javascript
// Example: Path traversal prevention
function sanitizePath(userPath) {
    const path = require('path');
    return path.resolve('/', userPath).substring(1);
}
```

## 🚨 Known Security Limitations

### Browser Dependencies
- Security depends on browser's security features
- JavaScript execution environment is trusted
- Local storage is accessible to other scripts (if any)

### Network Security
- Self-hosted deployments require proper HTTPS configuration
- CDN dependencies should be from trusted sources

## 📋 Security Checklist

### For Contributors
- [ ] Run `npm audit` before submitting PRs
- [ ] Validate all user inputs
- [ ] Test with malicious file uploads
- [ ] Review dependencies for known vulnerabilities
- [ ] Follow secure coding guidelines

### For Deployers
- [ ] Enable HTTPS
- [ ] Configure Content Security Policy
- [ ] Regular security updates
- [ ] Monitor for security advisories
- [ ] Backup and recovery procedures

## 🔄 Security Updates

Subscribe to security updates:
- **GitHub Releases**: Watch repository for releases
- **NPM Security Advisories**: `npm audit` notifications
- **Email Notifications**: Repository security alerts

## 📚 Additional Resources

### Security Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Browser Security](https://developer.mozilla.org/en-US/docs/Web/Security)

### Privacy Resources
- [Privacy by Design](https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf)
- [GDPR Compliance](https://gdpr.eu/)
- [Data Minimization](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/principles/data-minimisation/)

## 🤝 Responsible Disclosure

We believe in responsible disclosure and will:
- Work with security researchers to understand issues
- Provide credit for valid security reports
- Coordinate disclosure timelines
- Maintain transparency about security practices

## ⚖️ Legal

This security policy does not create any legal obligations. Security reports are handled on a best-effort basis.

---

**Last Updated**: 2025-09-28
**Version**: 2.0.0