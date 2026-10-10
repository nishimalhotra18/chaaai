import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const API_URL=window.CHAAAI_API_URL||""; const MAX=3;
const canvas=document.querySelector("#scene"), viewport=document.querySelector("#viewport");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x101613); scene.fog=new THREE.FogExp2(0x101613,.035);
const camera=new THREE.PerspectiveCamera(42,1,.1,100); camera.position.set(7.7,5.1,9.8);
const target=new THREE.Vector3(0,2.1,0), ray=new THREE.Raycaster(), mouse=new THREE.Vector2();
let yaw=.56,pitch=.19,distance=12.6,drag=false,px=0,py=0,entered=false,count=0,hovered=null,dialogTimer;
const interactives=[];
const mat=(color,rough=.72,metal=.05)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const wood=mat(0x6e3e22,.72), darkWood=mat(0x3d2418,.78), stone=mat(0x26332f,.93), brass=mat(0xb47732,.38,.68), paper=mat(0xd8c79c,.9), green=mat(0x477044,.88), blue=mat(0x155fb6,.5,.15), black=mat(0x161b18,.75), red=mat(0x8f382b,.78);
function mesh(g,m,x,y,z,cast=true){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o}
function box(sx,sy,sz,m,x,y,z){return mesh(new THREE.BoxGeometry(sx,sy,sz),m,x,y,z)}
function addInteractive(o,name,action){o.userData={name,action};interactives.push(o);return o}
function canvasTexture(draw,w=512,h=256){const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function label(text,bg="#d8c79c",fg="#24231e"){return new THREE.MeshStandardMaterial({map:canvasTexture((x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font="700 34px monospace";text.split("\n").forEach((s,i)=>x.fillText(s,28,54+i*48))}),roughness:.9})}

// room shell
box(13,.45,7.5,stone,0,.05,0); box(13,6.8,.38,stone,0,3.35,-3.45); box(.38,6.8,7.5,stone,-6.3,3.35,0); box(.38,6.8,7.5,stone,6.3,3.35,0);
// stone block accents
for(let y=.65;y<6.3;y+=.72) for(let x=-5.8;x<6;x+=1.35){const b=box(1.22,.6,.12,mat((x+y)%2?0x30403a:0x2a3733,.98),x+(y%1.4>.7?.55:0),y,-3.23,false);}
// desk + green work mat
box(8.8,.34,2.75,wood,.35,1.72,.45); box(.35,1.65,2.35,darkWood,-3.5,.82,.45);box(.35,1.65,2.35,darkWood,4.15,.82,.45);
box(4.1,.035,1.55,green,-.9,1.91,.38,false);
// shelves
for(const sx of [-4.75,4.75]){box(1.65,4.5,.48,darkWood,sx,3.55,-2.92);for(let y=1.75;y<5.5;y+=1.15)box(1.65,.12,.7,wood,sx,y,-2.55)}
// books
const bookColors=[0x8e3e31,0x36535b,0xb78542,0x465b3e,0x79502d];
for(let i=0;i<15;i++){const side=i<8?-4.75:4.75, n=i%8;box(.16+.08*(n%2),.65+.12*(n%3),.42,mat(bookColors[i%bookColors.length],.85),side-.58+n*.17,2.05+(i%3)*1.15,-2.15)}
// monitor
const monitor=box(2.25,1.45,.3,black,.55,2.75,-.05); addInteractive(monitor,"MASTER CHAI STATUS",()=>{
 monitor.material=label("MASTER CHAI\nSTATUS: WORKING","#0b1712","#75e29a"); say("Master Chai is working. Dobby did check.");
});
box(.18,.8,.18,black,.55,2.02,-.05);box(.85,.08,.55,black,.55,1.95,-.05);
// warm hanging lamp
const lampGroup=new THREE.Group();scene.add(lampGroup);lampGroup.position.set(4.3,5.8,.25);
const cord=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.1,8),black);cord.position.y=-.55;lampGroup.add(cord);
const shade=new THREE.Mesh(new THREE.ConeGeometry(.55,.48,24,1,true),mat(0xd98b36,.45,.3));shade.position.y=-1.25;shade.rotation.x=Math.PI;lampGroup.add(shade);
const bulb=new THREE.PointLight(0xffa94f,85,7,2);bulb.position.y=-1.48;lampGroup.add(bulb);addInteractive(shade,"SWING DOBBY'S LAMP",()=>{lampGroup.userData.swing=1;say("Dobby had that lamp positioned perfectly.");});
// cyan bottle
const bottleMat=new THREE.MeshPhysicalMaterial({color:0x31cfc5,roughness:.15,metalness:0,transparent:true,opacity:.72,transmission:.25});
const bottle=mesh(new THREE.CylinderGeometry(.24,.31,.75,18),bottleMat,-2.15,2.32,.25);addInteractive(bottle,"COMPUTE COOLANT",()=>{bottle.userData.pulse=1;say("Experimental compute coolant. Dobby recommends not drinking it.");});
// crystal
const crystal=mesh(new THREE.OctahedronGeometry(.42,0),new THREE.MeshStandardMaterial({color:0x59ded7,emissive:0x164e4c,emissiveIntensity:1.2,roughness:.2}),2.35,2.45,.1);crystal.scale.y=1.7;const crystalLight=new THREE.PointLight(0x56e5dd,18,3);crystal.add(crystalLight);addInteractive(crystal,"UNIDENTIFIED COMPUTE CRYSTAL",()=>{crystal.userData.on=!crystal.userData.on;say(crystal.userData.on?"That powers something. Dobby forgot what.":"Better.");});
// blue sorting tray
const tray=box(2.3,.13,1.35,blue,3.05,1.98,.78);addInteractive(tray,"DOBBY'S ARTIFACT TRAY",()=>say("Important artifacts. And three things Dobby found under Master Chai's desk."));
for(let x=2.25;x<3.9;x+=.52)for(let z=.38;z<1.2;z+=.45){const s=mesh(new THREE.SphereGeometry(.12,10,8),mat((Math.round(x*10)+Math.round(z*10))%2?0xe09a3f:0xb84735,.5),x,2.13,z);}
// owl perch: stylized original owl
const perch=box(1.1,.1,.35,wood,-4.55,4.75,-2.1);const owlBody=mesh(new THREE.SphereGeometry(.38,18,14),mat(0x9b7651,.95),-4.55,5.3,-2.05);owlBody.scale.set(.8,1.25,.75);const owlHead=mesh(new THREE.SphereGeometry(.34,18,14),mat(0xb49168,.95),-4.55,5.72,-2.04);addInteractive(owlHead,"WORKSHOP OWL",()=>say("Letters for Master Chai. Mostly meeting invites. Tragic."));
// to-do board
const todo=box(1.7,1.25,.08,label("DOBBY / TO-DO\n01 HELP CHAI\n02 PROTECT COMPUTE\n03 FIND SOCKS\n04 MORE WORK"),-2.7,2.95,-3.15);addInteractive(todo,"DOBBY'S TO-DO LIST",()=>say("Item one is ongoing. Item four keeps reproducing."));
// Living portraits: miniature three-dimensional Hogwarts dioramas rather than flat textures.
// All figures, frames, captions and effects are authored in Three.js; no external model files.
const livingFrames=[];
const portraitGold=mat(0xb88a42,.31,.75), portraitGoldLight=mat(0xf4d591,.28,.62);
const portraitShadow=mat(0x271b19,.94), ivory=mat(0xf0dbc0,.95);
const robePurple=mat(0x4e456e,.86), robeBlack=mat(0x181b22,.89);
const pinkRobe=mat(0xc87e9b,.83), skin=mat(0xe5baa0,.93);
const hairBlack=mat(0x211d21,.93), hairBrown=mat(0x70472c,.95), ginger=mat(0xb76635,.92);
const silverHair=mat(0xdfded3,.9), blush=mat(0xa65a69,.91);
const goldInk=mat(0xcda362,.44,.42);
function localMesh(parent,geometry,material,x=0,y=0,z=0){
  const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);
  obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
