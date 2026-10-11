import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { installCozyWorkshop } from "./cozy-workshop.js";

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
// ambient/detail lights
scene.add(new THREE.HemisphereLight(0x7e9ca1,0x382414,1.45));const key=new THREE.DirectionalLight(0xffe0b5,2.1);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);scene.add(key);
const blueFill=new THREE.PointLight(0x2b77cf,24,8);blueFill.position.set(-5,3,2);scene.add(blueFill);

// Build the richly detailed 3D craft-workshop environment.
const cozyWorkshop=installCozyWorkshop({THREE,scene,renderer,interactives,addInteractive,say});
camera.fov=47;camera.updateProjectionMatrix();
yaw=0;pitch=.17;distance=10.35;target.set(0,2.52,-2.70);

// Interaction: four cinematic camera viewpoints plus drag-to-explore.
const tooltip=document.querySelector("#tooltip"),reticle=document.querySelector("#reticle");
const presets={
  front:{yaw:0,pitch:.17,distance:10.35,focus:[0,2.52,-2.70]},
  left:{yaw:-.60,pitch:.19,distance:10.70,focus:[-.65,2.57,-2.55]},
  desk:{yaw:.03,pitch:.34,distance:9.20,focus:[0,1.95,-2.46]},
  right:{yaw:.62,pitch:.19,distance:10.65,focus:[.60,2.53,-2.54]}
};
let cameraTransition=null,pressX=0,pressY=0,dragMoved=false;
const viewButtons=[...document.querySelectorAll("[data-scene-view]")];
function selectView(name){
 const pose=presets[name];if(!pose)return;
 cameraTransition=pose;
 viewButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.sceneView===name)));
}
viewButtons.forEach(b=>b.addEventListener("click",()=>selectView(b.dataset.sceneView)));
function pointer(e){
 const rect=canvas.getBoundingClientRect();
 mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
 mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
 reticle.style.left=(e.clientX-rect.left)+"px";
 reticle.style.top=(e.clientY-rect.top)+"px";
 return rect;
}
viewport.addEventListener("pointermove",e=>{
 const rect=pointer(e);
 if(drag){
   if(Math.hypot(e.clientX-pressX,e.clientY-pressY)>5)dragMoved=true;
   yaw=Math.max(-1.04,Math.min(1.04,yaw-(e.clientX-px)*.0048));
   pitch=Math.max(-.09,Math.min(.49,pitch+(e.clientY-py)*.0038));
   px=e.clientX;py=e.clientY;
 }
 ray.setFromCamera(mouse,camera);
 const hit=ray.intersectObjects(interactives,false)[0];hovered=hit?.object||null;
 if(hovered && !drag){
   tooltip.style.display="block";tooltip.textContent=hovered.userData.name;
   tooltip.style.left=(e.clientX-rect.left+14)+"px";
   tooltip.style.top=(e.clientY-rect.top+14)+"px";
   reticle.style.opacity=1;
 }else{
   tooltip.style.display="none";reticle.style.opacity=0;
 }
});
viewport.addEventListener("pointerdown",e=>{
 if(e.target.closest("button,input,form,.ask,.camera-nav"))return;
 if(e.button!==0)return;
 cameraTransition=null;
 viewButtons.forEach(b=>b.setAttribute("aria-pressed","false"));
 drag=true;dragMoved=false;pressX=px=e.clientX;pressY=py=e.clientY;
 viewport.classList.add("dragging");
});
window.addEventListener("pointerup",()=>{
 if(drag&&!dragMoved&&hovered)hovered.userData.action?.();
 drag=false;viewport.classList.remove("dragging");
});
viewport.addEventListener("pointerleave",()=>{
 tooltip.style.display="none";reticle.style.opacity=0;
});
viewport.addEventListener("wheel",e=>{
 e.preventDefault();cameraTransition=null;
 distance=Math.max(7.9,Math.min(12.9,distance+e.deltaY*.006));
},{passive:false});
const intro=document.querySelector("#intro"),askForm=document.querySelector("#askForm");
document.querySelector("#enterBtn").addEventListener("click",()=>{
 entered=true;intro.classList.add("gone");askForm.classList.remove("hidden");
 say("Dobby is at your service. You may ask three questions about Master Chai.",3700);
});
document.querySelector("#dobbyToggle").addEventListener("click",()=>{
 if(count>=MAX){say("Dobby has used his three questions. Master Chai needs the compute back.",3600);return;}
 if(!entered){document.querySelector("#enterBtn").click();return;}
 askForm.classList.toggle("hidden");
 if(!askForm.classList.contains("hidden"))document.querySelector("#question").focus();
});
window.addEventListener("keydown",e=>{
 if(e.key==="Escape")askForm.classList.add("hidden");
 if(e.target.matches("input,textarea"))return;
 if(e.key==="ArrowLeft")selectView("left");
 if(e.key==="ArrowRight")selectView("right");
 if(e.key==="Home")selectView("front");
});
// Subtle opt-in ambient hum: silent by default, with a real functional toggle.
let ambientContext=null,ambientGain=null,ambientOn=false;
const soundButton=document.querySelector("#soundToggle");
soundButton.addEventListener("click",async()=>{
 try{
   if(!ambientContext){
     const AudioContextClass=window.AudioContext||window.webkitAudioContext;
     if(!AudioContextClass){soundButton.textContent="SOUND UNAVAILABLE";return;}
     ambientContext=new AudioContextClass();
     const hum=ambientContext.createOscillator();
     hum.type="sine";hum.frequency.value=84;
     ambientGain=ambientContext.createGain();ambientGain.gain.value=0;
     hum.connect(ambientGain).connect(ambientContext.destination);hum.start();
   }
   await ambientContext.resume();
   ambientOn=!ambientOn;
   ambientGain.gain.setTargetAtTime(ambientOn?.007:0,ambientContext.currentTime,.16);
   soundButton.textContent=ambientOn?"◖ SOUND ON":"◖ SOUND OFF";
   soundButton.setAttribute("aria-pressed",String(ambientOn));
 }catch{
   soundButton.textContent="SOUND UNAVAILABLE";
 }
});

