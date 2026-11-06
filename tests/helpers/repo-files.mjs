import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const readRepoFile = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');

export const readReference = (page) => readRepoFile(`design/shell/reference/${page}.html`);
