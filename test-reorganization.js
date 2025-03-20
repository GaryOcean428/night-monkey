/**
 * Test script for validating the frontend/backend reorganization
 * 
 * This script checks:
 * 1. File existence
 * 2. Directory structure
 * 3. Relative paths in import statements
 */

const fs = require('fs');
const path = require('path');

// Check if a file or directory exists
function checkExists(filepath, type = 'file') {
  try {
    const stats = fs.statSync(filepath);
    if (type === 'file' && !stats.isFile()) {
      return `${filepath} exists but is not a file`;
    }
    if (type === 'directory' && !stats.isDirectory()) {
      return `${filepath} exists but is not a directory`;
    }
    return true;
  } catch (error) {
    return `${filepath} does not exist: ${error.message}`;
  }
}

// Check file contents for import patterns
function checkImportPaths(filepath, expectedPattern) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const importLines = content.match(/import.*from.*/g) || [];
    
    const badImports = importLines.filter(line => {
      return line.includes('@/app/') && !line.includes('//');
    });
    
    if (badImports.length > 0) {
      return `${filepath} contains old import paths:\n${badImports.join('\n')}`;
    }
    
    const correctImports = importLines.filter(line => {
      return line.includes(expectedPattern) && !line.includes('//');
    });
    
    return correctImports.length > 0 
      ? true 
      : `${filepath} does not contain expected import pattern: ${expectedPattern}`;
  } catch (error) {
    return `Error reading ${filepath}: ${error.message}`;
  }
}

// Collect test results
const results = {
  directories: [],
  configFiles: [],
  frontendImports: [],
  backendImports: [],
  otherChecks: []
};

// Check main directories
['frontend', 'backend', 'frontend/app', 'frontend/components', 'frontend/utils', 
 'backend/api', 'backend/utils'].forEach(dir => {
  results.directories.push({
    name: dir,
    result: checkExists(dir, 'directory')
  });
});

// Check key config files
['package.json', 'tsconfig.json', 'next.config.mjs',
 'frontend/package.json', 'frontend/tsconfig.json',
 'backend/package.json', 'backend/tsconfig.json'].forEach(file => {
  results.configFiles.push({
    name: file,
    result: checkExists(file, 'file')
  });
});

// Check frontend import patterns
fs.readdirSync('frontend', { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')))
  .forEach(entry => {
    const fullPath = path.join(entry.path, entry.name);
    if (!fullPath.includes('node_modules')) {
      results.frontendImports.push({
        name: fullPath,
        result: checkImportPaths(fullPath, '@/frontend/')
      });
    }
  });

// Check backend import patterns
fs.readdirSync('backend', { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')))
  .forEach(entry => {
    const fullPath = path.join(entry.path, entry.name);
    if (!fullPath.includes('node_modules')) {
      results.backendImports.push({
        name: fullPath,
        result: checkImportPaths(fullPath, '@/backend/')
      });
    }
  });

// Other important checks
results.otherChecks.push({
  name: 'next.config.mjs appDir setting',
  result: (() => {
    try {
      const content = fs.readFileSync('next.config.mjs', 'utf8');
      return content.includes('appDir: "./frontend/app"') 
        ? true 
        : 'appDir not correctly set to "./frontend/app"';
    } catch (error) {
      return `Error reading next.config.mjs: ${error.message}`;
    }
  })()
});

// Function to display results
function displayResults(resultSet, title) {
  console.log(`\n${title}:`);
  console.log('-'.repeat(title.length + 1));
  
  const failures = resultSet.filter(item => item.result !== true);
  
  if (failures.length === 0) {
    console.log(`✅ All ${resultSet.length} checks passed`);
  } else {
    console.log(`❌ ${failures.length}/${resultSet.length} checks failed:`);
    failures.forEach(fail => {
      console.log(`  - ${fail.name}: ${fail.result}`);
    });
  }
}

// Display all results
console.log('REORGANIZATION VALIDATION RESULTS');
console.log('================================');
displayResults(results.directories, 'Directory Structure');
displayResults(results.configFiles, 'Configuration Files');
displayResults(results.frontendImports, 'Frontend Import Paths');
displayResults(results.backendImports, 'Backend Import Paths');
displayResults(results.otherChecks, 'Other Checks');

// Overall assessment
const totalChecks = [
  ...results.directories,
  ...results.configFiles,
  ...results.frontendImports,
  ...results.backendImports,
  ...results.otherChecks
];

const failedChecks = totalChecks.filter(check => check.result !== true);

console.log('\nOVERALL ASSESSMENT');
console.log('=================');
if (failedChecks.length === 0) {
  console.log(`✅ All ${totalChecks.length} checks passed! The reorganization appears successful.`);
} else {
  console.log(`❌ ${failedChecks.length}/${totalChecks.length} checks failed. Some issues need to be addressed.`);
}