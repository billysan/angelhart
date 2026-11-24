document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
if(menu && nav){
  menu.hidden=false;
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');menu.querySelector('span').textContent='+';};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);menu.querySelector('span').textContent=open?'−':'+';});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  matchMedia('(max-width:720px)').addEventListener('change',closeMenu);
}

const background=document.querySelector('.home-background');
if(background){
  const slides=[...background.querySelectorAll('[data-background-slide]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,playing=!reduced.matches,timer=null,busy=false;
  async function advance(){
    if(busy)return;
    busy=true;
    const next=(index+1)%slides.length;
    try{
      const image=slides[next].querySelector('img');
      image.loading='eager';
      await image.decode();
      if(!playing||document.hidden)return;
      slides[index].classList.remove('is-active');
      slides[next].classList.add('is-active');
      index=next;
    }catch{ /* Keep the current image if the next one cannot load. */ }
    finally{busy=false;}
  }
  function schedule(){clearInterval(timer);if(playing&&!document.hidden)timer=setInterval(advance,8000);}
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{playing=!reduced.matches;schedule();});
  schedule();
}

// Native page links remain usable without JavaScript; enhanced navigation keeps
// the shared background alive while only the page content crossfades.
const main=document.querySelector('#main');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const canonicalPath=path=>['/','/index.html'].includes(path)?'/':['/work/','/work/index.html'].includes(path)?'/work/':path;
let currentPath=canonicalPath(location.pathname);
let navigationId=0,pendingNavigation=null;
const fade=(element,from,to,duration)=>element.animate([{opacity:from},{opacity:to}],{duration,easing:'ease-in-out'}).finished.catch(()=>{});
if(main?.dataset.page==='work'&&!reducedMotion.matches)fade(main,0,1,1500);

function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());}
function closeNavigation(){
  menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');
  if(menu)menu.querySelector('span').textContent='+';
}
async function navigate(url,{push=true,scrollY=0}={}){
  const id=++navigationId;
  pendingNavigation?.abort();
  pendingNavigation=new AbortController();
  try{
    const response=await fetch(url,{signal:pendingNavigation.signal,headers:{'X-Requested-With':'site-navigation'}});
    if(!response.ok)throw new Error('Page unavailable');
    const next=new DOMParser().parseFromString(await response.text(),'text/html');
    const nextMain=next.querySelector('#main');
    if(!nextMain||id!==navigationId)return;
    const intro=nextMain.dataset.page==='intro';
    const home=nextMain.dataset.page==='work';
    closeDialogs();closeNavigation();
    const update=()=>{
      if(id!==navigationId)return;
      if(push){history.replaceState({scrollY:window.scrollY},'',location.href);history.pushState({scrollY:0},'',url);}
      main.replaceChildren(...[...nextMain.childNodes].map(node=>document.importNode(node,true)));
      main.dataset.page=nextMain.dataset.page;
      document.title=next.title;
      document.body.classList.toggle('landing-page',home);
      document.body.classList.toggle('intro-page',intro);
      nav.querySelectorAll('a').forEach(anchor=>{
        if(canonicalPath(new URL(anchor.href).pathname)===canonicalPath(url.pathname))anchor.setAttribute('aria-current','page');
        else anchor.removeAttribute('aria-current');
      });
      currentPath=canonicalPath(url.pathname);
      window.scrollTo({top:scrollY,behavior:'instant'});
      main.focus({preventScroll:true});
    };
    if(!reducedMotion.matches&&document.startViewTransition){
      const transition=document.startViewTransition(update);
      await transition.finished.catch(()=>{});
    }else if(!reducedMotion.matches){
      await fade(main,1,0,166);
      if(id!==navigationId)return;
      update();await fade(main,0,1,home?1500:167);
    }else update();
  }catch(error){
    if(error.name!=='AbortError'&&id===navigationId)location.assign(url.href);
  }
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-press-modal]');
  if(trigger&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){
    const dialog=document.getElementById(trigger.dataset.pressModal);
    if(dialog?.showModal){event.preventDefault();dialog.showModal();document.body.classList.add('modal-open');}
    return;
  }
  const close=event.target.closest('[data-close-modal]');
  if(close){close.closest('dialog')?.close();return;}
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const anchor=event.target.closest('a[href]');
  if(!anchor||anchor.target||anchor.hasAttribute('download')||anchor.getAttribute('href').startsWith('#'))return;
  const url=new URL(anchor.href);
  if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol)||url.hash)return;
  if(!url.pathname.endsWith('/')&&!url.pathname.endsWith('.html'))return;
  event.preventDefault();
  if(canonicalPath(url.pathname)===currentPath){
    navigationId++;pendingNavigation?.abort();main.getAnimations().forEach(animation=>animation.cancel());
    closeNavigation();closeDialogs();window.scrollTo({top:0,behavior:'instant'});
    if(currentPath==='/'&&!reducedMotion.matches)fade(main,0,1,1500);
    return;
  }
  navigate(url);
});
document.addEventListener('click',event=>{
  if(event.target.matches('dialog')){
    const rect=event.target.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)event.target.close();
  }
});
document.addEventListener('close',event=>{if(event.target.matches('dialog')&&!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');},true);
history.scrollRestoration='manual';
window.addEventListener('popstate',event=>navigate(new URL(location.href),{push:false,scrollY:event.state?.scrollY||0}));
