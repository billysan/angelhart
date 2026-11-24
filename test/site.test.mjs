import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {films,media} from '../src/content.mjs';
import '../scripts/build.mjs';
const routes=['/','/work/','/about/','/press/','/contact/',...films.map(f=>`/work/${f.slug}/`)];
test('all generated pages have working local links and assets',async()=>{
 for(const route of routes){
  const html=await readFile(`dist${route}index.html`,'utf8');
  assert.match(html,/<html lang="en">/);assert.match(html,/<main id="main"[^>]*>/);
  for(const [,url]of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
   const local=url.endsWith('/')?`${url}index.html`:url;
   assert.ok((await stat(`dist${local}`)).isFile(),`${route}: missing ${url}`);
  }
  assert.doesNotMatch(html,/href="#"/);
 }
});
test('every film page shows synopsis, cast, festivals',async()=>{
 for(const film of films){const html=await readFile(`dist/work/${film.slug}/index.html`,'utf8');for(const title of ['SYNOPSIS','CAST &amp; CREW','FESTIVALS &amp; AWARDS'])assert.ok(html.includes(title),`${film.slug}: ${title}`);for(const gone of ['STILLS','RELATED'])assert.ok(!html.includes(`<h2>${gone}</h2>`),`${film.slug}: ${gone}`);}
});
test('contact email links to the supplied address',async()=>{
 const html=await readFile('dist/contact/index.html','utf8');assert.ok(html.includes('href="mailto:hello@sharonangelhart.com"'));assert.doesNotMatch(html,/Email to come|href="(?:null|undefined)"/);
});
test('plus entrance opens work, while background remains on every route',async()=>{
 const home=await readFile('dist/index.html','utf8');
 const work=await readFile('dist/work/index.html','utf8');
 assert.match(home,/class="intro-screen"/);
 assert.doesNotMatch(home,/matrix-rain/);
 assert.match(home,/href="\/work\/" aria-label="Enter works"/);
 assert.match(home,/class="plus-entry" href="\/work\/"/);assert.doesNotMatch(home,/lotus/);
 assert.match(work,/class="section work-section"/);
 for(const route of routes){
  const html=await readFile(`dist${route}index.html`,'utf8');
  assert.match(html,/class="home-background"/);
  const nav=html.match(/<nav[^>]*>(.*?)<\/nav>/s)[1];
  assert.doesNotMatch(nav,/href="\/work\/"/);
 }
});
test('unified press cards have labeled dialogs and original-source fallbacks',async()=>{
 const html=await readFile('dist/press/index.html','utf8');
 assert.doesNotMatch(html,/<h2>Reviews<\/h2>|<h2>Interviews &amp; podcasts<\/h2>/);
 const cards=[...html.matchAll(/href="(https:[^"]+)" data-press-modal="([^"]+)"/g)];
 assert.equal(cards.length,media.length);
 for(const[,url,id]of cards){
  assert.ok(html.includes(`id="${id}" aria-labelledby=`));
  assert.ok(html.includes(url));
 }
 assert.match(html,/English digest/);assert.match(html,/Go to original review/);
});
