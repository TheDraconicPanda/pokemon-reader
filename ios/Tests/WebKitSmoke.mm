// SPDX-License-Identifier: GPL-3.0-or-later
// Hosted macOS WebKit runtime check. Nonpersistent storage confines test data to
// this process. This is not an iPhone gameplay/performance acceptance test.
#import <AppKit/AppKit.h>
#import <WebKit/WebKit.h>
#import <CommonCrypto/CommonDigest.h>
#include "ReaderServer.h"
#include <iostream>
@interface Smoke : NSObject <WKScriptMessageHandler,WKNavigationDelegate>
@property(nonatomic,strong) WKWebView *web;
@property(nonatomic,copy) NSString *origin,*fixtures,*game;
@property NSInteger stage;
@property BOOL done,failed;
- (void)start;
@end
@implementation Smoke
- (void)fail:(NSString *)message {std::cerr<<message.UTF8String<<"\n";self.failed=YES;self.done=YES;}
- (void)run:(NSString *)script {
    [self.web evaluateJavaScript:script completionHandler:^(id value,NSError *error){if(error)[self fail:error.localizedDescription];}];
}
- (void)loadGame:(NSString *)game {
    self.game=game;self.stage=0;[self.web.configuration.userContentController removeAllUserScripts];
    NSString *rom=[@"" stringByPaddingToLength:64 withString:[game isEqual:@"soulsilver"]?@"a":@"b" startingAtIndex:0];
    NSDictionary *config=@{@"rom":rom,@"name":game,@"game":game,@"token":@"webkit-smoke"};
    NSString *json=[[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:config options:0 error:nil] encoding:NSUTF8StringEncoding];
    NSString *script=[NSString stringWithFormat:@"window.__readerNativeConfig=%@;window.addEventListener('error',e=>window.webkit.messageHandlers.reader.postMessage({type:'fatal',message:e.message}));window.addEventListener('unhandledrejection',e=>window.webkit.messageHandlers.reader.postMessage({type:'fatal',message:String(e.reason)}));",json];
    [self.web.configuration.userContentController addUserScript:[[WKUserScript alloc] initWithSource:script injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES]];
    [self.web loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:self.origin]]];
}
- (void)start {
    WKWebViewConfiguration *config=[WKWebViewConfiguration new];config.websiteDataStore=WKWebsiteDataStore.nonPersistentDataStore;
    [config.userContentController addScriptMessageHandler:self name:@"reader"];
    self.web=[[WKWebView alloc] initWithFrame:NSMakeRect(0,0,430,932) configuration:config];self.web.navigationDelegate=self;
    [self loadGame:@"soulsilver"];
}
- (void)deliver:(NSString *)which {
    NSString *path=[self.fixtures stringByAppendingPathComponent:[NSString stringWithFormat:@"reader-%@-%@.sav",self.game,which]];
    NSData *raw=[NSData dataWithContentsOfFile:path];if(raw.length!=0x80000){[self fail:@"Missing synthetic WebKit input."];return;}
    unsigned char bytes[CC_SHA256_DIGEST_LENGTH];CC_SHA256(raw.bytes,(CC_LONG)raw.length,bytes);NSMutableString *digest=[NSMutableString new];for(auto b:bytes)[digest appendFormat:@"%02x",b];
    BOOL before=[which isEqual:@"before"];NSString *rom=[@"" stringByPaddingToLength:64 withString:[self.game isEqual:@"soulsilver"]?@"a":@"b" startingAtIndex:0];
    NSDictionary *packet=@{@"rom":rom,@"game":self.game,@"token":@"webkit-smoke",@"base64":[raw base64EncodedStringWithOptions:0],@"digest":digest,@"capturedAt":@(uint64_t(NSDate.date.timeIntervalSince1970*1000)),@"general":@(before?0:1),@"storage":@(before?0:1),@"origin":@"hosted WebKit synthetic cartridge"};
    NSString *json=[[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:packet options:0 error:nil] encoding:NSUTF8StringEncoding];
    [self run:[NSString stringWithFormat:@"void window.__readerReceive(%@)",json]];
}
- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if(![message.body isKindOfClass:NSDictionary.class])return;NSDictionary *body=message.body;NSString *type=body[@"type"];
    if([type isEqual:@"fatal"]||[type isEqual:@"error"]){[self fail:[NSString stringWithFormat:@"WebKit %@: %@",type,body[@"message"]]];return;}
    if([type isEqual:@"ready"]){[self deliver:@"before"];return;}
    if([type isEqual:@"loaded"]){
        if(self.stage==0){self.stage=1;[self deliver:@"completed"];}
        else if(self.stage==1){self.stage=2;
            NSString *script=[NSString stringWithFormat:@"void import('/js/adventures.js').then(async m=>{const p=await m.getActiveProfile();if(p.gameId!=='%@'||p.revision!==2||p.snapshot.storage.boxes.length!==18%@)throw Error('Wrong app-local adventure');webkit.messageHandlers.reader.postMessage({type:'verified'});}).catch(e=>webkit.messageHandlers.reader.postMessage({type:'fatal',message:String(e)}))",self.game,[self.game isEqual:@"soulsilver"]?@"||p.snapshot.storage.boxes[0].pokemon[0].speciesId!==133":@""];
            [self run:script];
        }return;
    }
    if([type isEqual:@"verified"]){
        if([self.game isEqual:@"soulsilver"])[self loadGame:@"platinum"];
        else {self.stage=3;[self.web loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[self.origin stringByAppendingString:@"pokedex-earth/#great-marsh&game=platinum"]]]];}return;
    }
    if([type isEqual:@"tool-ready"]&&self.stage==3){
        [self run:@"void (async()=>{for(let i=0;i<150;i++){if(document.querySelector('#great-marsh-status')?.textContent.includes('Saved daily selection')){webkit.messageHandlers.reader.postMessage({type:'done'});return;}await new Promise(r=>setTimeout(r,100));}throw Error('Great Marsh did not use the app-local profile');})().catch(e=>webkit.messageHandlers.reader.postMessage({type:'fatal',message:String(e)}))"];return;
    }
    if([type isEqual:@"done"]){self.done=YES;}
}
- (void)webView:(WKWebView *)web decidePolicyForNavigationAction:(WKNavigationAction *)action decisionHandler:(void (^)(WKNavigationActionPolicy))decision {
    decision([action.request.URL.absoluteString hasPrefix:self.origin]?WKNavigationActionPolicyAllow:WKNavigationActionPolicyCancel);
}
@end
int main(int argc,char** argv){@autoreleasepool{
    if(argc!=3)return 2;[NSApplication sharedApplication];
    try{reader::ReaderServer server(argv[1],0);Smoke *smoke=[Smoke new];smoke.origin=[NSString stringWithFormat:@"http://127.0.0.1:%u/",server.port()];smoke.fixtures=@(argv[2]);[smoke start];
        NSDate *deadline=[NSDate dateWithTimeIntervalSinceNow:90];while(!smoke.done&&deadline.timeIntervalSinceNow>0)[NSRunLoop.currentRunLoop runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
        [smoke.web.configuration.userContentController removeScriptMessageHandlerForName:@"reader"];
        if(!smoke.done||smoke.failed)return 1;std::cout<<"PASS: real macOS WKWebView, loopback ES modules, offline metadata, HGSS/Platinum completed saves, app-local IndexedDB updates and Great Marsh navigation.\n";return 0;
    }catch(const std::exception& error){std::cerr<<error.what()<<"\n";return 1;}
}}
