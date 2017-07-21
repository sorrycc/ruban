#!/usr/bin/env node

const rimraf = require('rimraf');
const { join } = require('path');
const { spawn } = require('child_process');
const camelcase = require('camelcase');
const vfs = require('vinyl-fs');
const os = require('os');
const through = require('through2');
const babel = require('babel-core');
const getBabelConfig = require('../lib/getBabelConfig');

const script = camelcase(process.argv[2]);
const args = process.argv.slice(3);

function build() {
  rimraf.sync('./lib');
  vfs.src('./src/**/*.js')
    .pipe(through.obj(function(f, enc, cb) {
      f.contents = new Buffer(babel.transform(f.contents, getBabelConfig()).code);
      cb(null, f);
    }))
    .pipe(vfs.dest('./lib/'));
}

function test(noCoverage) {
  const nycBin = require.resolve('nyc/bin/nyc.js');
  const nycCommand = `${nycBin} --include=src/**/*.js --source-map=false --instrument=false`;
  const mochaBin = require.resolve('mocha/bin/_mocha');
  const compiler = join(__dirname, '../lib/compiler.js');
  const cmd = noCoverage
    ? `${mochaBin} --compilers .:${compiler} ${args}`
    : `${nycCommand} ${mochaBin} --compilers .:${compiler} ${args}`;
  runCommand(cmd);
}

function debug() {
  test(/* noCoverage */true);
}

function coveralls() {
  const nycBin = require.resolve('nyc/bin/nyc.js');
  const coverallsBin = require.resolve('coveralls/bin/coveralls.js');
  const cmd = `${nycBin} report --reporter=text-lcov | ${coverallsBin}`;
  runCommand(cmd);
}

function lint() {
  const eslintBin = require.resolve('eslint/bin/eslint.js');
  const config = join(__dirname, '../.eslintrc');
  const cmd = `${eslintBin} --config ${config} --ext .js src test`;
  runCommand(cmd);
}

function lintStaged() {
  runCommand(require.resolve('lint-staged/index.js'));
}

function runCommand(cmd) {
  const command = (os.platform() === 'win32' ? 'cmd.exe' : 'sh');
  const args = (os.platform() === 'win32' ? ['/s', '/c'] : ['-c']);
  return spawn(command, args.concat([cmd]), {
    stdio: 'inherit',
  });
}

if (!script) {
  console.error('Please specify the script.');
  process.exit(1);
}

if (eval(`typeof ${script}`) !== 'function') {
  console.error(`Unknown script ${script}`);
  process.exit(1);
}

eval(`${script}()`);
