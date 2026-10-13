(()=>{
const LG=['ar','en','tr','fr'],WA='963991310740',PG=document.body.dataset.p;
let L=0;try{const s=localStorage.getItem('kl');if(LG.includes(s))L=LG.indexOf(s)}catch(e){}
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const tx=k=>K[k]?K[k][L]:k;
const FL='<svg width="30" height="30" viewBox="-36 -36 72 72" fill="currentColor"><path d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/><path transform="rotate(72)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/><path transform="rotate(144)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/><path transform="rotate(216)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/><path transform="rotate(288)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/></svg>';
const WI='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 13.8c-.2.6-1.300 1.200-1.800 1.200-.5.1-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.200c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.300 1.700 2.100 1.200 1 2.200 1.300 2.500 1.500.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.400z"/></svg>';
const PAGES=[['home','index.html','nav.home'],['mf','bedding.html','t.mf'],['hm','home.html','t.hm'],['of','office.html','t.of'],['ct','contact.html','t.ct']];
const SUBS={mf:['beds','mattresses'],hm:['bedroom','dining','sitting','tables'],of:['exec','work','ops','meet','recep','store','school','seat']};
const F={mf:'all',hm:'all',of:'all'};
let cur=null,ix=0;
// nav
const nav=el('nav');
nav.innerHTML='<a class="logo" href="index.html" aria-label="KONFOR">'+FL+'<span>KONFOR</span></a><div class="menu" id="menu"><div class="lk"></div><div class="lw"><span data-k="lang"></span><div class="lsw"><i></i></div></div><a class="nb" href="contact.html"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg></span><span data-k="h.b2"></span></a></div><button class="bg" id="bg" aria-label="menu">☰</button>';
PAGES.forEach(([k,h,t])=>{const a=el('a');a.href=h;a.dataset.k=t;a.dataset.pg=k;$('.lk',nav).append(a)});
['عربي','EN','TR','FR'].forEach((n,i)=>{const b=el('button','',n);b.onclick=()=>{L=i;try{localStorage.setItem('kl',LG[i])}catch(e){}render()};$('.lsw',nav).append(b)});
document.body.prepend(nav);
$('#bg',nav).onclick=()=>$('#menu',nav).classList.toggle('open');
$$('.lk a',nav).forEach(a=>a.onclick=()=>$('#menu',nav).classList.remove('open'));
const sol=()=>nav.classList.toggle('solid',PG!=='home'||scrollY>60);sol();addEventListener('scroll',sol,{passive:true});
const ft=el('footer','','© KONFOR · ALKURDI GROUP');document.body.append(ft);
const nm=p=>Array.isArray(p.n)?p.n[L]:p.n;
const buyUrl=p=>'https://wa.me/'+WA+'?text='+encodeURIComponent(tx('msg').replace('{n}',nm(p)).replace('{c}',tx('t.'+p.s)));
// home collections
if(PG==='home'){const g=$('#cc');['mf','hm','of'].forEach(s=>{const p=P.find(x=>x.s===s);const a=el('a','cc rv');a.href=PAGES.find(x=>x[0]===s)[1];const i=el('img');i.src='images/t/'+p.i[0]+'.webp';i.alt='';i.loading='lazy';const b=el('b','','→');const d=el('div');const h=el('h3');h.dataset.k='t.'+s;const q=el('p');q.dataset.k='s.'+s;d.append(h,q);a.append(i,b,d);g.append(a)});
 const hv=$('#hv');hv.addEventListener('error',()=>hv.remove());hv.play&&hv.play().catch(()=>{})}
// product pages
function grid(){
 const ch=$('#chips'),g=$('#grid');if(!ch)return;ch.replaceChildren();g.replaceChildren();
 ['all',...SUBS[PG]].forEach(u=>{const b=el('button',F[PG]===u?'on':'',tx('u.'+u));b.onclick=()=>{F[PG]=u;grid()};ch.append(b)});
 const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}}),{threshold:.1});
 P.filter(p=>p.s===PG&&(F[PG]==='all'||p.u===F[PG])).forEach((p,n)=>{
  const c=el('article','card');c.style.transitionDelay=(n%3)*90+'ms';
  const cv=el('button','cv');cv.setAttribute('aria-label',nm(p));const im=el('img');im.src='images/t/'+p.i[0]+'.webp';im.alt=nm(p);im.loading='lazy';im.decoding='async';im.width=440;im.height=330;cv.append(im,el('span','bd',p.i.length+' '+tx('ph')));cv.onclick=()=>open(p);
  const f=el('div','info');f.append(el('h3','',nm(p)),el('p','d',p.d?p.d[L]:OD[p.u][L]));if(p.z)f.append(el('p','z',p.z));
  const a=el('a','buy');a.innerHTML=WI;a.append(el('span','',tx('buy')));a.href=buyUrl(p);a.target='_blank';a.rel='noopener noreferrer';f.append(a);
  c.append(cv,f);g.append(c);o.observe(c)})}
