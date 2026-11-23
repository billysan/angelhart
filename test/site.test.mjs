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
  for(const [,url]of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
   const local=url.endsWith('/')?`${url}index.html`:url;
   assert.ok((await stat(`dist${local}`)).isFile(),`${route}: missing ${url}`);
  }
  assert.doesNotMatch(html,/href="#"/);
 }
});
test('every film keeps all future content sections',async()=>{
 for(const film of films){const html=await readFile(`dist/work/${film.slug}/index.html`,'utf8');for(const title of ['SYNOPSIS','TRAILER','STILLS','CAST &amp; CREW','FESTIVALS &amp; AWARDS','RELATED'])assert.ok(html.includes(title),`${film.slug}: ${title}`);}
});
test('contact email links to the supplied address',async()=>{
 const html=await readFile('dist/contact/index.html','utf8');assert.ok(html.includes('href="mailto:inquires@sharonangelhart.com"'));assert.doesNotMatch(html,/Email to come|href="(?:null|undefined)"/);
});

test('portfolio is the landing content and the background exists on each route',async()=>{
 const home=await readFile('dist/index.html','utf8');
 assert.match(home,/class="section work-section"/);
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