function say(t,ms=2300){clearTimeout(dialogTimer);const d=document.querySelector("#dialogue");document.querySelector("#dialogueText").textContent=t;d.classList.remove("hidden");dialogTimer=setTimeout(()=>d.classList.add("hidden"),ms)}
async function answer(q){const l=q.toLowerCase();if(/where|location|free|available/.test(l))return "Master Chai is working. Dobby can be more specific if you insist: probably Workers.io, a meeting, or both.";if(/sleep/.test(l))return "Dobby has seen the sleeping mat. Dobby has not seen Master Chai use it.";if(/build|worker/.test(l))return "Master Chai is building Workers.io. This explains the alarming amount of compute in Dobby's workshop.";if(!API_URL)return "Master Chai is working. Dobby's larger language model is currently borrowing the rest of the compute.";const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:[]})});if(!r.ok)throw Error();return (await r.json()).reply}
document.querySelector("#askForm").addEventListener("submit",async e=>{e.preventDefault();if(count>=MAX)return;const input=document.querySelector("#question"),q=input.value.trim();if(!q)return;input.value="";input.disabled=true;try{say("Dobby is thinking…",900);const a=await answer(q);count++;qstones[3-count].material.emissiveIntensity=.05;qstones[3-count].material.color.set(0x3c4b47);document.querySelector("#budget").textContent=["○ ○ ○","● ● ○","● ○ ○","○ ○ ○"][count];setTimeout(()=>say(a,4200),950);if(count===MAX)setTimeout(()=>{document.querySelector("#askForm").classList.add("hidden");say("Master Chai needs the compute back. Of course he does.",4500)},5600)}catch{say("Dobby lost the compute. Master Chai is probably using it.",3200)}finally{input.disabled=false;input.focus()}});
// resize/render
function resize(){const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(viewport);resize();
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(cameraTransition){
  const v=cameraTransition, smoothing=.07;
  yaw+=(v.yaw-yaw)*smoothing;
  pitch+=(v.pitch-pitch)*smoothing;
  distance+=(v.distance-distance)*smoothing;
  target.lerp(new THREE.Vector3(...v.focus),smoothing);
  if(Math.abs(yaw-v.yaw)<.001&&Math.abs(pitch-v.pitch)<.001&&Math.abs(distance-v.distance)<.01){cameraTransition=null;}
}
const cp=Math.cos(pitch);camera.position.set(target.x+distance*Math.sin(yaw)*cp,target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*cp);camera.lookAt(target);if(lampGroup.userData.swing){lampGroup.rotation.z=Math.sin(t*8)*.22*lampGroup.userData.swing;lampGroup.userData.swing*=.965;if(lampGroup.userData.swing<.02){lampGroup.userData.swing=0;lampGroup.rotation.z=0}}if(bottle.userData.pulse){bottle.scale.y=1+Math.sin(t*15)*.12;bottle.rotation.y+=.08;bottle.userData.pulse*=.97;if(bottle.userData.pulse<.03){bottle.userData.pulse=0;bottle.scale.y=1}}crystal.rotation.y+=.006;crystal.material.emissiveIntensity=crystal.userData.on?2.8+Math.sin(t*3)*.5:1.1;if(pencil.userData.roll){pencil.rotation.z+=.18;pencil.position.x+=.025;if(pencil.position.x>2){pencil.userData.roll=0}}owlHead.rotation.y=Math.sin(t*.7)*.18;
letters.forEach(l=>{if(l.userData.fly){l.position.y+=.018*l.userData.fly;l.rotation.z+=.045*l.userData.fly;l.userData.fly*=.975}});
if(meetingClock.userData.spin){meetingClock.rotation.z+=.28*meetingClock.userData.spin;meetingClock.userData.spin*=.97}
if(sealed.userData.shake){sealed.rotation.y=Math.sin(t*35)*.12*sealed.userData.shake;sealed.userData.shake*=.96}
if(blueprint.userData.lift){blueprint.position.y=2.09+.12*Math.sin(t*10)*blueprint.userData.lift;blueprint.userData.lift*=.95}
cozyWorkshop.update(t);renderer.render(scene,camera)}animate();