function localBox(parent,w,h,d,m,x,y,z){return localMesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function orb(parent,r,m,x,y,z,sx=1,sy=1,sz=1){
  const o=localMesh(parent,new THREE.SphereGeometry(r,18,14),m,x,y,z);
  o.scale.set(sx,sy,sz);return o;
}
function cyl(parent,r1,r2,h,m,x,y,z){
  return localMesh(parent,new THREE.CylinderGeometry(r1,r2,h,14),m,x,y,z);
}
function backdropTexture(top,bottom){
  return canvasTexture((g,W,H)=>{
    const grad=g.createLinearGradient(0,0,W,H);
    grad.addColorStop(0,top);grad.addColorStop(1,bottom);g.fillStyle=grad;g.fillRect(0,0,W,H);
    g.strokeStyle="rgba(247,208,135,.32)";g.lineWidth=9;
    g.beginPath();g.moveTo(W*.12,H);g.lineTo(W*.12,H*.25);
    g.quadraticCurveTo(W*.12,H*.07,W*.5,H*.06);
    g.quadraticCurveTo(W*.88,H*.07,W*.88,H*.25);
    g.lineTo(W*.88,H);g.stroke();
    g.lineWidth=2;g.strokeStyle="rgba(250,220,170,.14)";
    for(let i=0;i<16;i++){const x=(i*139+47)%W,y=(i*97+51)%H;g.beginPath();g.arc(x,y,2+(i%3),0,Math.PI*2);g.stroke();}
  },512,640);
}
function inscriptionTexture(name,quote){
  return canvasTexture((g,W,H)=>{
    g.fillStyle="#201a16";g.fillRect(0,0,W,H);
    g.strokeStyle="#c39a5c";g.lineWidth=10;g.strokeRect(7,7,W-14,H-14);
    g.fillStyle="#f1ce8f";g.textAlign="center";g.font="bold 48px Georgia, serif";
    g.fillText(name.toUpperCase(),W/2,61);
    g.fillStyle="#efe3c7";g.font="italic 35px Georgia, serif";
    const words=quote.split(" "),lines=[];let line="";
    words.forEach(word=>{
      const candidate=line?line+" "+word:word;
      if(g.measureText(candidate).width>W-75&&line){lines.push(line);line=word;}
      else line=candidate;
    });if(line)lines.push(line);
    const lineHeight=42,firstY=125;
    lines.forEach((l,i)=>g.fillText(l,W/2,firstY+i*lineHeight));
  },768,330);
}
// Each person is built from real geometric volumes. Their bodies, hair, props and faces
// have parallax when the viewer moves the orbit camera.
function makeWizard(kind){
  const actor=new THREE.Group();
  const isD=kind==="dumbledore",isS=kind==="snape",isU=kind==="umbridge";
  const isH=kind==="harry",isM=kind==="hermione",isR=kind==="ron";
  const clothing=isD?robePurple:isU?pinkRobe:robeBlack;
  // tapered robe, shoulders, face, neck and deliberately oversized hands
  cyl(actor,.22,.35,.70,clothing,0,-.12,.16);
  orb(actor,.32,clothing,0,.10,.17,1.16,.53,.73);
  cyl(actor,.07,.07,.13,skin,0,.26,.22);
  const head=new THREE.Group();head.position.set(0,.46,.24);actor.add(head);
  orb(head,.23,skin,0,0,0,1,.99,.87);
  orb(head,.045,skin,0,-.055,.20,.8,1.25,.95); // nose
  const eyeMat=mat(0x24201c,.65);
  [-.089,.089].forEach(x=>{
    orb(head,.019,eyeMat,x,.022,.19);
    const brow=localBox(head,.085,.015,.018,isU?hairBrown:hairBlack,x,.093,.193);
    brow.rotation.z=isS?(x<0?-.18:.18):0;
  });
  const mouth=localBox(head,.095,.011,.012,isU?blush:hairBrown,0,-.122,.193);
  mouth.rotation.z=isU?.04:0;
  // sleeves extend from the torso, with independently animatable arms
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();
  leftArm.position.set(-.29,.11,.13);rightArm.position.set(.29,.11,.13);
  actor.add(leftArm,rightArm);
  const sleeveL=cyl(leftArm,.11,.15,.44,clothing,-.035,-.21,.02);
  const sleeveR=cyl(rightArm,.11,.15,.44,clothing,.035,-.21,.02);
  orb(leftArm,.075,skin,-.04,-.45,.04);
  orb(rightArm,.075,skin,.04,-.45,.04);
  if(isD){
    // Long silver beard, swept hair, half-moon glasses, pointed hat and a wand
    orb(head,.25,silverHair,0,.14,-.045,1.13,.88,1.06);
    [-.21,.21].forEach(x=>orb(head,.105,silverHair,x,-.18,-.015,.78,2.5,.65));
    const beard=cyl(head,.17,.025,.42,silverHair,0,-.36,.15);
    for(const x of [-.10,.10])orb(head,.075,silverHair,x,-.25,.16,.74,1.9,.75);
    cyl(head,.15,.23,.41,robePurple,0,.42,-.01);
    cyl(head,.30,.30,.035,robePurple,0,.23,-.01);
    const spectacles=mat(0xe1ca87,.25,.65);
    [-.094,.094].forEach(x=>{
      const rim=localMesh(head,new THREE.TorusGeometry(.083,.012,6,18),spectacles,x,.025,.207);
    });
    localBox(head,.045,.012,.012,spectacles,0,.025,.21);
    rightArm.rotation.z=.42;
    const wand=cyl(rightArm,.013,.024,.60,goldInk,.10,-.71,.12);wand.rotation.z=.25;
  }else if(isS){
    // Severe hooked silhouette, center-parted long dark hair and high collar
    orb(head,.245,hairBlack,0,.15,-.06,1.08,.9,1.0);
    [-.20,.20].forEach(x=>orb(head,.115,hairBlack,x,-.20,-.04,.8,2.65,.9));
    localBox(actor,.16,.42,.12,robeBlack,-.28,.17,.18);
    localBox(actor,.16,.42,.12,robeBlack,.28,.17,.18);
    orb(head,.045,skin,0,-.07,.22,.73,1.6,.75);
    leftArm.rotation.z=-.55;rightArm.rotation.z=.55;
  }else if(isU){
    // Rose-pink jacket, tidy curls, matching hat, pearl collar and little teacup
    const curlMat=mat(0x94735c,.91);
    for(let i=0;i<9;i++){const a=(i/9)*Math.PI*2;orb(head,.085,curlMat,Math.cos(a)*.205,.18+Math.sin(a)*.115,-.02);}
    cyl(head,.11,.19,.15,pinkRobe,0,.30,-.02);
    cyl(head,.27,.27,.035,pinkRobe,0,.235,-.02);
    orb(head,.075,blush,.13,.38,.01);
    for(let i=-1;i<=1;i++)orb(actor,.026,ivory,i*.11,.17,.40);
    const cup=localBox(rightArm,.18,.13,.13,ivory,.08,-.37,.20);
    orb(rightArm,.05,goldInk,.20,-.36,.2,.5,.9,.5);
    rightArm.rotation.z=.28;
  }else{
    // Trio: recognizable individual silhouettes with glasses, hair, scarves and props.
    const isGirl=isM;
    if(isH){
      orb(head,.25,hairBlack,0,.17,-.06,1.12,.83,1);
      for(let i=0;i<4;i++)orb(head,.095,hairBlack,-.16+i*.1,.29,.04,.8,1.3,.7);
      const glass=mat(0x392e2c,.4,.45);
      [-.09,.09].forEach(x=>localMesh(head,new THREE.TorusGeometry(.08,.013,5,14),glass,x,.02,.21));
      localBox(head,.055,.012,.015,glass,0,.02,.21);
      const scar=localBox(head,.065,.013,.01,blush,-.09,.14,.212);scar.rotation.z=-.52;
    }else if(isM){
      orb(head,.31,hairBrown,0,.04,-.075,1.16,1.13,.95);
      for(let i=0;i<7;i++)orb(head,.09,hairBrown,-.23+i*.075,.18+(i%2)*.055,.06);
    }else if(isR){
      orb(head,.245,ginger,0,.17,-.06,1.14,.8,1.0);
      orb(head,.095,ginger,-.15,.28,.04);orb(head,.08,ginger,.12,.29,.04);
    }
    const scarf=isH?mat(0x9f3e39,.7):isM?mat(0xa94c42,.7):mat(0xb78b37,.7);
    cyl(actor,.20,.22,.10,scarf,0,.18,.22);
    if(isM){
      const book=localBox(leftArm,.29,.32,.075,mat(0x786446,.7),-.10,-.37,.22);
      book.rotation.z=.22;
      leftArm.rotation.z=-.23;
    }else{
      const wand=cyl(rightArm,.012,.019,.54,goldInk,.07,-.65,.18);
      wand.rotation.z=.15;rightArm.rotation.z=-.25;
    }
  }
  return {actor,head,leftArm,rightArm};
}
function livingPortrait({x,y,w=1.48,h=1.96,name,quote,kind,top,bottom}){
  const frame=new THREE.Group();frame.position.set(x,y,-3.005);frame.userData.portraitWidth=w;scene.add(frame);
  // Deep recessed shadowbox with two inset gold molding layers and raised corner bosses.
  localBox(frame,w,h,.18,portraitShadow,0,0,-.10);
  const bg=localMesh(frame,new THREE.PlaneGeometry(w-.23,h-.24),
    new THREE.MeshBasicMaterial({map:backdropTexture(top,bottom)}),0,0,.008);
  const lip=.095,edge=.035;
  for(const [bw,bh,bx,by] of [
    [w,lip,0,h/2-lip/2],[w,lip,0,-h/2+lip/2],
    [lip,h, -w/2+lip/2,0],[lip,h,w/2-lip/2,0]
  ]){
    localBox(frame,bw,bh,.17,portraitGold,bx,by,.13);
  }
  for(const [bw,bh,bx,by] of [
    [w-.13,edge,0,h/2-.105],[w-.13,edge,0,-h/2+.105],
    [edge,h-.13,-w/2+.105,0],[edge,h-.13,w/2-.105,0]
  ])localBox(frame,bw,bh,.09,portraitGoldLight,bx,by,.22);
  for(const sx of [-1,1])for(const sy of [-1,1]){
    orb(frame,.055,portraitGoldLight,sx*(w/2-.065),sy*(h/2-.065),.245);
  }
  // Readable diegetic label and quote, etched on a separate panel inside the frame.
  const plaque=localMesh(frame,new THREE.PlaneGeometry(w-.20,.48),
    new THREE.MeshBasicMaterial({map:inscriptionTexture(name,quote),side:THREE.DoubleSide}),
    0,-h/2+.34,.48);
  plaque.renderOrder=2;
  const characters=[];
  if(kind==="trio"){
    for(const [role,cx] of [["harry",-.67],["hermione",0],["ron",.67]]){
      const c=makeWizard(role);c.actor.scale.setScalar(.66);
      c.actor.position.set(cx,.18,.22);
      frame.add(c.actor);characters.push(c);
    }
    // Shared floating spellbook that moves independently of the trio.
    const spellbook=new THREE.Group();frame.add(spellbook);
    spellbook.position.set(0,.62,.36);
    const cover=localBox(spellbook,.26,.30,.06,mat(0x926a40,.6),0,0,0);
    localBox(spellbook,.20,.24,.065,paper,.005,0,.02);
    frame.userData.spellbook=spellbook;
  }else{
    const c=makeWizard(kind);c.actor.position.set(0,.14,.15);
    frame.add(c.actor);characters.push(c);
  }
  const lightDot=localMesh(frame,new THREE.SphereGeometry(.048,12,10),
    new THREE.MeshStandardMaterial({color:0xf2cc8e,emissive:0xa56e2e,emissiveIntensity:1.8}),
    w/2-.18,h/2-.21,.31);
  // Unobtrusive clickable hit surface in front of all 3D characters.
  const hit=localMesh(frame,new THREE.PlaneGeometry(w-.09,h-.08),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),
    0,0,.69);
  hit.castShadow=false;hit.receiveShadow=false;
  const entry={frame,characters,hit,lightDot,kind,phase:livingFrames.length*.9,pulse:0};
  livingFrames.push(entry);
  addInteractive(hit,name.toUpperCase()+" — LIVING PORTRAIT",()=>{
    entry.pulse=1;
    if(kind==="trio"){
      say("Harry, Hermione and Ron are attempting a spell. Dobby suggests standing back.",4600);
    }else say(name+": “"+quote+"”",5200);
  });
}
// Four fully dimensional living portraits, spaced so each reads clearly at room scale.
livingPortrait({x:-2.77,y:4.82,name:"Dumbledore",quote:"Help is given at Hogwarts for those who ask for it.",kind:"dumbledore",top:"#253c56",bottom:"#705d45"});
livingPortrait({x:-1.18,y:4.82,name:"Snape",quote:"There will be no foolish wand-waving or silly incantations in this class.",kind:"snape",top:"#1b292f",bottom:"#3d453f"});
livingPortrait({x:.42,y:4.82,name:"Umbridge",quote:"I must not tell lies.",kind:"umbridge",top:"#704e5a",bottom:"#bd8e84"});
livingPortrait({x:2.43,y:4.82,w:2.25,name:"Harry, Hermione & Ron",quote:"Mischief managed.",kind:"trio",top:"#263c4c",bottom:"#72634e"});

