// SPDX-License-Identifier: GPL-3.0-or-later
class ReaderAudio extends AudioWorkletProcessor {
  constructor(){super();this.queue=[];this.offset=0;this.phase=0;this.underrunFrames=0;this.droppedFrames=0;this.total=0;this.buffered=0;this.enabled=false;
    this.port.onmessage=({data})=>{if(data.reset){this.queue=[];this.offset=0;this.phase=0;this.buffered=0;this.enabled=false;return;}
      if(data.samples){this.enabled=true;const n=data.samples.length/2;if(this.buffered+n>48000/4){this.droppedFrames+=n;return;}this.queue.push(data.samples);this.buffered+=n;}};
  }
  process(inputs,outputs){const out=outputs[0];if(!out?.length)return true;
    const ratio=48000/sampleRate;
    for(let i=0;i<out[0].length;i++){
      const head=this.queue[0];
      if(head){out[0][i]=head[this.offset*2]/32768;out[1][i]=head[this.offset*2+1]/32768;
        this.phase+=ratio;let step=Math.floor(this.phase);this.phase-=step;
        while(step--&&this.queue.length){this.offset++;this.buffered--;if(this.offset*2>=this.queue[0].length){this.queue.shift();this.offset=0;}}
      }else if(this.enabled){this.underrunFrames++;}
    }
    this.total+=out[0].length;if(this.total>=sampleRate){this.total=0;this.port.postMessage({underrunFrames:this.underrunFrames,droppedFrames:this.droppedFrames,bufferedMs:this.buffered/48});}
    return true;
  }
}
registerProcessor('reader-b1-audio',ReaderAudio);
