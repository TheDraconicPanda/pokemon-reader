// SPDX-License-Identifier: GPL-3.0-or-later
#import "ReaderWebController.h"
#import <WebKit/WebKit.h>
@interface ReaderWebController () <WKNavigationDelegate,WKScriptMessageHandler,WKUIDelegate>
@end
@implementation ReaderWebController {
    WKWebView *_web;
    NSURL *_origin;
    NSDictionary *_configuration,*_packet;
    NSString *_token;
}
- (instancetype)initWithOrigin:(NSURL *)origin configuration:(NSDictionary *)configuration packet:(NSDictionary *)packet {
    if((self=[super init])){_origin=origin;_configuration=configuration;_packet=packet;_token=configuration[@"token"];}return self;
}
- (void)viewDidLoad {
    [super viewDidLoad];self.title=@"Pokémon Reader";self.view.backgroundColor=UIColor.systemBackgroundColor;
    WKWebViewConfiguration *settings=[WKWebViewConfiguration new];settings.websiteDataStore=WKWebsiteDataStore.defaultDataStore;
    NSString *json=[[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:_configuration options:0 error:nil] encoding:NSUTF8StringEncoding];
    NSString *script=[NSString stringWithFormat:@"Object.defineProperty(window,'__readerNativeConfig',{value:Object.freeze(%@),writable:false});",json];
    [settings.userContentController addUserScript:[[WKUserScript alloc] initWithSource:script injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES]];
    [settings.userContentController addScriptMessageHandler:self name:@"reader"];
    _web=[[WKWebView alloc] initWithFrame:CGRectZero configuration:settings];_web.navigationDelegate=self;_web.UIDelegate=self;
    _web.translatesAutoresizingMaskIntoConstraints=NO;[self.view addSubview:_web];
    [NSLayoutConstraint activateConstraints:@[[_web.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],[_web.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],[_web.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],[_web.bottomAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.bottomAnchor]]];
    self.navigationItem.leftBarButtonItem=[[UIBarButtonItem alloc] initWithTitle:@"Game" style:UIBarButtonItemStyleDone target:self action:@selector(closeReader)];
    self.navigationItem.rightBarButtonItems=@[[[UIBarButtonItem alloc] initWithTitle:@"Tools" style:UIBarButtonItemStylePlain target:self action:@selector(tools)],[[UIBarButtonItem alloc] initWithTitle:@"Back" style:UIBarButtonItemStylePlain target:self action:@selector(back)]];
    [_web loadRequest:[NSURLRequest requestWithURL:_origin]];
}
- (void)closeReader {[_web.configuration.userContentController removeScriptMessageHandlerForName:@"reader"];[_web stopLoading];[self dismissViewControllerAnimated:YES completion:nil];}
- (void)back {if(_web.canGoBack)[_web goBack];else [_web loadRequest:[NSURLRequest requestWithURL:_origin]];}
- (void)tools {
    UIAlertController *menu=[UIAlertController alertControllerWithTitle:@"Reader tools" message:@"Emulation stays paused. Adventure data is stored in this app." preferredStyle:UIAlertControllerStyleActionSheet];
    BOOL platinum=[_configuration[@"game"] isEqual:@"platinum"];
    NSArray *entries=@[@[@"Reader",@"/"],@[@"Team Planner",@"/team-planner/"],@[@"Pokédex",platinum?@"/pokedex/#game=platinum":@"/pokedex/"],@[@"Atlas",platinum?@"/pokedex-earth/#atlas&game=platinum":@"/pokedex-earth/#atlas"],platinum?@[@"Great Marsh",@"/pokedex-earth/#great-marsh&game=platinum"]:@[@"Safari Zone",@"/safari-zone/"]];
    for(NSArray *entry in entries)[menu addAction:[UIAlertAction actionWithTitle:entry[0] style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self->_web loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:entry[1] relativeToURL:self->_origin]]];}]];
    [menu addAction:[UIAlertAction actionWithTitle:@"Reload page" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self->_web reload];}]];
    [menu addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];
    menu.popoverPresentationController.barButtonItem=self.navigationItem.rightBarButtonItems.firstObject;[self presentViewController:menu animated:YES completion:nil];
}
- (BOOL)localURL:(NSURL *)url {return [url.scheme isEqual:_origin.scheme]&&[url.host isEqual:_origin.host]&&[url.port isEqual:_origin.port];}
- (void)webView:(WKWebView *)web decidePolicyForNavigationAction:(WKNavigationAction *)action decisionHandler:(void (^)(WKNavigationActionPolicy))decision {
    NSURL *url=action.request.URL;
    if([self localURL:url]){decision(WKNavigationActionPolicyAllow);if(!action.targetFrame)[web loadRequest:action.request];return;}
    decision(WKNavigationActionPolicyCancel);
    if(action.navigationType==WKNavigationTypeLinkActivated&&[@[@"https",@"http"] containsObject:url.scheme]){
        UIAlertController *alert=[UIAlertController alertControllerWithTitle:@"Open reference in Safari?" message:@"Reader data stays in this app and is not shared with Safari." preferredStyle:UIAlertControllerStyleAlert];
        [alert addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];
        [alert addAction:[UIAlertAction actionWithTitle:@"Open Safari" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a){[UIApplication.sharedApplication openURL:url options:@{} completionHandler:nil];}]];[self presentViewController:alert animated:YES completion:nil];
    }
}
- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if(!message.frameInfo.mainFrame||![self localURL:message.frameInfo.request.URL]||![message.body isKindOfClass:NSDictionary.class])return;
    NSDictionary *body=message.body;if(![body[@"token"] isEqual:_token])return;
    if([body[@"type"] isEqual:@"ready"]){
        NSString *json=[[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:_packet options:0 error:nil] encoding:NSUTF8StringEncoding];
        [_web evaluateJavaScript:[NSString stringWithFormat:@"void window.__readerReceive(%@)",json] completionHandler:^(id value,NSError *error){if(error)[self showError:error.localizedDescription];}];
    }else if([body[@"type"] isEqual:@"export"]){
        NSString *encoded=body[@"base64"],*name=body[@"name"];
        if(![encoded isKindOfClass:NSString.class]||encoded.length>3*1024*1024||![name isKindOfClass:NSString.class])return;
        NSData *data=[[NSData alloc] initWithBase64EncodedString:encoded options:0];if(!data.length||data.length>2*1024*1024)return;
        NSString *safe=name.lastPathComponent;if(!safe.length||[safe hasPrefix:@"."])safe=@"reader-export.sav";
        NSURL *folder=[NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask].firstObject;
        folder=[[folder URLByAppendingPathComponent:@"Exports"] URLByAppendingPathComponent:NSUUID.UUID.UUIDString];NSError *error=nil;
        if(![NSFileManager.defaultManager createDirectoryAtURL:folder withIntermediateDirectories:YES attributes:nil error:&error]){[self showError:error.localizedDescription];return;}
        NSURL *file=[folder URLByAppendingPathComponent:safe];if(![data writeToURL:file options:NSDataWritingAtomic error:&error]){[self showError:error.localizedDescription];return;}
        UIActivityViewController *share=[[UIActivityViewController alloc] initWithActivityItems:@[file] applicationActivities:nil];share.popoverPresentationController.sourceView=self.view;share.popoverPresentationController.sourceRect=CGRectMake(self.view.bounds.size.width/2,self.view.bounds.size.height/2,1,1);[self presentViewController:share animated:YES completion:nil];
    }
}
- (void)showError:(NSString *)message {
    UIAlertController *alert=[UIAlertController alertControllerWithTitle:@"Reader" message:message preferredStyle:UIAlertControllerStyleAlert];[alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];if(!self.presentedViewController)[self presentViewController:alert animated:YES completion:nil];
}
- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView {[self showError:@"Reader was closed by iOS. Use Tools → Reload page to reopen the retained in-game save. Emulation remains paused."];}
- (void)webView:(WKWebView *)webView runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(BOOL))completion {
    UIAlertController *alert=[UIAlertController alertControllerWithTitle:@"Reader" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:^(UIAlertAction *a){completion(NO);}]];
    [alert addAction:[UIAlertAction actionWithTitle:@"Continue" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a){completion(YES);}]];[self presentViewController:alert animated:YES completion:nil];
}
@end