// GLB portraits — actual textured 3D character assets. Keep the bespoke geometry visible
// until each model has decoded and parsed, so a network hiccup never leaves a blank frame.
const gltfLoader = new GLTFLoader();
const portraitMixers = [];
const portraitModels = {
  dumbledore: "models/dumbledore.glb.b64",
  harry: "models/harry.glb.b64",
  hermione: "models/hermione.glb.b64",
  ron: "models/ron.glb.b64"
};
const portraitAssets = new Map();
async function loadPortraitAsset(kind) {
  if (!portraitModels[kind]) return null;
  if (!portraitAssets.has(kind)) {
    portraitAssets.set(kind, (async () => {
      const response = await fetch(portraitModels[kind], {cache:"force-cache"});
      if (!response.ok) throw new Error("GLB asset fetch failed: "+kind+" / "+response.status);
      const encoded = (await response.text()).replace(/\s+/g,"");
      const decoded=atob(encoded), data=new Uint8Array(decoded.length);
      for(let i=0;i<decoded.length;i++)data[i]=decoded.charCodeAt(i);
      return await new Promise((resolve,reject)=>gltfLoader.parse(data.buffer,"",resolve,reject));
    })());
  }
  return portraitAssets.get(kind);
}
function findBone(root,re) {
  let found=null;
  root.traverse(node=>{if(node.isBone&&re.test(node.name)&&!found)found=node;});
  return found;
}
function installPortraitModel(p,index,asset,kind) {
  const placeholder=p.characters[index];
  if(!placeholder) return;
  const container=new THREE.Group();
  container.position.copy(placeholder.actor.position);
  p.frame.add(container);
  const root=asset.scene;
  container.add(root);
  root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root);
  const dimension=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  if(!Number.isFinite(dimension.y)||dimension.y<=.00001){
    p.frame.remove(container);
    throw new Error("Invalid 3D model geometry: "+kind);
  }
  // Fit the model to the original portrait, independently of the units in its GLB.
  const isTrio=p.kind==="trio";
  const desiredH=isTrio?.85:1.17, desiredW=isTrio?.58:p.frame.userData.portraitWidth-.35;
  const scale=Math.min(desiredH/dimension.y,desiredW/Math.max(dimension.x,.0001));
  root.scale.multiplyScalar(scale);
  root.position.set(-center.x*scale,-center.y*scale,-center.z*scale+.21);
  root.rotation.y+=0; // preserve the model artist's intended orientation
  root.traverse(object=>{
    if(object.isMesh){
      object.castShadow=true;
      object.receiveShadow=true;
      if(object.material){
        for(const m of (Array.isArray(object.material)?object.material:[object.material])){
          m.side=THREE.FrontSide;
          if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
          m.needsUpdate=true;
        }
      }
    }
  });
  p.frame.remove(placeholder.actor);
  // Rigged characters have individual head and arm bones; static models are animated
  // through the whole figure in a portrait-sized, intentionally subtle loop.
  const head=findBone(root,/Head(_|$)|head\b/i);
  const rightArm=findBone(root,/(upperarm.?r|rarm|rightarm|rhand)/i);
  const eyelid=findBone(root,/(eyelid.*top|eyelid.*upper)/i);
  const savedBoneRotations=[head,rightArm,eyelid].map(x=>x?x.rotation.clone():null);
  p.characters[index]={
    actor:container,model:root,head,rightArm,eyelid,
    savedBoneRotations,kind,isDetailed:true
  };
  if(asset.animations?.length){
    const mixer=new THREE.AnimationMixer(root);
    asset.animations.forEach(clip=>mixer.clipAction(clip).play());
    portraitMixers.push(mixer);
  }
  p.loaded=(p.loaded||0)+1;
  console.info("[CHAAAI] Loaded real GLB portrait:",kind);
}
// Four existing CC-BY textured 3D character models: one wizard and the entire trio.
// Snape and Umbridge remain as clearly marked handcrafted stand-ins until licensed
// high-detail assets are supplied. Do not describe stand-ins as photoreal models.
livingFrames.forEach(p=>{
  if(p.kind==="dumbledore"){
    loadPortraitAsset("dumbledore").then(asset=>installPortraitModel(p,0,asset,"dumbledore"))
      .catch(err=>console.warn("[CHAAAI] Dumbledore GLB unavailable; keeping fallback",err));
  }
  if(p.kind==="trio"){
    for(const [i,kind] of ["harry","hermione","ron"].entries()){
      loadPortraitAsset(kind).then(asset=>installPortraitModel(p,i,asset,kind))
        .catch(err=>console.warn("[CHAAAI] "+kind+" GLB unavailable; keeping fallback",err));
    }
  }
});

