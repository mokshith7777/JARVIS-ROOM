import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const parts=['source-assets/intro-video.part-01.b64','source-assets/intro-video.part-02.b64','source-assets/intro-video.part-03.b64','source-assets/intro-video.part-04.b64'];
for(const file of parts) if(!fs.existsSync(path.join(root,file))) throw new Error('Missing intro video source chunk: '+file);
const encoded=parts.map(read).join('').replace(/\s+/g,'');
const video=Buffer.from(encoded,'base64');
if(video.length<1000000||video.toString('ascii',4,8)!=='ftyp') throw new Error('Intro video chunks do not form a valid MP4.');
fs.mkdirSync(path.join(root,'public/assets'),{recursive:true});
fs.writeFileSync(path.join(root,'public/assets/intro.mp4'),video);
const imageSources=[
  ['source-assets/hall-left.jpg.b64','public/assets/hall-left.jpg'],
  ['source-assets/hall-right.jpg.b64','public/assets/hall-right.jpg']
];
for(const [sourceFile,targetFile] of imageSources){
  const imageData=Buffer.from(read(sourceFile).replace(/\s+/g,''),'base64');
  if(imageData.length<10000||imageData[0]!==0xff||imageData[1]!==0xd8||imageData[2]!==0xff) {
    throw new Error('Invalid gallery JPEG source: '+sourceFile);
  }
  fs.writeFileSync(path.join(root,targetFile),imageData);
}

const required=[
 'public/index.html','public/styles/studio.css','public/js/main.js','public/js/config.js',
 'public/js/rooms.js','public/js/audio.js','public/js/voice.js','public/js/checkout.js',
 'public/js/transitions.js','public/js/arc-reactor.js','public/config/studio.json',
 'public/shaders/arc-reactor.vert','public/shaders/arc-reactor.frag',
 'public/shaders/portal.vert','public/shaders/portal.frag','public/assets/intro.mp4',\n 'public/assets/hall-left.jpg','public/assets/hall-right.jpg'
];
for(const file of required) if(!fs.existsSync(path.join(root,file))) throw new Error('Missing required file: '+file);
const html=read('public/index.html');
if(Buffer.byteLength(html,'utf8')>16000) throw new Error('index.html shell exceeded 16 KB.');
if(!/<!doctype html>/i.test(html)) throw new Error('HTML doctype missing.');
if(!/\.\/styles\/studio\.css/.test(html)) throw new Error('External stylesheet link missing.');
if(!/type="module"[^>]+\.\/js\/main\.js/.test(html)) throw new Error('ES module entry point missing.');
if(/data:video\/mp4;base64,/i.test(html)) throw new Error('Embedded video remains in HTML.');
const main=read('public/js/main.js');
if(/data:video\/mp4;base64,/i.test(main)) throw new Error('Embedded video remains in JavaScript.');
const imports=[...main.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)].map(m=>m[1]);
for(const specifier of imports) if(!fs.existsSync(path.resolve(root,'public/js',specifier))) throw new Error('Broken local import: '+specifier);
const config=JSON.parse(read('public/config/studio.json'));
if(config.payment?.upiId!=='9391050634@ibl') throw new Error('UPI configuration mismatch.');
if(config.payment?.originalPriceDisplay!=='₹49'||config.payment?.priceDisplay!=='₹19') throw new Error('Pricing configuration mismatch.');
if(!Array.isArray(config.screens)||config.screens.length!==3) throw new Error('Desk screen configuration incomplete.');
const firebase=JSON.parse(read('firebase.json'));
if(firebase.hosting?.public!=='public') throw new Error('Firebase Hosting must serve public/.');
const finalVideo=fs.readFileSync(path.join(root,'public/assets/intro.mp4'));
if(finalVideo.toString('ascii',4,8)!=='ftyp') throw new Error('Generated intro MP4 is invalid.');
console.log('JARVIS ROOM validation passed: modular entry, local imports, config, Firebase directory, shaders and external MP4.');
