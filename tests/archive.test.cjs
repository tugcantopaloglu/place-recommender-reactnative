const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const test = require('node:test');
const { patchExpoTar } = require('../scripts/patch-expo-tar.cjs');

const cliDirectory = path.dirname(require.resolve('@expo/cli/package.json'));
const cliRequire = createRequire(path.join(cliDirectory, 'package.json'));
const tar = cliRequire('tar');
const { cloneTemplateAsync } = require(path.join(cliDirectory, 'build/src/prebuild/resolveTemplate.js'));

test('Expo extracts and renames a template using the patched tar parser', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'expo-tar-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'source');
  await fs.mkdir(path.join(source, 'package', 'ios', 'HelloWorld'), { recursive: true });
  await fs.mkdir(path.join(source, 'package', 'android', 'app'), { recursive: true });
  await fs.writeFile(path.join(source, 'package', 'ios', 'HelloWorld', 'Info.plist'), '<plist></plist>');
  await fs.writeFile(path.join(source, 'package', 'android', 'app', 'build.gradle'), 'android {}');
  await fs.writeFile(path.join(source, 'package', 'gitignore'), 'node_modules/');
  const archive = path.join(directory, 'template.tgz');
  await tar.create({ cwd: source, file: archive, gzip: true }, ['package']);
  const output = path.join(directory, 'output');
  await fs.mkdir(output);
  const digest = await cloneTemplateAsync({ templateDirectory: output, template: { type: 'file', uri: archive }, exp: { name: 'ArchiveSmoke' }, ora: {} });
  assert.equal(typeof digest, 'string');
  assert.equal(await fs.readFile(path.join(output, 'ios', 'ArchiveSmoke', 'Info.plist'), 'utf8'), '<plist></plist>');
  assert.equal(await fs.readFile(path.join(output, 'android', 'app', 'build.gradle'), 'utf8'), 'android {}');
  assert.equal(await fs.readFile(path.join(output, '.gitignore'), 'utf8'), 'node_modules/');
  assert.equal(cliRequire('tar/package.json').version, '7.5.22');
});

test('the namespace patch is idempotent and rejects unexpected source before any write', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'expo-tar-patch-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const utilities = path.join(directory, 'build', 'src', 'utils');
  await fs.mkdir(utilities, { recursive: true });
  await fs.mkdir(path.join(directory, 'node_modules', 'tar'), { recursive: true });
  await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ version: '0.22.28' }));
  await fs.writeFile(path.join(directory, 'node_modules', 'tar', 'package.json'), JSON.stringify({ version: '7.5.22' }));
  const legacy = '_interopRequireDefault(require("tar"))';
  for (const name of ['tar.js', 'npm.js']) {
    const source = await fs.readFile(path.join(cliDirectory, 'build', 'src', 'utils', name), 'utf8');
    await fs.writeFile(path.join(utilities, name), source.replace('{ default: require("tar") }', legacy));
  }
  patchExpoTar(directory);
  const first = await fs.readFile(path.join(utilities, 'tar.js'), 'utf8');
  patchExpoTar(directory);
  assert.equal(await fs.readFile(path.join(utilities, 'tar.js'), 'utf8'), first);
  await fs.writeFile(path.join(utilities, 'tar.js'), first.replace('{ default: require("tar") }', legacy));
  await fs.writeFile(path.join(utilities, 'npm.js'), 'unexpected upstream source');
  const unpatched = await fs.readFile(path.join(utilities, 'tar.js'), 'utf8');
  assert.throws(() => patchExpoTar(directory), /Unexpected Expo tar import shape/);
  assert.equal(await fs.readFile(path.join(utilities, 'tar.js'), 'utf8'), unpatched);
  await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ version: '0.23.0' }));
  assert.throws(() => patchExpoTar(directory), /requires CLI 0.22.28/);
  assert.equal(await fs.readFile(path.join(utilities, 'tar.js'), 'utf8'), unpatched);
});