// parchment + quill
const parchment=box(1.3,.025,.9,paper,-.55,2.08,1.0);addInteractive(parchment,"MASTER CHAI NOTES",()=>say("Dobby cannot read Master Chai's handwriting either."));
const pencil=box(1.35,.045,.045,mat(0xe4a735,.55),.65,2.14,1.1);addInteractive(pencil,"ROLL THE PENCIL",()=>{pencil.userData.roll=1;say("Dobby was using that.");});
// letters + extra interactive desk objects
const letters=[];
for(let i=0;i<4;i++){
  const l=box(.72,.025,.46,paper,-3.05+i*.23,2.08,1.18+i*.08);
  l.rotation.y=-.18+i*.07; letters.push(l);
}
addInteractive(letters[3],"MASTER CHAI LETTERS",()=>{
  letters.forEach((l,i)=>l.userData.fly=.65+i*.08);
  say("Four letters. Three meetings. One says urgent. Dobby dislikes that one.");
});
const meetingClock=mesh(new THREE.CylinderGeometry(.38,.38,.12,24),brass,1.65,2.32,.95);
meetingClock.rotation.x=Math.PI/2;
addInteractive(meetingClock,"MASTER CHAI MEETING CLOCK",()=>{meetingClock.userData.spin=1;say("Every hour is meeting o'clock. Dobby checked twice.");});
const sealed=box(.82,.035,.55,red,-2.9,2.08,.55);
addInteractive(sealed,"SEALED LETTER",()=>{sealed.userData.shake=1;say("That one says urgent. Dobby has decided not to deliver it yet.");});
const blueprint=box(1.25,.025,.72,label("WORKERS.IO\\nSIMULATE - SHIP","#315f83","#e7dfc9"),2.75,2.09,-.55);
addInteractive(blueprint,"WORKERS.IO BLUEPRINT",()=>{blueprint.userData.lift=1;say("Master Chai's blueprint. Dobby understands at least forty percent of the arrows.");});
// three physical question stones
const qstones=[];for(let i=0;i<3;i++){const q=mesh(new THREE.DodecahedronGeometry(.18,0),new THREE.MeshStandardMaterial({color:0x73e4d8,emissive:0x164c49,emissiveIntensity:1.5,roughness:.35}),-1.15+i*.5,2.18,-.55);qstones.push(q)}
// Museum-like portrait lighting: warm key from above and dim, cooler fill.
const portraitKey=new THREE.SpotLight(0xffd49a,22,9,Math.PI/4,.65,1.5);
portraitKey.position.set(-1.2,6.3,1.3);portraitKey.target.position.set(-.1,4.65,-2.9);
scene.add(portraitKey,portraitKey.target);
const portraitFill=new THREE.PointLight(0x9fb4aa,4.5,6,2);
portraitFill.position.set(3.8,5.4,-1.1);
scene.add(portraitFill);

