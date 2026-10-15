import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp, mkdir, writeFile, rm, readFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const require=createRequire(import.meta.url);
const glob=require('fast-glob');
const root=await mkdtemp(path.join(os.tmpdir(),'profplus-glob-'));
try {
 for(const file of ['pages/a.ts','pages/b.tsx','pages/ignore.js','pages/deep/index.ts','apps/web/pages/index.ts','apps/admin/pages/index.ts']) {
  await mkdir(path.dirname(path.join(root,file)),{recursive:true}); await writeFile(path.join(root,file),'export {};');
 }
 const expected=['pages/a.ts','pages/b.tsx','pages/deep/index.ts'];
 assert.deepEqual(glob.sync(['pages/**/*.{ts,tsx}','!**/ignore.*'],{cwd:root}).sort(),expected);
 assert.deepEqual((await glob('pages/**/*.{ts,tsx}',{cwd:root})).sort(),expected);
 assert.deepEqual(glob.sync('pages',{cwd:root}),[],'literal directories must not expand into descendants');
 assert.deepEqual(glob.globSync('apps/*',{cwd:root,onlyDirectories:true}).sort(),['apps/admin','apps/web']);
 const lintRequire=createRequire(require.resolve('@next/eslint-plugin-next'));
 const buildRequire=createRequire(require.resolve('vite-plugin-dynamic-import'));
 for(const consumer of [lintRequire,buildRequire]) assert.equal(consumer('fast-glob'),glob,'both consumers must use the safe adapter');
 const {getRootDirs}=lintRequire('./utils/get-root-dirs.js');
 assert.deepEqual(getRootDirs({cwd:root,settings:{next:{rootDir:path.join(root,'apps/*')}}}).sort(),[path.join(root,'apps/admin'),path.join(root,'apps/web')]);
 assert.throws(()=>glob.sync('{'.repeat(8000)+'x'+'}'.repeat(8000),{cwd:root}),/nesting exceeds/);
 assert.throws(()=>glob.sync('('.repeat(8000)+'x'+')'.repeat(8000),{cwd:root}),/nesting exceeds/);
 assert.throws(()=>glob.sync('pages/*',{cwd:root,objectMode:true}),/Unsupported tooling glob option/);
 const lock=JSON.parse(await readFile('package-lock.json','utf8'));
 for(const pkg of Object.keys(lock.packages)) assert.ok(!/(?:^|\/)node_modules\/(braces|micromatch)$/.test(pkg),'vulnerable dependency must be absent: '+pkg);
 console.log('PASS: real Next/Vinext consumer resolution, file extension braces, negation, nested index imports, root directory scans, no directory expansion, deep-pattern rejection and no braces/micromatch in lockfile.');
} finally {await rm(root,{recursive:true,force:true});}
