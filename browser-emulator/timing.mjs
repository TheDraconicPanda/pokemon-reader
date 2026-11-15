// SPDX-License-Identifier: GPL-3.0-or-later
export const FRAME_SECONDS=263*2130/33513982;
// A slow host loses wall time, never speeds up later to erase a deficit.
// At most two frames per tick absorbs timer jitter without unbounded UI stalls.
export class Pacer {
  reset(now){this.next=now;}
  due(now){if(this.next===undefined)this.reset(now);return now>=this.next;}
  advance(seconds,now){this.next+=seconds*1000;if(now-this.next>FRAME_SECONDS*2000)this.next=now;}
  delay(now){return Math.max(0,this.next-now);}
}
export class Metrics {
  constructor(now=0){this.reset(now);}
  reset(now){this.started=now;this.emulated=0;this.frames=0;this.costs=[];this.lastEnd=now;this.intervals=[];}
  frame(seconds,cost,end){this.emulated+=seconds;this.frames++;this.costs.push(cost);this.intervals.push(end-this.lastEnd);this.lastEnd=end;if(this.costs.length>600){this.costs.shift();this.intervals.shift();}}
  report(now){const wall=(now-this.started)/1000;const sorted=[...this.costs].sort((a,b)=>a-b);return {
    activeSeconds:wall,emulatedSeconds:this.emulated,speed:wall?this.emulated/wall:0,emulatedFrames:this.frames,
    coreFrameMeanMs:this.costs.reduce((a,b)=>a+b,0)/(this.costs.length||1),coreFrameP95Ms:sorted[Math.floor((sorted.length-1)*.95)]||0,
    frameIntervalMeanMs:this.intervals.reduce((a,b)=>a+b,0)/(this.intervals.length||1)};}
}
