precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
void main(){
 vec2 p=(vUv-0.5)*vec2(uResolution.x/max(uResolution.y,1.0),1.0);
 float radius=length(p),angle=atan(p.y,p.x);
 float ring=exp(-pow((radius-(0.08+uProgress*0.56))*28.0,2.0));
 float inner=exp(-pow(radius*7.5,2.0))*(1.0-smoothstep(0.0,0.24,uProgress));
 float spiral=0.5+0.5*sin(angle*12.0+uTime*8.0+noise(p*8.0)*4.0);
 float rays=pow(max(0.0,spiral),7.0)*ring;
 float fade=1.0-smoothstep(0.68,1.0,uProgress);
 float alpha=clamp((ring*(0.30+rays*0.55)+inner*0.72)*fade,0.0,0.82);
 vec3 color=mix(vec3(0.10,0.82,1.0),vec3(0.20,0.35,1.0),smoothstep(0.12,0.78,radius)+rays*0.25);
 gl_FragColor=vec4(color*(0.8+rays*1.4),alpha);
}
