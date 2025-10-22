#!/usr/bin/env node

/**
 * PRE-DEPLOYMENT CLEANUP SCRIPT
 * 
 * Checks for and removes sensitive files before deployment.
 * Ensures no secrets are accidentally committed or deployed.
 * 
 * USAGE:
 *   node cleanup-before-deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(70));
console.log('🧹 PRE-DEPLOYMENT CLEANUP & SECURITY CHECK');
console.log('='.repeat(70) + '\n');

let hasIssues = false;
let warningsCount = 0;

// Files that should be removed before deployment
const sensitiveFiles = [
  'service-account-key.json',
  'service-account.json',
  'credentials.json',
  'users-temp.json',
  'users-export.json',
  '.env.local',
  'secrets.json'
];

// Patterns to search for in code
const dangerousPatterns = [
  { pattern: 'service-account-key.json', description: 'Service account key reference' },
  { pattern: 'PRIVATE.*KEY', description: 'Private key reference' },
  { pattern: 'credential.*cert', description: 'Certificate credential usage' }
];

console.log('📋 Step 1: Checking for sensitive files...\n');

let foundFiles = [];
for (const file of sensitiveFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    foundFiles.push(file);
    hasIssues = true;
  }
}

if (foundFiles.length > 0) {
  console.log('⚠️  Found sensitive files:');
  foundFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\n🗑️  Removing sensitive files...');
  
  for (const file of foundFiles) {
    try {
      fs.unlinkSync(path.join(__dirname, file));
      console.log(`   ✅ Removed: ${file}`);
    } catch (error) {
      console.log(`   ❌ Failed to remove: ${file} (${error.message})`);
    }
  }
  console.log('');
} else {
  console.log('✅ No sensitive files found in root directory\n');
}

// Check subdirectories
console.log('📋 Step 2: Checking subdirectories...\n');

try {
  const findCommand = 'find . -name "service-account*.json" -o -name "*-key.json" -o -name "*.pem" | grep -v node_modules | grep -v .git';
  const result = execSync(findCommand, { encoding: 'utf-8' }).trim();
  
  if (result) {
    console.log('⚠️  WARNING: Found sensitive files in subdirectories:');
    console.log(result.split('\n').map(f => `   - ${f}`).join('\n'));
    console.log('\n🗑️  Please manually review and remove these files!\n');
    warningsCount++;
  } else {
    console.log('✅ No sensitive files found in subdirectories\n');
  }
} catch (error) {
  // No files found (exit code 1 from grep means no matches, which is good)
  if (error.status === 1) {
    console.log('✅ No sensitive files found in subdirectories\n');
  } else {
    console.log('⚠️  Could not scan subdirectories\n');
  }
}

// Check .gitignore
console.log('📋 Step 3: Verifying .gitignore...\n');

const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  
  const requiredPatterns = [
    'service-account*.json',
    '*-key.json',
    '*.pem',
    'users-temp.json'
  ];
  
  const missingPatterns = [];
  for (const pattern of requiredPatterns) {
    if (!gitignoreContent.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  }
  
  if (missingPatterns.length > 0) {
    console.log('⚠️  WARNING: .gitignore missing important patterns:');
    missingPatterns.forEach(p => console.log(`   - ${p}`));
    console.log('\n💡 Add these patterns to .gitignore before deploying!\n');
    warningsCount++;
  } else {
    console.log('✅ .gitignore properly configured\n');
  }
} else {
  console.log('⚠️  WARNING: No .gitignore file found!\n');
  warningsCount++;
}

// Check git status
console.log('📋 Step 4: Checking git status...\n');

try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  
  if (gitStatus) {
    const sensitiveChanges = gitStatus.split('\n').filter(line => 
      line.includes('.json') && 
      !line.includes('package.json') && 
      !line.includes('package-lock.json') &&
      !line.includes('tsconfig') &&
      !line.includes('firestore')
    );
    
    if (sensitiveChanges.length > 0) {
      console.log('⚠️  WARNING: Uncommitted JSON files detected:');
      sensitiveChanges.forEach(line => console.log(`   ${line}`));
      console.log('\n💡 Review these files before committing!\n');
      warningsCount++;
    } else {
      console.log('✅ No suspicious uncommitted files\n');
    }
  } else {
    console.log('✅ Working directory clean\n');
  }
} catch (error) {
  console.log('⚠️  Could not check git status (not a git repository?)\n');
}

// Check git history for secrets
console.log('📋 Step 5: Checking git history for secrets...\n');

try {
  const historyCheck = execSync(
    'git log --all --full-history --pretty=format:"%H" -- "*service-account*.json" "*-key.json" "*.pem" | head -5',
    { encoding: 'utf-8' }
  ).trim();
  
  if (historyCheck) {
    console.log('⚠️  CRITICAL WARNING: Sensitive files found in git history!');
    console.log('   This means secrets may have been exposed.\n');
    console.log('🚨 IMMEDIATE ACTIONS REQUIRED:');
    console.log('   1. Revoke/rotate any exposed credentials');
    console.log('   2. Clean git history (see ADMIN_SECURITY_GUIDE.md)');
    console.log('   3. Force push cleaned history');
    console.log('   4. Generate new credentials\n');
    hasIssues = true;
    warningsCount++;
  } else {
    console.log('✅ No secrets found in git history\n');
  }
} catch (error) {
  if (error.status === 1) {
    console.log('✅ No secrets found in git history\n');
  } else {
    console.log('⚠️  Could not check git history\n');
  }
}

// Check for hardcoded secrets in code
console.log('📋 Step 6: Scanning code for hardcoded secrets...\n');

const scriptsToCheck = [
  'create-first-admin.js',
  'set-admin-role.js'
];

let foundHardcodedSecrets = false;
for (const script of scriptsToCheck) {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    const content = fs.readFileSync(scriptPath, 'utf-8');
    
    // Check for hardcoded emails
    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatch) {
      console.log(`⚠️  WARNING: Found hardcoded email in ${script}:`);
      emailMatch.forEach(email => console.log(`   - ${email}`));
      foundHardcodedSecrets = true;
    }
    
    // Check for service account references
    if (content.includes('service-account-key.json')) {
      console.log(`⚠️  WARNING: ${script} references service-account-key.json`);
      foundHardcodedSecrets = true;
    }
  }
}

if (foundHardcodedSecrets) {
  console.log('\n💡 Consider using create-admin-secure.js instead\n');
  warningsCount++;
} else {
  console.log('✅ No hardcoded secrets found in admin scripts\n');
}

// Summary
console.log('='.repeat(70));
console.log('📊 CLEANUP SUMMARY');
console.log('='.repeat(70) + '\n');

if (hasIssues) {
  console.log('❌ CRITICAL ISSUES FOUND - DO NOT DEPLOY YET!');
  console.log('   Review the critical warnings above before proceeding.\n');
  process.exit(1);
} else if (warningsCount > 0) {
  console.log(`⚠️  Found ${warningsCount} warning(s)`);
  console.log('   Review warnings above and fix before deploying.\n');
  console.log('💡 You can deploy, but addressing warnings is recommended.\n');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('   Your repository is clean and safe to deploy.\n');
  console.log('🚀 Ready for deployment!\n');
  process.exit(0);
}

