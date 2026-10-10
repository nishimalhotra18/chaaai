/* Dobby's Workshop — handcrafted 3D art room, inspired by the supplied reference screenshots.
   Uses original procedural art and editable Three.js objects, not flattened screenshots. */
export function installCozyWorkshop({THREE,scene,renderer,interactives,livingFrames,addInteractive,say}){
  // Keep the existing Hogwarts living frames / licensed Dumbledore photo, replacing only the workshop environment.
  const portraits=(livingFrames||[]).map(p=>p);
  scene.clear();
  interactives.length=0;
  scene.background=new THREE.Color(0x171b19);
  scene.fog=new THREE.FogExp2(0x171b19,.007);
  renderer.toneMappingExposure=1.13;
  const objects=[], anim=[];
  const M=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const dark=M(0x171c1c,.99), walnut=M(0x67432d,.75), walnutDark=M(0x3a291f,.86),
        woodTrim=M(0x8e6543,.75), deskMat=M(0x765442,.8),cream=M(0xe8e0d0,.89),
        paper=M(0xe9e5da,.95), gray=M(0x9da6a0,.79),blue=M(0x075ecf,.4,.06),
        sage=M(0x496e50,.8),orange=M(0xef8e34,.52),black=M(0x141718,.86),
        gold=M(0xd09c5a,.48,.4),pink=M(0xe79db3,.74),silver=M(0xbfc7c0,.38,.5);
  function tex(draw,w=512,h=512){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d'); draw(g,w,h);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
    return t;
  }
  function fill(g,w,h,color){g.fillStyle=color;g.fillRect(0,0,w,h)}
  function type(g,words,x,y,size=48,color='#252a28',font='900',align='left'){
    g.fillStyle=color;g.textAlign=align;g.font=font+' '+size+'px Arial, sans-serif';
    g.fillText(words,x,y);
  }
  function applyNoise(g,w,h,amt=650){
    for(let i=0;i<amt;i++){
      const x=(i*137.123)%w,y=(i*91.7)%h;
      g.fillStyle=i%3?'rgba(0,0,0,.045)':'rgba(255,255,255,.07)';
      g.fillRect(x,y,1+(i%3),1+(i%3));
    }
  }
  function geo(g,m,x,y,z,parent=scene){
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;
    parent.add(o);objects.push(o);return o;
  }
  function cube(w,h,d,m,x,y,z,parent){return geo(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent)}
  function orb(r,m,x,y,z,parent,scale){const o=geo(new THREE.SphereGeometry(r,16,12),m,x,y,z,parent);if(scale)o.scale.set(...scale);return o}
  function cylinder(rt,rb,h,m,x,y,z,parent){return geo(new THREE.CylinderGeometry(rt,rb,h,22),m,x,y,z,parent)}
  function plane(w,h,m,x,y,z,ry=0,parent){const o=geo(new THREE.PlaneGeometry(w,h),m,x,y,z,parent);o.rotation.y=ry;return o}
  function artPlane(w,h,draw,x,y,z,ry=0,parent){const t=tex(draw,512,640);
    const m=new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});return plane(w,h,m,x,y,z,ry,parent);
  }
  function screen(w,h,draw,x,y,z,ry=0){return artPlane(w,h,draw,x,y,z,ry)}
  function handle(obj,name,message){addInteractive(obj,name,()=>say(message,4000));return obj}
  function lineCylinder(a,b,r,m,parent=scene){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const v=end.clone().sub(start),o=geo(new THREE.CylinderGeometry(r,r,v.length(),8),m,...start.clone().add(end).multiplyScalar(.5).toArray(),parent);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;
  }
  // Room shell: matte charcoal, warm oak floor, high ceiling and both visible side walls.
  cube(16,.34,11,M(0x302c27),0,-.19,-.45);
  cube(16,8.4,.3,dark,0,4.0,-5.25);
  cube(.34,8.4,11,dark,-7.80,4.0,-.4);
  cube(.34,8.4,11,dark,7.80,4.0,-.4);
  cube(16,.3,11,M(0x242525),0,8.12,-.4);
  cube(16,.15,.22,walnutDark,0,.25,-5.05);
  // Subtle visible wood planks and baseboard.
  for(let i=0;i<18;i++)cube(.04,.012,10,M(i%3===0?0x49372e:0x372b25),-7.4+i*.83,.012,-.45);
  const top=tex((g,w,h)=>{
    fill(g,w,h,'#795443');
    for(let i=0;i<110;i++){
      const yy=(i*61.17)%h;
      g.strokeStyle=i%5?'rgba(27,11,9,.06)':'rgba(243,203,161,.085)';
      g.lineWidth=1+(i%3);g.beginPath();g.moveTo(0,yy);
      g.bezierCurveTo(w*.23,yy+7,w*.71,yy-10,w,yy+3);g.stroke();
    }applyNoise(g,w,h,1300);
  });
  const tableWood=new THREE.MeshStandardMaterial({map:top,roughness:.84});
  // Main large table. Foreground intentionally fills the lower part of the camera, like the reference.
  const desk=cube(15,.31,5.4,tableWood,0,1.27,1.65);
  cube(14.85,.08,.11,walnutDark,0,1.09,4.37);
  for(const x of [-6.7,6.7])cube(.38,1.30,.5,walnutDark,x,.61,3.95);
  // Rear low TV table
  cube(4.40,.19,.85,deskMat,.17,1.96,-4.39);
  for(const x of [-1.7,1.9])cube(.12,1.55,.60,walnutDark,x,1.13,-4.42);
  cube(4.17,.06,.7,walnutDark,.15,1.36,-4.40);
  // Old CRT with depth, bezel, bottom controls and dark curved glass.
  const tvGroup=new THREE.Group();scene.add(tvGroup);
  tvGroup.position.set(.2,2.13,-4.36);
  cube(1.94,1.62,1.03,M(0x252827,.67),0,.83,-.05,tvGroup);
  cube(1.69,1.14,.045,M(0x101616,.21,.23),0,.98,.49,tvGroup);
  cube(1.57,1.02,.005,new THREE.MeshPhysicalMaterial({color:0x081012,roughness:.1,metalness:.21,clearcoat:1,clearcoatRoughness:.12}),0,1.00,.525,tvGroup);
  cube(1.68,.28,.07,M(0x2a2f2c),0,.21,.505,tvGroup);
  for(let x of [-.74,-.54,-.32])cylinder(.055,.055,.04,M(0x0b1111,.4),x,.22,.56,tvGroup).rotation.x=Math.PI/2;
  const screenGlow=new THREE.PointLight(0x9bdacf,.4,2.5);screenGlow.position.set(0,1,.6);tvGroup.add(screenGlow);
  handle(tvGroup.children[2],'RETRO MONITOR','Dobby uses this to monitor Master Chai. The screen mostly says: still working.');
  // Two open wooden shelving towers on either side of the TV.
  function shelf(x,z=-4.60,height=4.7,width=1.67){
    const g=new THREE.Group();g.position.set(x,1.80,z);scene.add(g);
    for(const sx of [-width/2,width/2])cube(.13,height,.57,walnut,sx,height/2,0,g);
    cube(width+.17,.17,.65,walnut,0,height,0,g);
    for(let y of [0,1.10,2.25,3.39])cube(width+.16,.125,.73,walnut,0,y,0,g);
    // rear panel for extra richness and readable silhouettes
    cube(width-.15,height-.18,.05,walnutDark,0,height/2,-.28,g);
    return g;
  }
  const leftShelf=shelf(-3.25),rightShelf=shelf(3.3);
  // Books with unique spines, top shelf boxes, picture frames and tiny hidden objects.
  let seed=3981;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
  const bookColors=[0x986b4a,0x386564,0x53617a,0xc08b54,0x8b4949,0xb4ad80,0x625b66];
  function books(parent,x0,y0,z0,count=10){
    let x=x0;for(let i=0;i<count;i++){
      const h=.35+rand()*.42,w=.085+rand()*.075;
      cube(w,h,.29,M(bookColors[i%bookColors.length],.78),x,y0+h/2,z0,parent);
      cube(.014,.05,.3,gold,x,y0+h*.66,z0+.01,parent);x+=w+.012;
    }
  }
  books(rightShelf,-.61,2.36,.16,11);books(rightShelf,-.63,3.51,.17,9);
  books(rightShelf,-.65,.08,.13,10);books(leftShelf,-.68,3.49,.13,11);
  cube(.60,.34,.48,cream,-.35,4.93,-4.50);
  cube(.55,.13,.47,orange,-.34,4.63,-4.47);
  // Printer on left shelf
  cube(1.23,.53,.52,M(0xdbdfda),-3.25,2.42,-4.34);
  cube(1.18,.04,.39,cream,-3.25,2.77,-4.34);
  cube(.8,.04,.09,black,-3.25,2.46,-3.99);
  cube(.93,.07,.42,cream,-3.25,2.70,-4.30);
  // Shelf radio, speaker, lava lamp and Rubik's cube.
  cube(.85,.45,.36,black,3.32,3.57,-4.16);
  for(let i=0;i<13;i++)cube(.012,.24,.007,M(0x4d5952),3.06+i*.042,3.55,-3.972);
  orb(.13,black,3.68,3.53,-3.93);
  const lava=new THREE.Group();scene.add(lava);lava.position.set(2.93,2.42,-4.15);
  cylinder(.17,.22,.10,walnutDark,0,0,0,lava);
  cylinder(.13,.22,.73,new THREE.MeshPhysicalMaterial({color:0xef7725,roughness:.2,transparent:true,opacity:.82,transmission:.12}),0,.42,0,lava);
  cylinder(.20,.13,.13,walnutDark,0,.84,0,lava);
  for(let i=0;i<4;i++)orb(.085+rand()*.04,new THREE.MeshStandardMaterial({color:0xffb047,emissive:0xef711a,emissiveIntensity:1.5}),0,.25+i*.15,.11,lava,[1,1.35,1]);
  const lavaLight=new THREE.PointLight(0xff7e30,5,2.3);lavaLight.position.set(0,.44,.18);lava.add(lavaLight);
  anim.push(t=>{lava.children.filter(o=>o.isMesh&&o.geometry.type==='SphereGeometry').forEach((o,i)=>o.position.y=.25+i*.15+Math.sin(t*.65+i*2)*.11)});
  handle(lava.children[2],'LAVA LAMP','Dobby checked. It is lava, not production traffic. Probably.');
  const rubik=cube(.28,.28,.28,M(0x161716),3.80,2.54,-4.12);
  for(let i=0;i<9;i++)cube(.072,.072,.004,M([0xf3a434,0x1e9c72,0xdd5944,0xf2e4c5,0x458ad5][i%5]),3.69+(i%3)*.106,2.43+Math.floor(i/3)*.105,-3.974);
  // Window and trim on the left, with green hills, fall leaves and tiny Halloween decorations.
  const wx=-6.52,wy=4.0,wz=-5.035;
  const windowPaint=tex((g,w,h)=>{
    const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#7ba9ad');sky.addColorStop(.7,'#b2c3a2');sky.addColorStop(1,'#4d9042');
    g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle='#528646';g.beginPath();g.ellipse(w*.51,h*.93,w*.8,h*.38,0,0,7);g.fill();
    g.fillStyle='#374b28';for(let i=0;i<9;i++){let x=(i*67)%w,y=400+i%3*20;g.beginPath();g.arc(x,y,24,0,7);g.fill()}
    applyNoise(g,w,h,350);
  },512,640);
  plane(2.15,3.26,new THREE.MeshBasicMaterial({map:windowPaint,side:THREE.DoubleSide}),wx,wy,wz+.12);
  for(const dx of [-1.11,1.11])cube(.18,3.55,.16,woodTrim,wx+dx,wy,wz+.25);
  for(const dy of [-1.72,1.72])cube(2.38,.16,.18,woodTrim,wx,wy+dy,wz+.25);
  cube(.12,3.4,.16,woodTrim,wx,wy,wz+.33);
  cube(2.22,.10,.12,woodTrim,wx,wy+.28,wz+.34);
  cube(2.65,.18,.48,walnut,wx,wy-1.79,wz+.40);
  // Halloween window stickers (small ghost and pumpkin).
  const stickers=tex((g,w,h)=>{
    g.clearRect(0,0,w,h);
    g.fillStyle='#f5f6e8';g.beginPath();g.arc(150,190,85,Math.PI,0);g.lineTo(236,315);g.lineTo(195,280);g.lineTo(165,315);g.lineTo(136,280);g.lineTo(95,315);g.closePath();g.fill();
    g.fillStyle='#22252a';g.beginPath();g.ellipse(125,186,9,18,0,0,7);g.ellipse(175,186,9,18,0,0,7);g.fill();
    g.fillStyle='#ed8d30';g.beginPath();g.ellipse(395,385,68,57,0,0,7);g.fill();
    g.fillStyle='#594126';g.fillRect(389,320,12,29);g.fillStyle='#1a201c';g.fillRect(363,377,13,12);g.fillRect(406,377,13,12);
  },512,640);
  plane(.9,1.09,new THREE.MeshBasicMaterial({map:stickers,transparent:true,side:THREE.DoubleSide}),-6.45,4.2,wz+.44);
  // Vine and little potted plants around the window/fridge.
  const leaf=M(0x4d8150,.89);
  for(let i=0;i<18;i++){
    const x=-5.65+Math.sin(i*.46)*.38,y=6.7-i*.18;
    orb(.08,leaf,x,y,-4.70,undefined,[1,.52,.32]);
    if(i)lineCylinder([-5.65+Math.sin((i-1)*.46)*.38,6.7-(i-1)*.18,-4.73],[x,y,-4.73],.014,leaf);
  }
  // Fridge: exact visual anchor on the left (blue-grey 2-door mini fridge with dozens of decals).
  cube(1.68,2.25,1.18,M(0xa7bab9,.58,.12),-5.65,1.68,-3.85);
  cube(1.64,.08,1.24,walnutDark,-5.65,.52,-3.84);
  cube(1.62,.055,1.20,black,-5.65,1.55,-3.21);
  cube(.29,.09,.06,M(0x4b5855),-5.15,2.17,-3.20);
  cube(.29,.09,.06,M(0x4b5855),-5.15,.92,-3.20);
  function decal(x,y,w,h,bg,title){
    screen(w,h,(g,W,H)=>{
      fill(g,W,H,bg);
      g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=10;g.strokeRect(10,10,W-20,H-20);
      type(g,title,W/2,H*.56,Math.min(115,W/(title.length*.6)),'#f4edd8','900','center');
      applyNoise(g,W,H,230);
    },x,y,-3.199);
  }
  const stickerWords=['CHAI','HEY','⚡','HELLO','42','NICE','★','BUG','WOW','IO','✿',': )'];
  const stickerColors=['#4b6d7a','#c5625d','#edaa4b','#4d7c5b','#5968a9'];
  for(let i=0;i<12;i++){
    const x=-6.24+(i%3)*.39+(rand()-.5)*.08;
    const y=2.37-Math.floor(i/3)*.47+(rand()-.5)*.05;
    decal(x,y,.24+rand()*.10,.21+rand()*.05,stickerColors[i%5],stickerWords[i]);
  }
  // Posters and art on back wall — irregular gallery clustering with white, wood and gold frames.
  function framedArt(x,y,w,h,fn,frameMat=walnut,depth=.075){
    const border=cube(w+.13,h+.13,depth,frameMat,x,y,-4.986);
    cube(w+.035,h+.035,.018,cream,x,y,-4.936);
    const work=screen(w,h,fn,x,y,-4.920);
    return {border,work};
  }
  const poster=framedArt(-5.24,5.47,1.68,2.34,(g,w,h)=>{
    fill(g,w,h,'#e9eae1');type(g,'MAKE',w/2,145,91,'#233a45','900','center');
    type(g,'ART',w/2,258,122,'#bd653f','bold','center');
    type(g,'EVERY',w/2,377,87,'#263443','900','center');
    type(g,'DAY',w/2,481,114,'#233a45','900','center');
    g.strokeStyle='#dc5b42';g.lineWidth=8;g.beginPath();g.ellipse(w*.52,330,220,100,-.2,0,7);g.stroke();
    type(g,'MAKE SOMETHING TODAY',w/2,570,19,'#6c7d79','bold','center');applyNoise(g,w,h,700);
  },M(0x534839));
  handle(poster.work,'MAKE ART EVERY DAY','Master Chai prefers making systems every day. Dobby recommends naps instead.');
  // Center gallery art frames, custom drawings rather than copying another artist's work.
  function abstractArt(bg,accent,style){
    return (g,w,h)=>{
      fill(g,w,h,bg);
      for(let i=0;i<13;i++){
        let x=(i*143+87)%w,y=(i*113+55)%h;
        g.fillStyle=[accent,'#dacba9','#556958','#b97552'][i%4];
        if(style==='circles'){g.beginPath();g.arc(x,y,15+(i%4)*13,0,7);g.fill()}
        else {g.save();g.translate(x,y);g.rotate(i*.41);g.fillRect(-22,-29,34+(i%3)*22,70);g.restore()}
      }
      g.strokeStyle='rgba(255,255,255,.36)';g.lineWidth=3;
      for(let i=0;i<5;i++)g.strokeRect(32+i*16,35+i*22,285,190);
      applyNoise(g,w,h,490);
    };
  }
  framedArt(-1.17,6.59,.60,.75,abstractArt('#e5dbc6','#886946','circles'),walnut);
  framedArt(.15,6.25,1.16,1.46,abstractArt('#ad7b64','#e1c568','shapes'),walnutDark);
  framedArt(1.53,6.55,.75,.90,abstractArt('#f0eae3','#5791a2','circles'),cream);
  framedArt(1.97,5.35,.84,1.12,abstractArt('#e1ddc7','#9fa269','shapes'),woodTrim);
  framedArt(-.76,5.25,.59,.78,abstractArt('#263d50','#a287c3','circles'),woodTrim);
  framedArt(.67,4.80,.60,.83,abstractArt('#3d5960','#e88e74','shapes'),walnut);
  framedArt(2.75,6.15,.36,.46,abstractArt('#67817b','#f1c167','circles'),walnut);
  // Keep the wizard paintings from the prior task, as a smaller animated gallery along the lower wall.
  const frameLocations=[[-1.05,4.15,.48],[.00,4.05,.48],[1.13,4.12,.46],[2.10,4.00,.43]];
  portraits.forEach((p,i)=>{
    const [x,y,s]=frameLocations[i]||[i*.5,4.15,.44];
    p.frame.position.set(x,y,-4.84);
    p.frame.scale.setScalar(s);
    scene.add(p.frame);
    if(p.hit)interactives.push(p.hit);
  });
  // "OPEN" neon sign, using multiple glowing text layers and luminous tubes.
  const neonText=tex((g,w,h)=>{
    g.clearRect(0,0,w,h);
    g.textAlign='center';g.font='italic 118px Arial, sans-serif';
    g.shadowColor='#ff6a55';g.shadowBlur=37;g.strokeStyle='#ff5b54';g.lineWidth=8;g.strokeText('OPEN',w/2,158);
    g.shadowBlur=0;g.strokeStyle='#ffaca0';g.lineWidth=2;g.strokeText('OPEN',w/2,158);
    g.strokeStyle='#3a84e5';g.lineWidth=7;g.beginPath();g.ellipse(w/2,130,188,92,0,.83,2.3);g.stroke();
  },512,250);
  const neon=plane(1.90,.94,new THREE.MeshBasicMaterial({map:neonText,transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,7.21,-4.89);
  const neonLight=new THREE.PointLight(0xf46c59,10,6);neonLight.position.set(0,6.7,-4.4);scene.add(neonLight);
  anim.push(t=>{neonLight.intensity=9.5+Math.sin(t*6)*.5});
  // Orange mushroom desk lamp above the RIGHT shelf, practical warm bounce.
  const lamp=new THREE.Group();lamp.position.set(3.38,6.33,-4.37);scene.add(lamp);
  cylinder(.15,.34,.46,orange,0,.19,0,lamp);
  cylinder(.63,.52,.15,orange,0,.53,0,lamp);
  orb(.59,orange,0,.60,0,lamp,[1,.38,1]);
  const lampLight=new THREE.PointLight(0xffb266,16,5.5);lampLight.position.set(0,.25,.38);lamp.add(lampLight);
  handle(lamp.children[1],'MUSHROOM LAMP','Dobby adjusted this lamp exactly seven times. The seventh was correct.');
  // Retro date clock on the upper right.
  cube(1.15,.92,.10,M(0x1d483d,.65),5.27,6.25,-4.99);
  const cdate=new Date(),days=['SUN','MON','TUE','WED','THU','FRI','SAT'],mons=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const hour12=cdate.getHours()%12||12,minute=String(cdate.getMinutes()).padStart(2,'0');
  const clockFace=screen(1.0,.77,(g,w,h)=>{
    fill(g,w,h,'#16382c');const tile=(x,y,ww,hh,str)=>{
      g.fillStyle='#e1f2cf';g.fillRect(x,y,ww,hh);
      type(g,str,x+ww/2,y+hh*.74,Math.min(93,ww/str.length*1.3),'#184c43','900','center');
    };
    tile(11,12,150,240,days[cdate.getDay()]);tile(174,12,102,240,String(cdate.getDate()));
    tile(291,12,210,240,mons[cdate.getMonth()]);
    tile(11,269,230,340,String(hour12));tile(256,269,245,340,minute);
  },5.27,6.25,-4.90);
  // Large whiteboard on right with casual drawn instructions.
  const board=framedArt(5.55,4.32,2.18,2.52,(g,w,h)=>{
    fill(g,w,h,'#e1e6e4');
    type(g,'TO-DO',w/2,101,70,'#273b42','bold','center');
    g.strokeStyle='#222b31';g.lineWidth=7;g.beginPath();g.moveTo(130,128);g.lineTo(384,128);g.stroke();
    ['WATCH SOME TV','MOVE SOME PIXELS','MAKE SOMETHING','FIND MASTER CHAI'].forEach((t,i)=>{
      type(g,t,38,215+i*99,27,'#5a7180','600');
    });
    g.strokeStyle='#c45e56';g.lineWidth=5;g.beginPath();g.moveTo(70,525);g.lineTo(442,525);g.stroke();
  },M(0x879797,.45));
  handle(board.work,'TO-DO BOARD','One of the tasks is find Master Chai. Dobby considers it a recurring incident.');
  // Other wall prints, on the right-hand side.
  const cozy=framedArt(7.06,6.43,.71,1.15,(g,w,h)=>{
    fill(g,w,h,'#286044');type(g,'SO',w/2,225,90,'#ecf2d1','400','center');
    type(g,'COZY',w/2,358,88,'#ecf2d1','400','center');},walnut);
  framedArt(7.06,4.05,.67,1.85,(g,w,h)=>{
    fill(g,w,h,'#e9e5e0');type(g,'EXPERIENCE',w/2,160,36,'#6c6660','500','center');
    type(g,'THIS',w/2,224,46,'#8e7a5f','500','center');
    for(let i=0;i<9;i++)g.fillRect(110,330+i*18,290,3);
  },cream);
  // Side wall beyond the window: pinboard collage; right wall: proper wooden door.
  const boardG=new THREE.Group();scene.add(boardG);boardG.position.set(-7.48,3.78,-.9);boardG.rotation.y=Math.PI/2;
  cube(4.25,3.75,.11,M(0x9c8c62),0,0,0,boardG);
  cube(4.46,.12,.14,woodTrim,0,1.93,.1,boardG);cube(4.46,.12,.14,woodTrim,0,-1.93,.1,boardG);
  for(const x of [-2.2,2.2])cube(.12,3.9,.14,woodTrim,x,0,.1,boardG);
  for(let i=0;i<13;i++){
    const x=-1.64+(i%4)*1.03+(rand()-.5)*.14,
          y=1.13-Math.floor(i/4)*.93+(rand()-.5)*.16;
    const page=cube(.7,.65,.015,M([0xece9df,0x31546a,0x807c5f,0xc89e64][i%4]),x,y,.22,boardG);
    page.rotation.z=(rand()-.5)*.13;
    orb(.047,M([0xde765c,0x59a2ba,0xe2b948][i%3]),x,y+.32,.26,boardG);
  }
  const doorG=new THREE.Group();scene.add(doorG);
  doorG.position.set(7.53,3.45,-.80);doorG.rotation.y=-Math.PI/2;
  cube(3.28,5.95,.21,walnut,0,0,0,doorG);
  for(let y of [-1.60,1.53])cube(2.65,1.90,.075,walnutDark,0,y,.155,doorG);
  for(let y of [-1.60,1.53])cube(2.45,1.70,.085,walnut,0,y,.22,doorG);
  orb(.10,M(0xc1babb,.3,.75),1.13,-.21,.29,doorG);
  cube(.41,.055,.065,M(0x484947,.4),1.35,-.21,.32,doorG);
  // A warm pendant, hanging plant and a few decorative cables.
  cylinder(.012,.012,2.0,black,-4.35,6.9,-3.2);
  cylinder(.39,.29,.42,M(0x121918,.45),-4.35,5.84,-3.20);
  const pinLight=new THREE.PointLight(0xffd29a,6,3);pinLight.position.set(-4.35,5.55,-3.10);scene.add(pinLight);
  // Green recycle basket standing on back-left of desk.
  const bin=new THREE.Group();bin.position.set(-4.55,1.47,-.69);scene.add(bin);
  const binWall=M(0x107949,.72);
  cube(.89,.76,.85,binWall,0,.35,0,bin);
  cube(.96,.06,.91,M(0x168857),0,.73,0,bin);
  const recycle=artPlane(.52,.52,(g,w,h)=>{
    g.clearRect(0,0,w,h);type(g,'♻',w/2,h*.7,350,'#f5f5dd','900','center');
  },0,.35,.44,0,bin);
  handle(bin.children[0],'RECYCLING','Dobby recycles everything except bugs. Master Chai keeps those.');
  // Green cutting mat. Real grid texture, measurements, and border on a physical plane.
  cube(7.50,.045,2.78,sage,-1.70,1.451,2.03);
  const matTexture=tex((g,w,h)=>{
    fill(g,w,h,'#47754b');
    g.strokeStyle='rgba(218,240,205,.30)';g.lineWidth=1.3;
    for(let x=14;x<w;x+=23){g.beginPath();g.moveTo(x,11);g.lineTo(x,h-11);g.stroke()}
    for(let y=13;y<h;y+=23){g.beginPath();g.moveTo(11,y);g.lineTo(w-11,y);g.stroke()}
    g.strokeStyle='rgba(230,242,209,.66)';g.lineWidth=5;g.strokeRect(22,22,w-44,h-44);
    for(let i=0;i<20;i++){g.fillStyle='#cbdec5';g.fillRect(24+i*23,25,1,11)}
  },1024,512);
  const grid=plane(7.42,2.70,new THREE.MeshStandardMaterial({map:matTexture,roughness:.96,side:THREE.DoubleSide}),-1.70,1.479,2.03);
  grid.rotation.x=-Math.PI/2;
  handle(grid,'CUTTING MAT','A green mat for cutting paper, not corners. Master Chai has been informed.');
  // Stacked colored craft paper at bottom-left, slightly rotated like the reference.
  const sheetColors=[0xdcdad1,0xded0ad,0x304e70,0x50684f,0x8e654e,0xcfc3a6];
  for(let i=0;i<6;i++){
    const sh=cube(2.55,.009,1.08,M(sheetColors[i]),-6.08+i*.09,1.48+i*.008,3.55-i*.07);
    sh.rotation.y=(i-2)*.031;
  }
  // Magazine/postcard row along near edge of desk.
  function magazine(x,z,index){
    const card=cube(1.30,.018,.88,M([0x264b48,0x315664,0x9a644a,0x656b52,0x58605a][index%5]),x,1.477,z);
    const topImg=tex((g,w,h)=>{
      const colors=['#253e44','#647d80','#ca936a','#8a845d','#5b8291'];
      fill(g,w,h,colors[index%5]);
      for(let i=0;i<8;i++){
        g.fillStyle=[ '#d3a97b','#4a6c4e','#f1dfbe','#305d6b'][i%4];
        g.fillRect((i*107)%w,110+(i*113)%420,80+(i%4)*14,80+(i%3)*15);
      }
      type(g,['EVERYDAY','NATURE MADE','MAKE ART','LITTLE THINGS','FUTURE IDEAS'][index%5],w/2,77,39,'#f2e4c6','900','center');
      applyNoise(g,w,h,450);
    },512,640);
    const sheet=plane(1.25,.82,new THREE.MeshBasicMaterial({map:topImg,side:THREE.DoubleSide}),x,1.489,z);
    sheet.rotation.x=-Math.PI/2;return sheet;
  }
  for(let i=0;i<5;i++)magazine(-5.0+i*2.1,4.00,i);
  // Brilliant cobalt organizer tray with thick raised walls, handle slots, and dozens of decals.
  const trayG=new THREE.Group();trayG.position.set(3.56,1.54,2.04);scene.add(trayG);
  cube(4.11,.12,2.67,blue,0,0,0,trayG);
  for(const x of [-2.0,2.0])cube(.18,.35,2.65,blue,x,.16,0,trayG);
  for(const z of [-1.28,1.28])cube(4.10,.34,.18,blue,0,.16,z,trayG);
  // Recessed handles (dark insert + rim) at front and back.
  for(const z of [-1.375,1.375]){
    cube(.83,.13,.014,M(0x563d30,.72),0,.18,z,trayG);
    cube(.72,.035,.02,M(0x0c3f9a,.6),0,.25,z+(z>0?.02:-.02),trayG);
  }
  function decalTexture(i){
    return tex((g,w,h)=>{
      g.clearRect(0,0,w,h);
      const palettes=[
        ['#eadbba','#ee8a43','#517664'],['#d9c9b0','#406d8c','#e6a35d'],
        ['#9aacc2','#e9d1a0','#b26950'],['#ccaf87','#3b5f5d','#f6d59e']
      ];const p=palettes[i%4];
      g.fillStyle=p[0];g.beginPath();g.moveTo(70,42);g.lineTo(435,57);
      g.lineTo(473,430);g.lineTo(76,467);g.closePath();g.fill();
      const cx=250,cy=255;
      g.fillStyle=p[1];g.beginPath();g.arc(cx,cy,110+(i%3)*13,0,7);g.fill();
      g.fillStyle=p[2];g.beginPath();g.arc(cx+(i%2?45:-35),cy-35,72,0,7);g.fill();
      type(g,['♥','★','☻','✦','⚡','✿','42','IO'][i%8],cx,cy+55,155,'#f8ead4','900','center');
    },512,512);
  }
  for(let i=0;i<19;i++){
    const col=i%4,row=Math.floor(i/4);
    const px=-1.34+col*.85+(rand()-.5)*.13,pz=-.86+row*.41+(rand()-.5)*.08;
    const art=plane(.56,.36,new THREE.MeshBasicMaterial({map:decalTexture(i),transparent:true,side:THREE.DoubleSide}),px,.084+rand()*.003,pz,0,trayG);
    art.rotation.x=-Math.PI/2;art.rotation.z=(rand()-.5)*.25;
  }
  handle(trayG.children[0],'BLUE ORGANIZER TRAY','Dobby keeps memories in here. Mostly stickers and evidence of questionable decisions.');
  // Blue stationery binder at far right with orange CHAI cover.
  cube(2.05,.22,1.29,M(0x475b96,.72),6.57,1.54,2.78);
  cube(1.77,.025,1.07,M(0xc4aa85,.76),6.55,1.67,2.77);
  const binder=plane(1.51,.84,new THREE.MeshBasicMaterial({map:tex((g,w,h)=>{
    fill(g,w,h,'#c7b18a');g.fillStyle='#c87846';g.fillRect(0,50,w,150);
    type(g,'CHAI',w/2,145,105,'#f7ead2','900','center');
    type(g,'NOTES / IDEAS',w/2,335,42,'#364a61','900','center');
  }),side:THREE.DoubleSide}),6.56,1.703,2.77);binder.rotation.x=-Math.PI/2;
  // Bright green portable game device, inspired by the small retro handheld in the reference.
  const game=new THREE.Group();scene.add(game);game.position.set(6.0,1.57,.23);
  cube(1.24,.12,.59,M(0x75ad45,.65),0,0,0,game);
  cube(.60,.015,.36,M(0x263d36,.32,.3),-.19,.069,0,game);
  for(const [x,z] of [[.36,-.13],[.49,.02],[.32,.11]])orb(.038,black,x,.072,z,game,[1,.18,1]);
  handle(game.children[0],'POCKET CONSOLE','Dobby challenges Master Chai to play for five minutes. Master Chai negotiated for two.');
  // Petite letter piles, plant on mini-fridge and pencil jar.
  for(let i=0;i<4;i++)cube(.42,.04,.35,M([0xdca561,0x4b5a86,0xaa5858,0xdcd2b8][i]),1.42,2.17+i*.065,-4.12);
  const pot=cylinder(.23,.19,.31,M(0xc58b62),-4.72,2.95,-3.94);
  for(let i=0;i<7;i++){
    const a=i*2.6;
    const end=[-4.72+Math.cos(a)*(.14+.1*rand()),3.37+rand()*.50,-3.94+Math.sin(a)*.14];
    lineCylinder([-4.72,3.12,-3.94],end,.017,leaf);
    orb(.095,leaf,...end,undefined,[1.3,.38,.9]);
  }
  const cup=cylinder(.17,.14,.36,M(0xb77a48),-4.53,3.11,-4.06);
  for(let i=0;i<8;i++){
    const x=-4.53+(rand()-.5)*.19,z=-4.06+(rand()-.5)*.18;
    const pencil=cylinder(.014,.014,.67,M([0xd69b46,0x8c9d6f,0x2c4a71][i%3]),x,3.48+rand()*.16,z);
    pencil.rotation.z=(rand()-.5)*.48;
  }
  // Ambient shadow, practical lighting and cozy slightly analog color grading.
  scene.add(new THREE.HemisphereLight(0xdbe3e1,0x2f2922,1.42));
  const key=new THREE.DirectionalLight(0xffe3bf,2.9);
  key.position.set(-4.4,8.4,6.7);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-12;key.shadow.camera.right=12;
  key.shadow.camera.top=12;key.shadow.camera.bottom=-12;key.shadow.bias=-.00015;
  scene.add(key);
  const cameraBounce=new THREE.PointLight(0xffb479,3.3,10);cameraBounce.position.set(5,4,3);scene.add(cameraBounce);
  const coolFill=new THREE.PointLight(0x729b9e,2.4,8);coolFill.position.set(-6.8,3.8,1);scene.add(coolFill);
  // Simple cobwebs, drawn with actual thin geometry in the upper corners.
  const webMat=new THREE.LineBasicMaterial({color:0x8b9c93,transparent:true,opacity:.48});
  for(const side of [-1,1]){
    const cx=side*7.4,cy=7.6,cz=-3.0;
    for(let i=0;i<8;i++){
      const theta=(i/7)*(Math.PI/2);
      const points=[new THREE.Vector3(cx,cy,cz),
        new THREE.Vector3(cx-side*Math.cos(theta)*1.15,cy-Math.sin(theta)*1.10,cz)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),webMat));
    }
    for(let r=.27;r<1.21;r+=.27){
      const pts=[];
      for(let i=0;i<=12;i++){
        const theta=i/12*Math.PI/2;
        pts.push(new THREE.Vector3(cx-side*Math.cos(theta)*r,cy-Math.sin(theta)*r,cz));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),webMat));
    }
  }
  // A little life in the scene: subtle oscillation, old CRT reflection, and slow neon breathing.
  const baseEmissive=screenGlow.intensity;
  anim.push(t=>{screenGlow.intensity=baseEmissive+Math.sin(t*1.3)*.12;
    lava.rotation.y=Math.sin(t*.3)*.02;
    neon.material.opacity=.96+Math.sin(t*2)*.02;
  });
  return {update(t){anim.forEach(fn=>fn(t))},count:objects.length,portraitCount:portraits.length};
}
