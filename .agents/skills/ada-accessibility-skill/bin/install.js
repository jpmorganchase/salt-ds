#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Enable colors in Windows cmd
if (process.platform === 'win32') {
  process.stdout.write('\x1b[0m'); // Force ANSI support
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const SKILL_NAME = 'ada-accessibility-skill';
const DISPLAY_NAME = 'ADA Accessibility Remediation Skill';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function printBanner() {
  console.log('\n');
  console.log('███████╗██╗  ██╗██╗██╗     ██╗     ███████╗');
  console.log('██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝');
  console.log('███████╗█████╔╝ ██║██║     ██║     ███████╗');
  console.log('╚════██║██╔═██╗ ██║██║     ██║     ╚════██║');
  console.log('███████║██║  ██╗██║███████╗███████╗███████║');
  console.log('╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝');
  console.log('\n');
}

function printSection(symbol, message, color = colors.reset) {
  console.log(`${color}${symbol}  ${message}${colors.reset}`);
}

async function install() {
  printBanner();
  printSection('○', `Skill: ${DISPLAY_NAME}`);
  console.log('|');
  
  // Question 1: Choose agent platform
  printSection('○', 'Select agent platform');
  console.log('|  1. GitHub Copilot / Multi-agent (~/.agents/skills/)');
  console.log('|  2. Claude Code (~/.claude/skills/)');
  console.log('|');
  
  const platformAnswer = await question('   Enter 1 or 2: ');
  const isAgents = platformAnswer.trim() !== '2';
  
  // Question 2: Installation scope
  printSection('○', 'Installation scope');
  console.log('|  1. Global - Available across all projects');
  console.log('|  2. Project - Only this project');
  console.log('|');
  
  const scopeAnswer = await question('   Enter 1 or 2: ');
  const isGlobal = scopeAnswer.trim() !== '2';
  
  const skillsFolder = isAgents ? '.agents' : '.claude';
  const targetBaseDir = isGlobal 
    ? path.join(os.homedir(), skillsFolder, 'skills')
    : path.join(process.cwd(), skillsFolder, 'skills');
  
  const targetDir = path.join(targetBaseDir, SKILL_NAME);
  
  console.log('|');
  printSection('○', isGlobal ? 'Global' : 'Project');
  console.log('|');
  
  // Check for existing installation
  const exists = fs.existsSync(targetDir);
  if (exists) {
    console.log('|');
    printSection('○', `Existing installation found at:`);
    console.log(`|  ${targetDir}`);
    console.log('|');
    
    const overwrite = await question('*  Overwrite existing installation? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('|');
      printSection('×', 'Installation cancelled');
      console.log('\n');
      rl.close();
      return;
    }
  }
  
  // Create directory structure
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.error(`\n❌ Failed to create directory: ${err.message}`);
    rl.close();
    process.exit(1);
  }
  
  // Copy files
  console.log('|');
  printSection('○', 'Installing files...');
  
  const filesToCopy = ['SKILL.md', 'VERSION', 'CHANGELOG.md', 'references', 'bin', 'scans'];
  const sourceDir = path.join(__dirname, '..');
  
  try {
    filesToCopy.forEach(file => {
      const src = path.join(sourceDir, file);
      const dest = path.join(targetDir, file);
      
      if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    });
  } catch (err) {
    console.error(`\n❌ Failed to copy files: ${err.message}`);
    rl.close();
    process.exit(1);
  }
  
  // Installation summary
  console.log('|');
  printSection('○', 'Installation Summary ------------------------------------+');
  console.log('|                                                           |');
  console.log(`|  ${targetDir.padEnd(57)} |`);
  console.log('|    ✓ SKILL.md                                             |');
  console.log('|    ✓ references/                                          |');
  console.log('|    ✓ bin/                                                 |');
  console.log('|                                                           |');
  console.log('+-----------------------------------------------------------+');
  console.log('|');
  printSection('✓', 'Installation complete!', colors.green);
  console.log('|');
  console.log(`${colors.blue}📚 What\'s next?${colors.reset}`);
  console.log(`  ${colors.cyan}•${colors.reset} Agent will auto-detect when you need accessibility remediation`);
  console.log(`  ${colors.cyan}•${colors.reset} Or invoke manually with ${colors.yellow}/ada-accessibility-skill${colors.reset}`);
  console.log('\n');
  
  rl.close();
}

install().catch(err => {
  console.error('\n❌ Installation failed:', err.message);
  rl.close();
  process.exit(1);
});
