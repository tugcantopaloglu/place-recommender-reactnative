const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

function patchExpoTar(cliDirectory = path.dirname(require.resolve('@expo/cli/package.json'))) {
  const packageFile = path.join(cliDirectory, 'package.json');
  const cli = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const scopedRequire = createRequire(packageFile);
  const tar = scopedRequire('tar/package.json');
  if (cli.version !== '0.22.28' || tar.version !== '7.5.22') {
    throw new Error('Expo tar compatibility patch requires CLI 0.22.28 and tar 7.5.22. Review the patch before updating these dependencies.');
  }
  const legacy = '_interopRequireDefault(require("tar"))';
  const compatible = '{ default: require("tar") }';
  const plans = ['tar.js', 'npm.js'].map(name => {
    const file = path.join(cliDirectory, 'build', 'src', 'utils', name);
    const source = fs.readFileSync(file, 'utf8');
    if (source.split(compatible).length === 2 && !source.includes(legacy)) return { file, source, changed: false };
    if (source.split(legacy).length !== 2 || source.includes(compatible)) {
      throw new Error('Unexpected Expo tar import shape in ' + name + '. No dependency files were patched.');
    }
    return { file, source: source.replace(legacy, compatible), changed: true };
  });
  for (const plan of plans) if (plan.changed) fs.writeFileSync(plan.file, plan.source);
}

if (require.main === module) patchExpoTar();

module.exports = { patchExpoTar };
