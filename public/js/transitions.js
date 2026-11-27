export function initPortalTransition() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'89',pointerEvents:'none'});
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl', {alpha:true,antialias:false,premultipliedAlpha:false});
  if (!gl) return {trigger(){}};
  let program=null, buffer=null, startTime=0, active=false, frame=0;
  let uResolution=null, uTime=null, uProgress=null;
  function compile(type, source) {
    const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message||'Portal shader compile failed');}
    return shader;
  }
  async function setup() {
    const [vs,fs]=await Promise.all([
      fetch(new URL('../shaders/portal.vert',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Portal vertex shader unavailable');return r.text();}),
      fetch(new URL('../shaders/portal.frag',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Portal fragment shader unavailable');return r.text();})
    ]);
    const vertex=compile(gl.VERTEX_SHADER,vs), fragment=compile(gl.FRAGMENT_SHADER,fs);
    program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Portal shader link failed');
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    uResolution=gl.getUniformLocation(program,'uResolution');uTime=gl.getUniformLocation(program,'uTime');uProgress=gl.getUniformLocation(program,'uProgress');
  }
  function resize() {
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.floor(window.innerWidth*dpr));canvas.height=Math.max(1,Math.floor(window.innerHeight*dpr));
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  function render(now) {
    if(!active||!program)return;
    resize();const progress=Math.min(1,(now-startTime)/920);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    const location=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
    gl.uniform2f(uResolution,canvas.width,canvas.height);gl.uniform1f(uTime,(now-startTime)/1000);gl.uniform1f(uProgress,progress);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(progress<1)frame=requestAnimationFrame(render);else{active=false;gl.clear(gl.COLOR_BUFFER_BIT);cancelAnimationFrame(frame);}
  }
  setup().then(()=>{resize();window.addEventListener('resize',resize,{passive:true});if(active)render(performance.now());})
    .catch(error=>console.warn('[JARVIS] Portal shader fallback active.',error));
  return {trigger(){active=true;startTime=performance.now();if(program){cancelAnimationFrame(frame);frame=requestAnimationFrame(render);}}};
}
