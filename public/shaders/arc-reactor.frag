precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
void main(){
 float angle=vUv.x*6.2831853;
 float pulse=0.5+0.5*sin(angle*18.0-uTime*4.5);
 float scan=0.5+0.5*sin(vUv.y*72.0+uTime*7.0);
 float filament=smoothstep(0.35,0.98,pulse*0.72+scan*0.28);
 float edge=smoothstep(0.0,0.18,vUv.y)*(1.0-smoothstep(0.82,1.0,vUv.y));
 float alpha=(0.22+filament*0.78)*edge*uOpacity;
 gl_FragColor=vec4(uColor*(0.7+filament*1.6),alpha);
}
