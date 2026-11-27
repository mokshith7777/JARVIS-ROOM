export async function attachArcReactorShader(THREE, parent) {
  const [vertexShader,fragmentShader]=await Promise.all([
    fetch(new URL('../shaders/arc-reactor.vert',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Arc vertex shader unavailable');return r.text();}),
    fetch(new URL('../shaders/arc-reactor.frag',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Arc fragment shader unavailable');return r.text();})
  ]);
  const uniforms={uTime:{value:0},uColor:{value:new THREE.Color('#38dfff')},uOpacity:{value:0.92}};
  const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const outer=new THREE.Mesh(new THREE.TorusGeometry(0.365,0.012,10,128),material);
  outer.position.z=0.012;parent.add(outer);
  const innerMaterial=material.clone();
  innerMaterial.uniforms={uTime:{value:0},uColor:{value:new THREE.Color('#ff315f')},uOpacity:{value:0.62}};
  const inner=new THREE.Mesh(new THREE.TorusGeometry(0.225,0.008,8,96),innerMaterial);
  inner.position.z=0.018;parent.add(inner);
  return {update(time){uniforms.uTime.value=time;innerMaterial.uniforms.uTime.value=time*-1.3;outer.rotation.z=time*0.18;inner.rotation.z=time*-0.32;}};
}
