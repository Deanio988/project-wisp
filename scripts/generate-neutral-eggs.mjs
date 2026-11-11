// Deterministic original family-neutral egg pixel art; no external dependencies.
// Output: four 96x96 RGBA PNGs, deliberately independent of hatch genetics.
import {mkdirSync,writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
const stages=['dormant','awakening','forming','emergence'];
const W=96,H=96;
function crc(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function chunk(name,data){const n=Buffer.from(name);const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const check=Buffer.alloc(4);check.writeUInt32BE(crc(Buffer.concat([n,data])));return Buffer.concat([len,n,data,check])}
function png(bytes){const scan=Buffer.alloc(H*(1+W*4));for(let y=0;y<H;y++){const p=y*(1+W*4);scan[p]=0;bytes.copy(scan,p+1,y*W*4,(y+1)*W*4)}const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',deflateSync(scan, {level:9})),chunk('IEND',Buffer.alloc(0))])}
function render(stageIndex){
 const px=Buffer.alloc(W*H*4);
 function dot(x,y,r,g,b,a=255){if(x<0||x>=W||y<0||y>=H)return;const p=(y*W+x)*4;px[p]=r;px[p+1]=g;px[p+2]=b;px[p+3]=a}
 function rect(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)dot(xx,yy,...c)}
 // Low-resolution block pixels scaled by three: deliberate pixel art, no smooth interpolation.
 const S=3;
 function block(x,y,c){rect(x*S,y*S,S,S,c)}
 const shell=[196,181,209],edge=[82,71,112],shade=[146,129,174],light=[235,224,229],gold=[249,211,142],glow=[176,217,230];
 for(let y=3;y<30;y++)for(let x=3;x<29;x++){
  const dx=(x-15.5)/10.2,dy=(y-16.8)/12.2;
  const shape=dx*dx+dy*dy+(dy<0?Math.abs(dy)*0.035:0);
  if(shape<=1.0){
   const rim=shape>0.82;
   const c=rim?edge:(x>20||y>21)?shade:(x<12&&y<13)?light:shell;
   block(x,y,c);
  }
 }
 // An enigmatic central constellation, identical across families.
 const stars=[[12,12],[19,11],[16,17],[11,21],[20,22],[15,25]];
 for(let i=0;i<stars.length;i++){
  const [x,y]=stars[i];
  if(i<2+stageIndex){block(x,y,gold);if(stageIndex>=2)block(x+1,y,glow)}
 }
 if(stageIndex>=1)for(const [x,y] of [[7,10],[24,13],[9,26]])block(x,y,glow);
 if(stageIndex>=2)for(const [x,y] of [[14,8],[22,18],[6,18],[26,25]])block(x,y,gold);
 if(stageIndex===3){
  // Luminous fissure before emergence; no family-specific silhouette.
  for(const [x,y] of [[15,7],[16,8],[15,9],[14,10],[15,11],[16,12],[15,13],[16,14],[15,15],[14,16],[15,17],[16,18],[15,19],[14,20],[15,21],[16,22]])block(x,y,light);
 }
 return png(px);
}
mkdirSync('preview/art/eggs',{recursive:true});
for(let i=0;i<stages.length;i++)writeFileSync('preview/art/eggs/neutral_egg_'+stages[i]+'.png',render(i));
console.log('Generated four 96x96 family-neutral egg PNGs');