function contact(){const a=$('#wal');if(a)a.href='https://wa.me/'+WA}
// lightbox
const lb=el('div');lb.id='lb';lb.setAttribute('role','dialog');lb.innerHTML='<button id="cl" aria-label="close">×</button><div class="m"><button class="ar2" id="pv" aria-label="prev">‹</button><img id="bi" alt=""><button class="ar2" id="nx" aria-label="next">›</button></div><div class="t"><b id="lt"></b><span id="ld"></span><a class="buy" id="lbb" target="_blank" rel="noopener noreferrer"></a></div><div class="th" id="th"></div>';document.body.append(lb);
function open(p){cur=p;$('#lt').textContent=nm(p);$('#ld').textContent=p.d?p.d[L]:OD[p.u][L];const b=$('#lbb');b.replaceChildren();b.insertAdjacentHTML('afterbegin',WI);b.append(el('span','',tx('buy')));b.href=buyUrl(p);
 const th=$('#th');th.replaceChildren();p.i.forEach((id,k)=>{const i=el('img');i.src='images/t/'+id+'.webp';i.alt='';i.onclick=()=>show(k);th.append(i)});show(0);lb.classList.add('on');document.body.style.overflow='hidden'}
function show(k){ix=(k+cur.i.length)%cur.i.length;const bi=$('#bi');bi.style.animation='none';bi.offsetWidth;bi.style.animation='';bi.src='images/f/'+cur.i[ix]+'.webp';bi.alt=nm(cur);new Image().src='images/f/'+cur.i[(ix+1)%cur.i.length]+'.webp';$$('#th img').forEach((e,j)=>e.classList.toggle('on',j===ix))}
function shut(){lb.classList.remove('on');document.body.style.overflow=''}
$('#cl').onclick=shut;$('#pv').onclick=()=>show(ix-1);$('#nx').onclick=()=>show(ix+1);lb.onclick=e=>{if(e.target===lb)shut()};
addEventListener('keydown',e=>{if(e.key==='Escape'){shut();mv.classList.remove('on')}if(!lb.classList.contains('on'))return;const r=document.documentElement.dir==='rtl'?-1:1;if(e.key==='ArrowRight')show(ix+r);if(e.key==='ArrowLeft')show(ix-r)});
// mobile preview (desktop only)
const mv=el('div');mv.id='mv';
if(self===top){const vm=el('button');vm.id='vm';document.body.append(vm);mv.innerHTML='<button id="mx"></button><div class="ph2"><iframe title="mobile"></iframe></div>';document.body.append(mv);
 vm.onclick=()=>{$('iframe',mv).src=location.href;mv.classList.add('on')};$('#mx',mv).onclick=()=>{mv.classList.remove('on');$('iframe',mv).src='about:blank'}}
function render(){
 document.documentElement.lang=LG[L];document.documentElement.dir=L?'ltr':'rtl';
 $$('[data-k]').forEach(e=>e.textContent=tx(e.dataset.k));
 $$('.lk a',nav).forEach(a=>a.classList.toggle('on',a.dataset.pg===PG));
 $$('.lsw button',nav).forEach((b,i)=>b.classList.toggle('on',i===L));$('.lsw i',nav).style.transform='translateX('+L*42+'px)';
 const vm=$('#vm');if(vm)vm.textContent=tx('vm');const mx=$('#mx');if(mx)mx.textContent=tx('close');
 document.title='KONFOR — '+tx(PAGES.find(x=>x[0]===PG)[2]);grid();contact()}
render();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});$$('.rv,.ci').forEach(e=>io.observe(e));
})();
