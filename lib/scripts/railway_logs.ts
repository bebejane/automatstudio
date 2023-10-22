import { spawn } from 'node:child_process';
import { format } from 'date-fns';
import chalk from 'chalk';
import readline from 'linebyline'

import * as dotenv from 'dotenv'; dotenv.config({ path: './.env' });

const ls = spawn('railway', ['logs', '--json'], {});

console.log('Waiting for railway logs...');

readline(ls.stdout).on('line', (data) => {
  try {
    const l = JSON.parse(data.toString().trim());
    console.log(`${chalk.gray(format(new Date(l.timestamp), 'HH:mm:ss'))} ${chalk.green(l.message)}`);
  } catch (e) {
    console.log(e)
    console.log(data.toString());
  }
});

readline(ls.stderr).on('line', (data) => {
  try {
    const l = JSON.parse(data.toString());
    console.log(`${chalk.gray(format(new Date(l.timestamp), 'HH:mm:ss'))} ${chalk.red(l.message)}`);
  } catch (e) { }
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
}); 