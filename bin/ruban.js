#!/usr/bin/env node

const rimraf = require('rimraf');
const join = require('path').join;
const spawn = require('child_process').spawn;
const camelcase = require('camelcase');
const which = require('which');
const vfs = require('vinyl-fs');
const readFileSync  = require('fs').readFileSync;
const writeFileSync  = require('fs').writeFileSync;
const os = require('os');
const through = require('through2');
const chalk = require('chalk');
const babel = require('babel-core');
const chokidar = require('chokidar');
const getBabelConfig = require('../src/getBabelConfig');

const script = camelcase(process.argv[2]);
const args = process.argv.slice(3);

const cwd = process.cwd();

function watchAndBuild(src) {
  console.log('start watch');
  const watcher = chokidar.watch(src, {
    persistent: true,
  });
  watcher.on('all', (event, fullPath) => {
    if (['add', 'change'].indexOf(event) > -1) {
      const path = fullPath.replace(`${cwd}/src/`, '');
      console.log(chalk.green.bold(`[${event}]`), `src/${path}`);
      const content = readFileSync(fullPath, 'utf-8');
      const transformedContent = babel.transform(content, getBabelConfig()).code;
      writeFileSync(join(cwd, 'lib', path), transformedContent, 'utf-8');
    }
  });
}

function build() {
  rimraf.sync('./lib');
  if (args.indexOf('-w') > -1 || args.indexOf('--watch') > -1) {
    setTimeout(() => {
      watchAndBuild(join(cwd, './src'));
    }, 1000);
  }
  return vfs.src('./src/**/*.js')
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
  const compiler = join(__dirname, '../src/compiler.js');
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
  const config = join(__dirname, '../eslintrc');
  const cmd = `${eslintBin} --config ${config} --ext .js src test`;
  runCommand(cmd);
}

function lintStaged() {
  runCommand(require.resolve('lint-staged/index.js'));
}

function pub() {
  build()
    .on('end', () => {
      const name = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf-8')).name;
      const isAli = name.indexOf('@ali/') === 0 || name.indexOf('@alipay') === 0;
      const npm = isAli ? 'tnpm' : 'npm';
      const cmd = args.indexOf('--beta') > -1
        ? `${npm} publish --beta`
        : `${npm} publish`;

      runCommand(cmd).on('exit', () => {
        if (!isAli) {
          try {
            runCommand(`cnpm sync ${name} && tnpm sync ${name}`);
          } catch (e) {
          }
        }
      });
    });
}

function runCommand(cmd) {
  console.log(chalk.green.bold(`>> ${cmd}`));
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