// ambient/detail lights
scene.add(new THREE.HemisphereLight(0x7e9ca1,0x382414,1.45));const key=new THREE.DirectionalLight(0xffe0b5,2.1);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);scene.add(key);
const blueFill=new THREE.PointLight(0x2b77cf,24,8);blueFill.position.set(-5,3,2);scene.add(blueFill);

// interaction
const tooltip=document.querySelector("#tooltip"),reticle=document.querySelector("#reticle");
function pointer(e){const r=canvas.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;reticle.style.left=(e.clientX-r.left)+"px";reticle.style.top=(e.clientY-r.top)+"px";}
viewport.addEventListener("pointermove",e=>{pointer(e);if(drag){yaw-=(e.clientX-px)*.006;pitch=Math.max(-.08,Math.min(.48,pitch+(e.clientY-py)*.004));px=e.clientX;py=e.clientY;}ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(interactives,false)[0];hovered=hit?.object||null;if(hovered){tooltip.style.display="block";tooltip.textContent=hovered.userData.name;tooltip.style.left=(e.offsetX+14)+"px";tooltip.style.top=(e.offsetY+14)+"px";reticle.style.opacity=1}else{tooltip.style.display="none";reticle.style.opacity=0}});
viewport.addEventListener("pointerdown",e=>{drag=true;px=e.clientX;py=e.clientY;viewport.classList.add("dragging")});addEventListener("pointerup",e=>{if(drag&&Math.abs(e.clientX-px)<5&&Math.abs(e.clientY-py)<5&&hovered)hovered.userData.action?.();drag=false;viewport.classList.remove("dragging")});
viewport.addEventListener("wheel",e=>{e.preventDefault();distance=Math.max(7.2,Math.min(16,distance+e.deltaY*.008))},{passive:false});
document.querySelector("#enterBtn").addEventListener("click",()=>{entered=true;document.querySelector("#intro").classList.add("gone");distance=9.4;target.set(.2,2.55,-.15);setTimeout(()=>{say("You are looking for Master Chai.");},700);setTimeout(()=>say("He is working. Obviously."),2600);setTimeout(()=>{say("You may ask Dobby three questions. Or touch things. Carefully.");document.querySelector("#askForm").classList.remove("hidden")},4600)});

