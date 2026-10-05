import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

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
const lampGroup=new THREE.Group();scene.add(lampGroup);lampGroup.position.set(3.45,5.8,.25);
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
const perch=box(1.1,.1,.35,wood,-3.55,4.75,-2.1);const owlBody=mesh(new THREE.SphereGeometry(.38,18,14),mat(0x9b7651,.95),-3.55,5.3,-2.05);owlBody.scale.set(.8,1.25,.75);const owlHead=mesh(new THREE.SphereGeometry(.34,18,14),mat(0xb49168,.95),-3.55,5.72,-2.04);addInteractive(owlHead,"WORKSHOP OWL",()=>say("Letters for Master Chai. Mostly meeting invites. Tragic."));
// to-do board
const todo=box(1.7,2.05,.08,label("DOBBY / TO-DO\n01 HELP CHAI\n02 PROTECT COMPUTE\n03 FIND SOCKS\n04 MORE WORK",-1),-2.15,4.35,-3.15);addInteractive(todo,"DOBBY'S TO-DO LIST",()=>say("Item one is ongoing. Item four keeps reproducing."));
// three magical portraits — each has its own character, motion and story
const portraits=[];
function portrait(x,y,w,h,c1,c2,title,kind,line){
  const frame=box(w+.18,h+.18,.12,brass,x,y,-3.05);
  const art=box(w,h,.07,new THREE.MeshStandardMaterial({map:canvasTexture((g,W,H)=>{
    const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.fillStyle="rgba(18,20,18,.72)";g.beginPath();g.arc(W*.5,H*.38,H*.16,0,Math.PI*2);g.fill();g.fillRect(W*.37,H*.53,W*.26,H*.36);
    g.fillStyle="rgba(245,220,165,.78)";g.font="700 22px serif";g.textAlign="center";g.fillText(title,W/2,H-18);
  }),roughness:.72}),x,y,-2.97);
  art.userData.portraitKind=kind; art.userData.baseX=x; art.userData.baseY=y; art.userData.baseZ=-2.97; portraits.push(art);
  addInteractive(art,title,()=>{art.userData.magic=1; say(line,3600);});
  return art;
}
portrait(.1,4.7,1.15,1.55,"#31574e","#b87943","THE HOUSEKEEPER","chores","Dobby, your socks are still on the stairs. And the owl has not been fed. Master Chai working is not an excuse.");
portrait(1.55,4.45,.95,1.25,"#59344f","#c49a58","THE PROFESSOR","hogwarts","A message from Hogwarts: Dobby is reminded that wandering corridors after curfew remains frowned upon.");
portrait(2.72,4.8,.8,1.05,"#29436b","#769478","NIGHT SHIFT","chai","Master Chai status report: still working. Meeting count: unreasonable. Probability of stopping soon: extremely low.");
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
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();const cp=Math.cos(pitch);camera.position.set(target.x+distance*Math.sin(yaw)*cp,target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*cp);camera.lookAt(target);if(lampGroup.userData.swing){lampGroup.rotation.z=Math.sin(t*8)*.22*lampGroup.userData.swing;lampGroup.userData.swing*=.965;if(lampGroup.userData.swing<.02){lampGroup.userData.swing=0;lampGroup.rotation.z=0}}if(bottle.userData.pulse){bottle.scale.y=1+Math.sin(t*15)*.12;bottle.rotation.y+=.08;bottle.userData.pulse*=.97;if(bottle.userData.pulse<.03){bottle.userData.pulse=0;bottle.scale.y=1}}crystal.rotation.y+=.006;crystal.material.emissiveIntensity=crystal.userData.on?2.8+Math.sin(t*3)*.5:1.1;if(pencil.userData.roll){pencil.rotation.z+=.18;pencil.position.x+=.025;if(pencil.position.x>2){pencil.userData.roll=0}}owlHead.rotation.y=Math.sin(t*.7)*.18;
portraits.forEach((p,i)=>{
  const m=p.userData.magic||0;if(!m)return;
  if(p.userData.portraitKind==="chores"){p.rotation.z=Math.sin(t*16)*.065*m;p.position.y=p.userData.baseY+Math.abs(Math.sin(t*8))*.09*m;}
  if(p.userData.portraitKind==="hogwarts"){p.position.z=p.userData.baseZ+Math.sin(t*7)*.16*m;p.rotation.y=Math.sin(t*5)*.12*m;}
  if(p.userData.portraitKind==="chai"){p.position.x=p.userData.baseX+Math.sin(t*22)*.055*m;p.scale.y=1+Math.sin(t*11)*.035*m;}
  p.userData.magic*=.975;
  if(p.userData.magic<.02){p.userData.magic=0;p.position.set(p.userData.baseX,p.userData.baseY,p.userData.baseZ);p.rotation.set(0,0,0);p.scale.set(1,1,1);}
});
letters.forEach(l=>{if(l.userData.fly){l.position.y+=.018*l.userData.fly;l.rotation.z+=.045*l.userData.fly;l.userData.fly*=.975}});
if(meetingClock.userData.spin){meetingClock.rotation.z+=.28*meetingClock.userData.spin;meetingClock.userData.spin*=.97}
if(sealed.userData.shake){sealed.rotation.y=Math.sin(t*35)*.12*sealed.userData.shake;sealed.userData.shake*=.96}
if(blueprint.userData.lift){blueprint.position.y=2.09+.12*Math.sin(t*10)*blueprint.userData.lift;blueprint.userData.lift*=.95}
renderer.render(scene,camera)}animate();