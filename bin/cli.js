#!/usr/bin/env node

import { LinuxDoAnalyzerServer } from '../server.js';

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        } else if (arg === '--version' || arg === '-v') {
            showVersion();
            process.exit(0);
        } else if (arg.startsWith('--port=')) {
            options.port = parseInt(arg.split('=')[1]);
        } else if (arg === '--dev') {
            options.dev = true;
        } else if (arg.startsWith('--port') && args[i + 1]) {
            options.port = parseInt(args[i + 1]);
            i++;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
Linux.do Analyzer CLI

Usage: linux-do-analyzer [options]

Options:
  --port <number>    Port to run the server on (default: 8080)
  --dev              Enable development mode
  -h, --help         Show this help message
  -v, --version      Show version number

Examples:
  linux-do-analyzer                  # Start server on port 8080
  linux-do-analyzer --port 3000     # Start server on port 3000
  linux-do-analyzer --dev           # Start in development mode
`);
}

async function showVersion() {
    try {
        const { readFile } = await import('fs/promises');
        const { join, dirname } = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const packagePath = join(__dirname, '..', 'package.json');

        const packageContent = await readFile(packagePath, 'utf-8');
        const packageData = JSON.parse(packageContent);
        console.log(packageData.version);
    } catch (error) {
        console.log('2.0.0');
    }
}

async function main() {
    try {
        const options = parseArgs();
        const server = new LinuxDoAnalyzerServer(options);
        await server.start();
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

main();