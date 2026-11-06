import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

export async function addCanopy(map, isVisible = () => true) {
  const response = await fetch('data/city/canopy/index.json');
  if (!response.ok) throw Error('Could not load canopy data');
  const metadata = await response.json();
  const scene = new THREE.Scene(), camera = new THREE.Camera();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x42634a, 2.2));
  const light = new THREE.DirectionalLight(0xffffff, 1.8);
  light.position.set(-100, 300, 100); scene.add(light);
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({color:0x43895d, transparent:true, opacity:.48, roughness:1, depthWrite:false});
  const origin = maplibregl.MercatorCoordinate.fromLngLat([-84.95,32.5]);
  const s = origin.meterInMercatorCoordinateUnits(), earth = 40075016.68557849;
  const model = new THREE.Matrix4().set(s,0,0,origin.x, 0,0,s,origin.y, 0,s,0,0, 0,0,0,1);
  const loaded = new Map(), pending = new Map();
  let renderer, generation = 0;
  const dummy = new THREE.Object3D();
  function dispose(id) {const mesh=loaded.get(id);if(mesh){scene.remove(mesh);mesh.dispose();loaded.delete(id);}}
  async function update() {
    const epoch=++generation, bounds=map.getBounds(), center=map.getCenter(), stride=map.getZoom()<16?4:1;
    const candidates=!isVisible()||map.getZoom()<15?[]:metadata.tiles.filter(t=>t.bounds[0]<bounds.getEast()&&t.bounds[2]>bounds.getWest()&&t.bounds[1]<bounds.getNorth()&&t.bounds[3]>bounds.getSouth());
    candidates.sort((a,b)=>Math.hypot((a.bounds[0]+a.bounds[2])/2-center.lng,(a.bounds[1]+a.bounds[3])/2-center.lat)-Math.hypot((b.bounds[0]+b.bounds[2])/2-center.lng,(b.bounds[1]+b.bounds[3])/2-center.lat));
    const wanted=new Set(candidates.slice(0,32).map(t=>t.id));
    for(const [id,mesh] of loaded)if(!wanted.has(id)||mesh.userData.stride!==stride)dispose(id);
    for(const [id,controller] of pending)if(!wanted.has(id)){controller.abort();pending.delete(id);}
    map.triggerRepaint();
    await Promise.all(candidates.slice(0,32).map(async t=>{
      if(loaded.has(t.id)||pending.has(t.id))return;
      const controller=new AbortController();pending.set(t.id,controller);
      try {
        const r=await fetch(`data/city/canopy/${t.id}.bin`,{signal:controller.signal});if(!r.ok)throw Error('Canopy tile unavailable');
        const a=new Float32Array(await r.arrayBuffer());
        if(epoch!==generation)return;
        const mesh=new THREE.InstancedMesh(geometry,material,Math.ceil(a.length/4/stride));
        for(let i=0,j=0;i<a.length;i+=4*stride,j++){
          dummy.position.set(a[i],a[i+2]*.68,a[i+1]);dummy.scale.set(a[i+3],a[i+2]*.32,a[i+3]);dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate=true;
        mesh.position.set((t.center[0]/earth+.5-origin.x)/s,0,(.5-t.center[1]/earth-origin.y)/s);
        mesh.scale.setScalar(t.scale/earth/s);mesh.userData.stride=stride;
        mesh.computeBoundingSphere();scene.add(mesh);loaded.set(t.id,mesh);map.triggerRepaint();
      } catch(e) {if(e.name!=='AbortError')console.warn(e.message);}
      finally {pending.delete(t.id);}
    }));
    // A camera move can supersede pending requests; retry the new visible selection.
    if(epoch!==generation&&pending.size===0)update();
  }
  map.addLayer({id:'canopy',type:'custom',renderingMode:'3d',onAdd(m,gl){renderer=new THREE.WebGLRenderer({canvas:m.getCanvas(),context:gl});renderer.autoClear=false;},render(gl,args){if(!isVisible()||map.getZoom()<15)return;camera.projectionMatrix.fromArray(args.defaultProjectionData.mainMatrix).multiply(model);renderer.resetState();renderer.render(scene,camera);renderer.resetState();},onRemove(){map.off('moveend',update);map.off('canopyvisibilitychange',update);for(const c of pending.values())c.abort();for(const id of loaded.keys())dispose(id);geometry.dispose();material.dispose();}});
  map.on('moveend',update);map.on('canopyvisibilitychange',update);update();return metadata;
}

export function reverseMouseRotation(map) {
  map.dragRotate.disable();
  const canvas=map.getCanvas();let drag=null;
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==2&&!(e.button===0&&e.ctrlKey))return;
    e.preventDefault();e.stopImmediatePropagation();map.stop();
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,bearing:map.getBearing(),pitch:map.getPitch()};
    canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  },true);
  canvas.addEventListener('mousedown',e=>{if(e.button===2||e.ctrlKey){e.preventDefault();e.stopImmediatePropagation();}},true);
  canvas.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();
    map.jumpTo({bearing:drag.bearing+(e.clientX-drag.x)*.8,pitch:Math.max(0,Math.min(75,drag.pitch-(e.clientY-drag.y)*.5))});
  },true);
  function end(e){if(drag&&drag.id===e.pointerId){drag=null;canvas.style.cursor='';if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
}
