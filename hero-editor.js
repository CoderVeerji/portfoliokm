(() => {
  'use strict';

  const layer = (text,x,y,size,width,extra={}) => ({
    text,x,y,size,width,font:'Unbounded',weight:300,color:'#26141A',align:'center',
    letter:0,line:1,opacity:100,rotate:0,z:5,visible:true,border:0,
    borderColor:'#26141A',radius:0,padding:0,fill:false,background:'#FFFFFF',
    whiteSpace:'nowrap',...extra
  });

  const defaults = {
    desktop:{
      canvasHeight:56,navX:50,navY:0,navWidth:100,headerHeight:7,headerRadius:0,headerOpacity:100,headerBorder:0,headerBorderColor:'#DBCCB5',headerBg:'#26141A',heroBg:'#FFFFFF',pageBg:'#26141A',curveLeft:54,curveCenter:64,curveRight:54,
      elements:{
        brand:layer('Kashish Goel',5,3.5,11,14,{align:'left',color:'#DBCCB5',z:8}),
        work:layer('Work',45.5,3.5,11,7,{color:'#DBCCB5',z:8}),
        about:layer('About',50.5,3.5,11,7,{color:'#DBCCB5',z:8}),
        contact:layer('Contact',55.5,3.5,11,8,{color:'#DBCCB5',z:8}),
        instagram:layer('◎ Instagram',95,3.5,11,14,{align:'right',color:'#DBCCB5',z:8}),
        name:layer('KASHISH GOEL',50,20,112,90,{letter:-7,line:.86}),
        role1:layer('INTERIOR DESIGNER',20,32,14,25),
        role2:layer('SPATIAL DESIGNER',50,32,14,25),
        role3:layer('FABRIC & FURNISHING STYLIST',80,32,14,31),
        intro:layer('Interior designer and stylist whose path spans Amity University, Hans & Associates and an MA in Edinburgh, with a focus on sensory, context-led homes at Sable House Studio.',16,43,12,23,{font:'Poppins',align:'left',line:1.35,whiteSpace:'normal',border:1,borderColor:'#9B8F8F',radius:4,padding:8})
      }
    },
    mobile:{
      canvasHeight:178,navX:50,navY:0,navWidth:100,headerHeight:7,headerRadius:0,headerOpacity:100,headerBorder:0,headerBorderColor:'#DBCCB5',headerBg:'#26141A',heroBg:'#FFFFFF',pageBg:'#26141A',curveLeft:70,curveCenter:77,curveRight:70,
      elements:{
        brand:layer('Kashish Goel',5,3.5,8,32,{align:'left',color:'#DBCCB5',z:8}),
        work:layer('Work',43,3.5,8,13,{color:'#DBCCB5',z:8}),
        about:layer('About',56,3.5,8,13,{color:'#DBCCB5',z:8}),
        contact:layer('Contact',70,3.5,8,15,{color:'#DBCCB5',z:8}),
        instagram:layer('◎',94,3.5,10,10,{align:'right',color:'#DBCCB5',z:8}),
        name:layer('KASHISH GOEL',50,17,42,94,{letter:-3,line:.9}),
        role1:layer('INTERIOR DESIGNER',50,25,10,82),
        role2:layer('SPATIAL DESIGNER',50,29,10,82),
        role3:layer('FABRIC & FURNISHING STYLIST',50,33,9,90),
        intro:layer('Interior designer and stylist whose path spans Amity University, Hans & Associates and an MA in Edinburgh, with a focus on sensory, context-led homes at Sable House Studio.',50,47,11,78,{font:'Poppins',align:'left',line:1.35,whiteSpace:'normal',border:1,borderColor:'#9B8F8F',radius:4,padding:8})
      }
    }
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  let settings;
  try { settings = JSON.parse(localStorage.getItem('kashishHeroEditorV3')) || clone(defaults); }
  catch { settings = clone(defaults); }
  for (const mode of ['desktop','mobile']) {
    settings[mode] ||= clone(defaults[mode]);
    settings[mode].elements ||= {};
    for (const [key,value] of Object.entries(defaults[mode])) {
      if (key !== 'elements' && settings[mode][key] == null) settings[mode][key] = value;
    }
    for (const [key,value] of Object.entries(defaults[mode].elements)) {
      settings[mode].elements[key] = {...clone(value), ...(settings[mode].elements[key] || {})};
    }
  }

  const $ = id => document.getElementById(id);
  const canvas=$('canvas'),svg=$('hero-shape'),path=$('hero-path'),headerShape=$('header-shape'),result=$('result'),elementSelect=$('element-select');
  const elementNodes=[...canvas.querySelectorAll('.editable-element')];
  const rangeKeys=['x','y','size','width','rotate','z','letter','line','opacity','border','radius','padding'];
  const curveKeys=['curveLeft','curveCenter','curveRight'];
  const globalRangeKeys=['canvasHeight','navX','navY','navWidth','headerHeight','headerRadius','headerOpacity','headerBorder'];
  const selectKeys=['font','weight','align'];
  const colorKeys=['color','borderColor','background'];
  let device='desktop',selected='name',drag=null;
  const mode=()=>settings[device],item=()=>mode().elements[selected],pct=n=>`${Number(n).toFixed(1)}%`;
  const save=()=>localStorage.setItem('kashishHeroEditorV3',JSON.stringify(settings));

  function setOutput(key,value){
    const output=$(`${key}-output`);if(!output)return;
    const units={x:'%',y:'%',size:'px',width:'%',rotate:'°',z:'',letter:'px',line:'',opacity:'%',border:'px',radius:'px',padding:'px',curveLeft:'%',curveCenter:'%',curveRight:'%',canvasHeight:'%',navX:'%',navY:'%',navWidth:'%',headerHeight:'%',headerRadius:'px',headerOpacity:'%',headerBorder:'px'};
    output.value=`${Number(value).toFixed(['x','y','width','letter','line','curveLeft','curveCenter','curveRight','navX','navY','navWidth','headerHeight','headerBorder'].includes(key)?1:0)}${units[key]}`;
  }

  function updateCanvas(){
    const data=mode();
    canvas.style.background=data.pageBg;
    headerShape.style.setProperty('--nav-left',`${data.navX}%`);
    headerShape.style.setProperty('--nav-top',`${data.navY}%`);
    headerShape.style.setProperty('--nav-width',`${data.navWidth}%`);
    headerShape.style.setProperty('--nav-height',`${data.headerHeight}%`);
    headerShape.style.setProperty('--nav-radius',`${data.headerRadius}px`);
    headerShape.style.setProperty('--nav-opacity',data.headerOpacity/100);
    headerShape.style.setProperty('--nav-border',`${data.headerBorder}px`);
    headerShape.style.setProperty('--nav-border-color',data.headerBorderColor);
    headerShape.style.setProperty('--header-bg',data.headerBg);
    const width=canvas.getBoundingClientRect().width;
    canvas.style.height=`${width*data.canvasHeight/100}px`;
    const height=canvas.getBoundingClientRect().height,left=height*data.curveLeft/100,center=height*data.curveCenter/100,right=height*data.curveRight/100,control=2*center-(left+right)/2;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    path.setAttribute('d',`M0 0H${width}V${right} Q${width/2} ${control} 0 ${left}Z`);
    path.setAttribute('fill',data.heroBg);
    for(const key of curveKeys)canvas.style.setProperty(`--${key.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}`,`${data[key]}%`);
  }

  function render(){
    canvas.classList.toggle('mobile',device==='mobile');
    for(const node of elementNodes){
      const data=mode().elements[node.dataset.key],style=node.style;
      style.setProperty('--x',`${data.x}%`);style.setProperty('--y',`${data.y}%`);style.setProperty('--w',`${data.width}%`);style.setProperty('--size',`${data.size}px`);style.setProperty('--font',data.font);style.setProperty('--weight',data.weight);style.setProperty('--color',data.color);style.setProperty('--align',data.align);style.setProperty('--letter',`${data.letter}px`);style.setProperty('--line',data.line);style.setProperty('--opacity',data.opacity/100);style.setProperty('--rotate',`${data.rotate}deg`);style.setProperty('--z',data.z);style.setProperty('--border',`${data.border}px`);style.setProperty('--border-color',data.borderColor);style.setProperty('--radius',`${data.radius}px`);style.setProperty('--padding',`${data.padding}px`);style.setProperty('--background',data.fill?data.background:'transparent');style.setProperty('--white-space',data.whiteSpace);
      node.classList.toggle('selected',node.dataset.key===selected);node.classList.toggle('hidden-layer',!data.visible);node.hidden=false;
      const content=node.querySelector('.content');if(document.activeElement!==content)content.textContent=data.text;
    }
    elementSelect.value=selected;$('text').value=item().text;$('visible').checked=item().visible;$('fill').checked=item().fill;
    for(const key of rangeKeys){$(key).value=item()[key];setOutput(key,item()[key])}
    for(const key of selectKeys)$(key).value=String(item()[key]);
    for(const key of colorKeys)$(key).value=item()[key];
    for(const key of curveKeys){$(key).value=mode()[key];setOutput(key,mode()[key])}
    for(const key of globalRangeKeys){$(key).value=mode()[key];setOutput(key,mode()[key])}
    for(const key of ['headerBg','headerBorderColor','heroBg','pageBg'])$(key).value=mode()[key];
    document.querySelectorAll('[data-device]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.device===device)));
    result.value=JSON.stringify(settings,null,2);save();requestAnimationFrame(updateCanvas);
  }

  function selectLayer(key){selected=key;render()}

  for(const node of elementNodes){
    const key=node.dataset.key,content=node.querySelector('.content'),grip=node.querySelector('.resize-handle');
    node.addEventListener('pointerdown',event=>{
      if(event.target===grip||content.isContentEditable)return;event.preventDefault();selectLayer(key);
      const rect=canvas.getBoundingClientRect(),data=item();drag={type:'move',id:event.pointerId,dx:event.clientX-(rect.left+rect.width*data.x/100),dy:event.clientY-(rect.top+rect.height*data.y/100)};
    });
    grip.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();selectLayer(key);const data=item();drag={type:'resize',id:event.pointerId,startX:event.clientX,startY:event.clientY,startWidth:data.width,startSize:data.size}});
    node.addEventListener('dblclick',event=>{event.preventDefault();event.stopPropagation();selectLayer(key);content.contentEditable='true';content.focus();document.getSelection()?.selectAllChildren(content)});
    content.addEventListener('blur',()=>{mode().elements[key].text=content.textContent.trim()||defaults[device].elements[key].text;content.removeAttribute('contenteditable');render()});
    content.addEventListener('keydown',event=>{if(event.key==='Escape'||(event.key==='Enter'&&key!=='intro')){event.preventDefault();content.blur()}});
  }

  const navResize=$('nav-resize-handle');
  headerShape.addEventListener('pointerdown',event=>{
    if(event.target===navResize)return;event.preventDefault();event.stopPropagation();
    drag={type:'navMove',id:event.pointerId,startX:event.clientX,startY:event.clientY,startNavX:mode().navX,startNavY:mode().navY};
  });
  navResize.addEventListener('pointerdown',event=>{
    event.preventDefault();event.stopPropagation();
    drag={type:'navResize',id:event.pointerId,startX:event.clientX,startY:event.clientY,startWidth:mode().navWidth,startHeight:mode().headerHeight};
  });
  canvas.querySelectorAll('[data-curve]').forEach(handle=>handle.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();drag={type:'curve',id:event.pointerId,key:handle.dataset.curve}}));

  addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;const rect=canvas.getBoundingClientRect();
    if(drag.type==='navMove'){mode().navX=Math.max(-20,Math.min(120,drag.startNavX+(event.clientX-drag.startX)/rect.width*100));mode().navY=Math.max(-20,Math.min(100,drag.startNavY+(event.clientY-drag.startY)/rect.height*100))}
    else if(drag.type==='navResize'){mode().navWidth=Math.max(10,Math.min(140,drag.startWidth+(event.clientX-drag.startX)/rect.width*200));mode().headerHeight=Math.max(2,Math.min(40,drag.startHeight+(event.clientY-drag.startY)/rect.height*100))}
    else if(drag.type==='curve')mode()[drag.key]=Math.max(0,Math.min(110,(event.clientY-rect.top)/rect.height*100));
    else if(drag.type==='resize'){const data=item(),dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;data.width=Math.max(2,Math.min(140,drag.startWidth+dx/rect.width*100));data.size=Math.max(5,Math.min(260,drag.startSize+(dx+dy)*.18))}
    else{const data=item();data.x=Math.max(-20,Math.min(120,(event.clientX-rect.left-drag.dx)/rect.width*100));data.y=Math.max(-20,Math.min(120,(event.clientY-rect.top-drag.dy)/rect.height*100))}
    render();
  });
  const endDrag=event=>{if(drag?.id===event.pointerId)drag=null};addEventListener('pointerup',endDrag);addEventListener('pointercancel',endDrag);addEventListener('resize',()=>requestAnimationFrame(updateCanvas));

  elementSelect.addEventListener('change',()=>selectLayer(elementSelect.value));
  $('text').addEventListener('input',()=>{item().text=$('text').value;render()});
  $('visible').addEventListener('change',()=>{item().visible=$('visible').checked;render()});
  $('fill').addEventListener('change',()=>{item().fill=$('fill').checked;render()});
  for(const key of rangeKeys)$(key).addEventListener('input',()=>{item()[key]=Number($(key).value);render()});
  for(const key of selectKeys)$(key).addEventListener('change',()=>{item()[key]=key==='weight'?Number($(key).value):$(key).value;render()});
  for(const key of colorKeys)$(key).addEventListener('input',()=>{item()[key]=$(key).value;render()});
  for(const key of curveKeys)$(key).addEventListener('input',()=>{mode()[key]=Number($(key).value);render()});
  for(const key of globalRangeKeys)$(key).addEventListener('input',()=>{mode()[key]=Number($(key).value);render()});
  for(const key of ['headerBg','headerBorderColor','heroBg','pageBg'])$(key).addEventListener('input',()=>{mode()[key]=$(key).value;render()});
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{device=button.dataset.device;render()}));
  $('reset-element').addEventListener('click',()=>{mode().elements[selected]=clone(defaults[device].elements[selected]);render()});
  $('reset-all').addEventListener('click',()=>{settings[device]=clone(defaults[device]);render()});
  $('copy').addEventListener('click',async()=>{const text=`KASHISH COMPLETE HERO SETTINGS\n${JSON.stringify(settings,null,2)}`;try{await navigator.clipboard.writeText(text)}catch{result.focus();result.select();document.execCommand('copy')}const toast=document.createElement('div');toast.className='toast';toast.textContent='Complete settings copied — chat mein paste kar do';document.body.append(toast);setTimeout(()=>toast.remove(),2600)});
  addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select,[contenteditable]'))return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?0.1:1,data=item();if(event.key==='ArrowLeft')data.x-=step;if(event.key==='ArrowRight')data.x+=step;if(event.key==='ArrowUp')data.y-=step;if(event.key==='ArrowDown')data.y+=step;render()});

  render();
})();
