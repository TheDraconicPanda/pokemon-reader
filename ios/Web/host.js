// Installed only in the app's bundled copy, never in the published website.
const config=window.__readerNativeConfig;
export function sendNative(type,extra={}) {
  if(config)window.webkit?.messageHandlers?.reader?.postMessage({type,token:config.token,...extra});
}
if(config){
  const banner=document.createElement('aside');banner.id='native-save-status';banner.setAttribute('role','status');
  banner.style.cssText='padding:12px 16px;background:#17314a;color:white;font:14px system-ui;position:relative;z-index:10;overflow-wrap:anywhere';
  banner.textContent=`${config.name} · ${config.rom.slice(0,12)} · Emulation paused · Reader data stays in this app.`;
  document.body.prepend(banner);
  document.addEventListener('click',async event=>{
    const link=event.target.closest?.('a[download]');if(!link)return;
    event.preventDefault();event.stopImmediatePropagation();
    try{
      if(!link.href.startsWith('blob:'))throw Error('Unsupported export.');
      const blob=await (await fetch(link.href)).blob();if(blob.size>2*1024*1024)throw Error('Export is too large.');
      const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
      sendNative('export',{name:link.download,base64});
    }catch(error){banner.textContent=`Export failed: ${error.message}`;}
  },true);
  if(location.pathname!=='/'&&location.pathname!=='/index.html')sendNative('tool-ready');
}
