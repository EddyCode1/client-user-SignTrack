const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  if (!/Platform\s*\./.test(content)) return null; // only consider actual property accesses like Platform.
  const head = content.split('\n').slice(0, 20).join('\n');
  const importsPlatform = /import\s+\{[^}]*\bPlatform\b[^}]*\}\s+from\s+['\"]react-native['\"]/m.test(head) || /const\s+\{[^}]*\bPlatform\b[^}]*\}\s*=\s*require\('react-native'\)/m.test(head);
  if (!importsPlatform) return file;
  return null;
}

const root = path.join(__dirname, '..', 'src');
const files = walk(root);
const problems = [];
files.forEach((f) => {
  const res = checkFile(f);
  if (res) problems.push(res.replace(process.cwd() + path.sep, ''));
});

if (problems.length === 0) {
  console.log('No issues found: every file that uses Platform imports it in the first 20 lines.');
  process.exit(0);
}

console.log('Files using Platform but missing import in first 20 lines:');
problems.forEach(p => console.log('-', p));
process.exit(1);
