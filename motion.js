/* Standalone motion layer. Native sticky positioning drives the hero scroll.
   No GSAP/CDN/network dependency; clean up listeners on every route change. */
(function(root){
'use strict';
const coefficients=[[-.20,-.26],[.67,.01],[.06,.12],[-.47,.24],[.15,-.11]];
function offsets(x,y,width,height){const nx=(x/Math.max(width,1)-.5)*2,ny=(y/Math.max(height,1)-.5)*2;return coefficients.map(([a,b])=>({x:nx*width*.1*a,y:ny*height*.1*b}));}
function mount(doc){
 const win=doc.defaultView||window,media=win.matchMedia('(prefers-reduced-motion: reduce)'),hero=doc.querySelector('.hero-scroll'),stage=hero?.querySelector('.hero-stage'),curve=hero?.querySelector('.hero-main-curve'),orbitLayer=hero?.querySelector('.orbit-layer'),baseFace=hero?.querySelector('.hero-face-base'),baseIntro=baseFace?.querySelector('.hero-intro'),mainMaskCircle=hero?.querySelector('[data-hero-main-mask-circle]'),mainIntroMaskCircle=hero?.querySelector('[data-hero-main-intro-mask-circle]'),accentFace=hero?.querySelector('.hero-face-accent'),circles=hero?Array.from(hero.querySelectorAll('.orbit')):[],maskCircles=hero?Array.from(hero.querySelectorAll('[data-hero-mask-circle]')):[],footer=doc.querySelector('.site-footer'),sayHi=footer?.querySelector('.say-hi');
 let observer=null,scrollFrame=0,active=true,heroTravel=0;
 let pointerPositions=Array.from({length:circles.length+1},()=>({x:0,y:0}));
 const revealed=Array.from(doc.querySelectorAll('[data-reveal]')).filter(el=>!el.matches('.home .project-row,.index .project-row')),pending=new Set(),animations=new Set(),imagePending=new Set(),imageListeners=[];
 const homeProjectRows=Array.from(doc.querySelectorAll('.home .project-row'));
 const workProjectRows=Array.from(doc.querySelectorAll('.index .project-row'));
 // Home project rows use a reversible, scroll-linked pull-up reveal. Other route
 // images keep the one-time entrance treatment so the two motions never fight.
 const images=Array.from(doc.querySelectorAll('.project-image img,.artwork img,.portrait,.detail-cover')).filter(img=>!img.closest('.home,.index'));
 function play(el,frames,duration){
  if(!active||media.matches||typeof el.animate!=='function')return;
  const animation=el.animate(frames,{duration,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
  animations.add(animation);animation.onfinish=()=>animations.delete(animation);
 }
 function revealImage(img){
  if(!imagePending.has(img)||!img.complete||!img.naturalWidth)return;
  const rect=img.getBoundingClientRect();
  if(rect.top>=win.innerHeight-16||rect.bottom<=0)return;
  imagePending.delete(img);
  play(img,[{clipPath:'inset(0 0 85% 0)',translate:'0 48px',opacity:1},{clipPath:'inset(0 0 0% 0)',translate:'0 0',opacity:1}],1100);
 }
 // Never hide an element while waiting for IntersectionObserver.
 // Clipping the observed element to zero area can prevent intersection events.
 function show(el){
  if(!pending.delete(el))return;
  el.classList.add('revealed');observer?.unobserve(el);
  if(!el.matches('.portrait,.detail-cover,.artwork'))play(el,[{transform:'translateY(36px)',opacity:.65},{transform:'translateY(0)',opacity:1}],850);
  for(const img of imagePending)revealImage(img);
 }
 function clearHomeRows(){homeProjectRows.forEach(row=>{row.classList.remove('is-scroll-linked','is-near-viewport');row.style.removeProperty('--project-pull-y');row.style.removeProperty('--project-image-scale')})}
 function clearWorkRows(){workProjectRows.forEach(row=>{row.classList.remove('is-scroll-linked','is-near-viewport');row.style.removeProperty('--work-image-clip');row.style.removeProperty('--work-image-scale');row.style.removeProperty('--work-text-opacity');row.style.removeProperty('--work-text-y')})}
 function updateHomeRows(){
  if(media.matches){clearHomeRows();return}
  const height=Math.max(win.innerHeight,1),start=height*.94,end=win.innerWidth>700?Math.max(height*.08,74):height*.08,distance=Math.max(start-end,1),pullDistance=Math.min(height*.78,760);
  // Read all geometry first, then write styles to avoid layout thrashing.
  const states=homeProjectRows.map(row=>{const rect=row.getBoundingClientRect();return{row,progress:Math.max(0,Math.min(1,(start-rect.top)/distance)),near:rect.bottom>-height*.25&&rect.top<height*1.25}});
  for(const {row,progress,near} of states){
   row.style.setProperty('--project-pull-y',`${(pullDistance*(1-progress)).toFixed(2)}px`);
   row.style.setProperty('--project-image-scale',(.68+.32*progress*progress).toFixed(4));
   row.classList.add('is-scroll-linked');row.classList.toggle('is-near-viewport',near);
  }
 }
 function updateWorkRows(){
  if(media.matches){clearWorkRows();return}
  const height=Math.max(win.innerHeight,1),start=height*.82,end=height*.34,distance=Math.max(start-end,1);
  const states=workProjectRows.map(row=>{const rect=row.getBoundingClientRect();return{row,progress:Math.max(0,Math.min(1,(start-rect.top)/distance)),near:rect.bottom>-height*.2&&rect.top<height*1.15}});
  for(const {row,progress,near} of states){
   const textProgress=Math.max(0,Math.min(1,(progress-.70)/.25));
   row.style.setProperty('--work-image-clip',`${((1-progress)*100).toFixed(2)}%`);
   row.style.setProperty('--work-image-scale',(.42+.58*Math.pow(progress,.72)).toFixed(4));
   row.style.setProperty('--work-text-opacity',textProgress.toFixed(3));
   row.style.setProperty('--work-text-y',`${((1-textProgress)*28).toFixed(2)}px`);
   row.classList.add('is-scroll-linked');row.classList.toggle('is-near-viewport',near);
  }
 }
 function clearHeroMotion(){
  heroTravel=0;
  orbitLayer?.style.removeProperty('--hero-scroll-y');
  baseFace?.classList.remove('mask-ready');
  baseIntro?.classList.remove('mask-ready');
  if(accentFace){
   accentFace.classList.remove('mask-ready');
  }
 }
 function updateHeroMotion(){
  if(!hero||!stage||!orbitLayer||media.matches){clearHeroMotion();return}
  const rect=hero.getBoundingClientRect();
  const maxTravel=Math.max(hero.offsetHeight-stage.offsetHeight,0);
  heroTravel=Math.max(0,Math.min(maxTravel,-rect.top));
  orbitLayer.style.setProperty('--hero-scroll-y',`${(-heroTravel).toFixed(2)}px`);
 }
 function updateHeroMask(){
  if(baseFace&&curve&&mainMaskCircle&&!media.matches){
   const faceRect=baseFace.getBoundingClientRect();
   const rect=curve.getBoundingClientRect();
   const radius=Math.min(rect.width,rect.height)/2;
   mainMaskCircle.setAttribute('cx',(rect.left+rect.width/2-faceRect.left).toFixed(2));
   mainMaskCircle.setAttribute('cy',(rect.top+rect.height/2-faceRect.top).toFixed(2));
   mainMaskCircle.setAttribute('r',radius.toFixed(2));
   baseFace.classList.add('mask-ready');
   if(baseIntro&&mainIntroMaskCircle){
    const introRect=baseIntro.getBoundingClientRect();
    mainIntroMaskCircle.setAttribute('cx',(rect.left+rect.width/2-introRect.left).toFixed(2));
    mainIntroMaskCircle.setAttribute('cy',(rect.top+rect.height/2-introRect.top).toFixed(2));
    mainIntroMaskCircle.setAttribute('r',radius.toFixed(2));
    baseIntro.classList.add('mask-ready');
   }
  }
  if(!accentFace||!circles.length||maskCircles.length!==circles.length||media.matches)return;
  const faceRect=accentFace.getBoundingClientRect();
  circles.forEach((circle,index)=>{
   const rect=circle.getBoundingClientRect();
   const radius=Math.min(rect.width,rect.height)/2;
   const x=rect.left+rect.width/2-faceRect.left;
   const y=rect.top+rect.height/2-faceRect.top;
   maskCircles[index].setAttribute('cx',x.toFixed(2));
   maskCircles[index].setAttribute('cy',y.toFixed(2));
   maskCircles[index].setAttribute('r',radius.toFixed(2));
  });
  accentFace.classList.add('mask-ready');
 }
 function scan(){scrollFrame=0;if(!active)return;updateHeroMotion();updateHeroMask();updateHomeRows();updateWorkRows();for(const el of pending){const rect=el.getBoundingClientRect();if(rect.top<win.innerHeight-16&&rect.bottom>0)show(el)}for(const img of imagePending)revealImage(img)}
 function queueScan(){if(!scrollFrame)scrollFrame=win.requestAnimationFrame(scan)}
 function resetReveal(){
  observer?.disconnect();for(const animation of animations)animation.cancel();animations.clear();pending.clear();imagePending.clear();
  revealed.forEach(el=>el.classList.remove('reveal-ready','revealed'));
  if(media.matches)return;
  images.forEach(img=>imagePending.add(img));
  if(win.IntersectionObserver)observer=new win.IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)show(entry.target)},{threshold:0,rootMargin:'0px 0px -16px 0px'});
  for(const el of revealed){pending.add(el);observer?.observe(el)}scan();
 }
 images.forEach(img=>{const loaded=()=>queueScan();img.addEventListener('load',loaded);imageListeners.push(()=>img.removeEventListener('load',loaded))});
 win.addEventListener('scroll',queueScan,{passive:true});win.addEventListener('resize',queueScan,{passive:true});
 function move(event){if(media.matches||event.pointerType==='touch'||!hero)return;const rect=hero.getBoundingClientRect();if(rect.bottom<0||rect.top>win.innerHeight)return;pointerPositions=offsets(event.clientX,event.clientY,win.innerWidth,win.innerHeight);if(curve){const point=pointerPositions[0];curve.style.transform=`translate3d(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px,0)`}circles.forEach((circle,i)=>{const point=pointerPositions[i+1]||{x:0,y:0};circle.style.transform=`translate3d(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px,0)`});queueScan()}
 function resetCircles(){pointerPositions=Array.from({length:circles.length+1},()=>({x:0,y:0}));curve?.style.removeProperty('transform');circles.forEach(circle=>circle.style.removeProperty('transform'));queueScan()}
 function magnetic(event){if(media.matches||event.pointerType==='touch'||!sayHi)return;const rect=footer.getBoundingClientRect(),dx=event.clientX-rect.left-rect.width/2,dy=event.clientY-rect.top-rect.height*.5;sayHi.style.transform=`translate(${Math.max(-45,Math.min(45,dx*.12))}px,${Math.max(-30,Math.min(30,dy*.1))}px)`}
 function resetMagnet(){sayHi?.style.removeProperty('transform')}
 function preference(){resetCircles();resetMagnet();clearHeroMotion();clearHomeRows();clearWorkRows();resetReveal();queueScan()}
 hero?.addEventListener('pointermove',move,{passive:true});hero?.addEventListener('pointerleave',resetCircles);footer?.addEventListener('pointermove',magnetic,{passive:true});footer?.addEventListener('pointerleave',resetMagnet);media.addEventListener?.('change',preference);doc.fonts?.ready?.then(()=>{if(active)queueScan()});resetReveal();
 return ()=>{active=false;imageListeners.forEach(remove=>remove());imagePending.clear();clearHeroMotion();clearHomeRows();clearWorkRows();win.cancelAnimationFrame(scrollFrame);win.removeEventListener('scroll',queueScan);win.removeEventListener('resize',queueScan);for(const animation of animations)animation.cancel();animations.clear();observer?.disconnect();hero?.removeEventListener('pointermove',move);hero?.removeEventListener('pointerleave',resetCircles);footer?.removeEventListener('pointermove',magnetic);footer?.removeEventListener('pointerleave',resetMagnet);media.removeEventListener?.('change',preference)};
}
root.PortfolioMotion={mount,offsets};
})(typeof window!=='undefined'?window:globalThis);