function say(t,ms=2300){clearTimeout(dialogTimer);const d=document.querySelector("#dialogue");document.querySelector("#dialogueText").textContent=t;d.classList.remove("hidden");dialogTimer=setTimeout(()=>d.classList.add("hidden"),ms)}
async function answer(q){const l=q.toLowerCase();if(/where|location|free|available/.test(l))return "Master Chai is working. Dobby can be more specific if you insist: probably Workers.io, a meeting, or both.";if(/sleep/.test(l))return "Dobby has seen the sleeping mat. Dobby has not seen Master Chai use it.";if(/build|worker/.test(l))return "Master Chai is building Workers.io. This explains the alarming amount of compute in Dobby's workshop.";if(!API_URL)return "Master Chai is working. Dobby's larger language model is currently borrowing the rest of the compute.";const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:[]})});if(!r.ok)throw Error();return (await r.json()).reply}
document.querySelector("#askForm").addEventListener("submit",async e=>{e.preventDefault();if(count>=MAX)return;const input=document.querySelector("#question"),q=input.value.trim();if(!q)return;input.value="";input.disabled=true;try{say("Dobby is thinking…",900);const a=await answer(q);count++;qstones[3-count].material.emissiveIntensity=.05;qstones[3-count].material.color.set(0x3c4b47);document.querySelector("#budget").textContent=["○ ○ ○","● ● ○","● ○ ○","○ ○ ○"][count];setTimeout(()=>say(a,4200),950);if(count===MAX)setTimeout(()=>{document.querySelector("#askForm").classList.add("hidden");say("Master Chai needs the compute back. Of course he does.",4500)},5600)}catch{say("Dobby lost the compute. Master Chai is probably using it.",3200)}finally{input.disabled=false;input.focus()}});
// resize/render
function resize(){const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(viewport);resize();
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;portraitMixers.forEach(m=>m.update(dt));const cp=Math.cos(pitch);camera.position.set(target.x+distance*Math.sin(yaw)*cp,target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*cp);camera.lookAt(target);if(lampGroup.userData.swing){lampGroup.rotation.z=Math.sin(t*8)*.22*lampGroup.userData.swing;lampGroup.userData.swing*=.965;if(lampGroup.userData.swing<.02){lampGroup.userData.swing=0;lampGroup.rotation.z=0}}if(bottle.userData.pulse){bottle.scale.y=1+Math.sin(t*15)*.12;bottle.rotation.y+=.08;bottle.userData.pulse*=.97;if(bottle.userData.pulse<.03){bottle.userData.pulse=0;bottle.scale.y=1}}crystal.rotation.y+=.006;crystal.material.emissiveIntensity=crystal.userData.on?2.8+Math.sin(t*3)*.5:1.1;if(pencil.userData.roll){pencil.rotation.z+=.18;pencil.position.x+=.025;if(pencil.position.x>2){pencil.userData.roll=0}}owlHead.rotation.y=Math.sin(t*.7)*.18;
livingFrames.forEach((p,i)=>{
  const time=t*.75+p.phase,boost=p.pulse;
  // Characters keep moving even before they are clicked, like Hogwarts portraits.
  p.characters.forEach((c,j)=>{
    const phase=time+j*1.7;
    c.actor.position.y=(p.kind==="trio"?.18:.14)+Math.sin(phase*1.18)*.025;
    c.actor.rotation.y=Math.sin(phase*.72)*.085+(boost*Math.sin(t*7)*.10);
    if(c.isDetailed) {
      // Genuine rig motion where bones are present; preserve the artist's rest pose.
      if(c.head){
        c.head.rotation.y=c.savedBoneRotations[0].y+Math.sin(phase*.89)*.085;
        c.head.rotation.z=c.savedBoneRotations[0].z+Math.sin(phase*.67)*.022;
      }
      if(c.rightArm) c.rightArm.rotation.z=c.savedBoneRotations[1].z+
        Math.sin(phase*1.35)*.048+boost*Math.sin(t*9)*.12;
      if(c.eyelid){
        const blink=Math.pow(Math.max(0,Math.cos(phase*2.4)),38);
        c.eyelid.rotation.x=c.savedBoneRotations[2].x+blink*.32;
      }
    } else {
      c.head.rotation.y=Math.sin(phase*.89)*.09;
      c.head.rotation.z=Math.sin(phase*.67)*.035;
      c.rightArm.rotation.z=(p.kind==="dumbledore"?.42:p.kind==="umbridge"?.28:p.kind==="trio"?-.25:p.kind==="snape"?.55:0)+Math.sin(phase*1.35)*.10+boost*Math.sin(t*10)*.20;
    }
  });
  if(p.frame.userData.spellbook){
    const book=p.frame.userData.spellbook;
    book.position.y=.61+Math.sin(t*1.4)*.055;
    book.rotation.y=Math.sin(t*.65)*.25;
    book.rotation.z=Math.sin(t*1.05)*.12;
  }
  p.lightDot.material.emissiveIntensity=1.4+Math.sin(time*2.2)*.42+boost*2;
  p.frame.scale.setScalar(1+boost*.013);
  p.pulse*=.962;
});
letters.forEach(l=>{if(l.userData.fly){l.position.y+=.018*l.userData.fly;l.rotation.z+=.045*l.userData.fly;l.userData.fly*=.975}});
if(meetingClock.userData.spin){meetingClock.rotation.z+=.28*meetingClock.userData.spin;meetingClock.userData.spin*=.97}
if(sealed.userData.shake){sealed.rotation.y=Math.sin(t*35)*.12*sealed.userData.shake;sealed.userData.shake*=.96}
if(blueprint.userData.lift){blueprint.position.y=2.09+.12*Math.sin(t*10)*blueprint.userData.lift;blueprint.userData.lift*=.95}
renderer.render(scene,camera)}animate();