import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('actual AudioWorklet resamples, counts underruns/overflow, and excludes paused silence',()=>{
  let Processor;const reports=[];
  class Base{constructor(){this.port={postMessage:m=>reports.push(m)};}}
  vm.runInNewContext(readFileSync(new URL('../audio-worklet.js',import.meta.url),'utf8'),{
    AudioWorkletProcessor:Base,sampleRate:48000,registerProcessor:(name,processor)=>{assert.equal(name,'reader-b1-audio');Processor=processor;}});
  const p=new Processor(),out=[new Float32Array(128),new Float32Array(128)];
  p.process([],[out]);assert.equal(p.underrunFrames,0);
  p.port.onmessage({data:{samples:new Int16Array(128*2).fill(16384)}});
  p.process([],[out]);assert.equal(out[0][0],.5);assert.equal(out[1][127],.5);assert.equal(p.buffered,0);
  p.process([],[out]);assert.equal(p.underrunFrames,128);
  p.port.onmessage({data:{samples:new Int16Array(48000)}});assert.equal(p.droppedFrames,24000);
  p.port.onmessage({data:{reset:true}});p.process([],[out]);assert.equal(p.underrunFrames,128);
  for(let i=0;i<400;i++)p.process([],[out]);assert.ok(reports.length>0);
  vm.runInNewContext(readFileSync(new URL('../audio-worklet.js',import.meta.url),'utf8'),{
    AudioWorkletProcessor:Base,sampleRate:44100,registerProcessor:(_,processor)=>{Processor=processor;}});
  const resampled=new Processor();resampled.port.onmessage({data:{samples:new Int16Array(512).fill(8192)}});
  resampled.process([],[out]);assert.equal(out[0][127],.25);
  assert.ok(Math.abs(resampled.buffered-(256-Math.floor(128*48000/44100)))<=1,'44.1 kHz output consumes 48 kHz input at the correct ratio');
});
