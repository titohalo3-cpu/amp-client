// Compila la app y la publica en la rama gh-pages de GitHub (GitHub Pages).
// Uso: npm run deploy
import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync, rmSync } from 'node:fs';

const REPO = 'https://github.com/titohalo3-cpu/amp-client.git';
const DIST = 'dist/amp-client/browser';
const run = (cmd, cwd = '.') => execSync(cmd, { stdio: 'inherit', cwd });

run('npx ng build --base-href /amp-client/');
copyFileSync(`${DIST}/index.html`, `${DIST}/404.html`); // rutas como /detalle/3 al recargar
writeFileSync(`${DIST}/.nojekyll`, '');
rmSync(`${DIST}/.git`, { recursive: true, force: true });

run('git init -q -b gh-pages', DIST);
run('git add -A', DIST);
run('git commit -q -m "Publicar AmpClient en GitHub Pages"', DIST);
run(`git push -f ${REPO} gh-pages`, DIST);
console.log('\nPublicado: https://titohalo3-cpu.github.io/amp-client/');
