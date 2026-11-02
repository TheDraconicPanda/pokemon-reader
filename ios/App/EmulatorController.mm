// SPDX-License-Identifier: GPL-3.0-or-later
#import "EmulatorController.h"
#import "ScreenView.h"
#import <AVFoundation/AVFoundation.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <CommonCrypto/CommonDigest.h>
#import <GameController/GameController.h>
#include "Core.h"
#include "Library.h"
#include "Input.h"
#include "../Tests/TestROM.h"
#include <sys/utsname.h>
#include <chrono>
#include <cmath>

namespace {
struct AudioPipe {
    reader::AudioRing<8192> ring;
    std::atomic<bool> playing{false}, primed{false};
    std::atomic<uint64_t> missingFrames{0}, overflowFrames{0};
};
struct FrameStats {
    uint64_t frames=0, slowFrames=0;
    double emulated=0, coreWall=0, maxFrame=0;
    std::array<uint64_t,1001> histogram{};
};
NSString *digest(NSData *data) {
    unsigned char hash[CC_SHA256_DIGEST_LENGTH];CC_SHA256(data.bytes,(CC_LONG)data.length,hash);
    NSMutableString *s=[NSMutableString new];for(unsigned char b:hash)[s appendFormat:@"%02x",b];return s;
}
std::vector<uint8_t> bytes(NSData *data) {
    if(!data.length)return {};auto p=static_cast<const uint8_t*>(data.bytes);return {p,p+data.length};
}
}

@interface GameLibraryController : UITableViewController
@property(nonatomic,copy) NSArray<NSDictionary *> *entries;
@property(nonatomic,copy) void (^openGame)(NSString *identity);
@end
@implementation GameLibraryController
- (void)viewDidLoad { [super viewDidLoad];self.title=@"Game library";
    self.navigationItem.rightBarButtonItem=[[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(done)];
    UILabel *note=[[UILabel alloc] initWithFrame:CGRectMake(0,0,300,76)];note.numberOfLines=3;note.textAlignment=NSTextAlignmentCenter;note.font=[UIFont systemFontOfSize:12];
    note.text=@"Choose a game to continue from its cartridge save.\nUse Import ROM to add a game.\nDifferent ROM versions keep separate saves.";self.tableView.tableHeaderView=note;
}
- (void)done { [self dismissViewControllerAnimated:YES completion:nil]; }
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section { return self.entries.count; }
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)path {
    UITableViewCell *cell=[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:nil];NSDictionary *entry=self.entries[path.row];
    cell.textLabel.text=entry[@"name"];cell.detailTextLabel.text=[NSString stringWithFormat:@"%@ · ROM %@",entry[@"code"],[entry[@"id"] substringToIndex:12]];
    cell.accessoryType=UITableViewCellAccessoryDisclosureIndicator;return cell;
}
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)path {
    NSString *identity=self.entries[path.row][@"id"];[self dismissViewControllerAnimated:YES completion:^{if(self.openGame)self.openGame(identity);}];
}
@end

@interface EmulatorController () <UIDocumentPickerDelegate>
@end
@implementation EmulatorController {
    dispatch_queue_t _emulation,_storage;
    dispatch_source_t _frameTimer;
    std::shared_ptr<reader::Core> _core;
    std::unique_ptr<reader::Library> _library; // storage queue only
    std::string _emulatedID;
    uint64_t _generation,_storedRevision,_observedRevision;
    double _dirtySince,_lastChange,_lastAttempt;
    bool _savePending;
    std::shared_ptr<AudioPipe> _pipe;
    std::atomic<bool> _playing;
    std::atomic<uint64_t> _timerEpoch;
    NSUInteger _lifecycleEpoch;
    reader::InputState _input;
    FrameStats _stats; // confined to _emulation
    std::array<uint32_t,reader::Pixels*2> _video;
    ScreenView *_screen;
    UIStackView *_playArea,*_controls;
    NSLayoutConstraint *_controlWidth,*_controlHeight;
    UILabel *_status,*_metrics,*_title,*_warning;
    UIButton *_pause,*_record;
    AVAudioEngine *_audio;
    NSTimer *_statusTimer;
    NSData *_rom,*_save,*_bios7,*_bios9,*_firmware;
    NSString *_romName,*_romHash,*_purpose,*_scene,*_gameID;
    NSDictionary *_lastStats,*_activeSystemFiles;
    NSMutableArray *_samples,*_events;
    BOOL _loaded,_loading,_recording,_storageReady,_saveFailure;
    double _activeBeforePause,_resumedAt,_benchmarkStart;
    NSInteger _pauseCount;
}
- (void)viewDidLoad {
    [super viewDidLoad];
    _playing=false;_timerEpoch=0;_input.clear();
    _emulation=dispatch_queue_create("dev.thedraconicpanda.emulation",DISPATCH_QUEUE_SERIAL);
    dispatch_set_target_queue(_emulation,dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE,0));
    _storage=dispatch_queue_create("dev.thedraconicpanda.storage",DISPATCH_QUEUE_SERIAL);
    _samples=[NSMutableArray new];_events=[NSMutableArray new];_scene=@"unlabelled";
    self.view.backgroundColor=UIColor.systemBackgroundColor;
    _title=[UILabel new];_title.text=@"Reader Emulator · 0.2.0";_title.font=[UIFont boldSystemFontOfSize:19];
    _status=[UILabel new];_status.text=@"Open a SoulSilver/Platinum ROM, or run the built-in diagnostic.";
    _status.font=[UIFont systemFontOfSize:12];_status.numberOfLines=2;
    UIStackView *files=[self row:@[
      [self action:@"Library" selector:@selector(showLibrary)],
      [self action:@"Import ROM" selector:@selector(openROM)],
      [self action:@"Game save" selector:@selector(openSave)],
      [self action:@"More" selector:@selector(more)]]];
    _pause=[self action:@"Resume" selector:@selector(togglePause)];_pause.enabled=NO;
    _record=[self action:@"Record test" selector:@selector(recordTest)];
    UIStackView *actions=[self row:@[_pause,[self action:@"Export save" selector:@selector(exportSave)],_record,[self action:@"Report" selector:@selector(exportReport)]]];
    _metrics=[UILabel new];_metrics.text=@"Normal speed · melonDS 1.1 · no fast-forward";
    _metrics.font=[UIFont monospacedDigitSystemFontOfSize:11 weight:UIFontWeightRegular];_metrics.numberOfLines=2;
    id<MTLDevice> device=MTLCreateSystemDefaultDevice();
    if(!device){[self error:@"Metal is unavailable on this device."];return;}
    _screen=[[ScreenView alloc] initWithFrame:CGRectZero device:device];_screen.paused=YES;
    __weak EmulatorController *weakSelf=self;
    _screen.touchHandler=^(int x,int y){EmulatorController *s=weakSelf;if(s)s->_input.setTouch(s->_playing.load()?x:-1,y);};
    _controls=[self buildControls];
    _playArea=[[UIStackView alloc] initWithArrangedSubviews:@[_screen,_controls]];_playArea.spacing=8;
    _controlWidth=[_controls.widthAnchor constraintEqualToConstant:260];
    _controlHeight=[_controls.heightAnchor constraintEqualToConstant:148];
    _warning=[UILabel new];_warning.numberOfLines=2;_warning.font=[UIFont systemFontOfSize:11];_warning.textColor=UIColor.secondaryLabelColor;
    _warning.text=@"Save normally in-game to keep progress. Cartridge saves are stored automatically. Recovery states arrive in E3. Keep exported backups.";
    UIStackView *root=[[UIStackView alloc] initWithArrangedSubviews:@[_title,_status,files,actions,_metrics,_playArea,_warning]];
    root.axis=UILayoutConstraintAxisVertical;root.spacing=6;root.translatesAutoresizingMaskIntoConstraints=NO;[self.view addSubview:root];
    UILayoutGuide *safe=self.view.safeAreaLayoutGuide;
    [NSLayoutConstraint activateConstraints:@[[root.leadingAnchor constraintEqualToAnchor:safe.leadingAnchor constant:12],
      [root.trailingAnchor constraintEqualToAnchor:safe.trailingAnchor constant:-12],
      [root.topAnchor constraintEqualToAnchor:safe.topAnchor constant:6],
      [root.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor constant:-6],
      [_screen.heightAnchor constraintGreaterThanOrEqualToConstant:96],
      [_screen.widthAnchor constraintGreaterThanOrEqualToConstant:64]]];
    [_title setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisVertical];
    [_warning setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisVertical];
    UIDevice.currentDevice.batteryMonitoringEnabled=YES;
    NSNotificationCenter *n=NSNotificationCenter.defaultCenter;
    [n addObserver:self selector:@selector(background:) name:UIApplicationWillResignActiveNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:AVAudioSessionInterruptionNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:AVAudioSessionRouteChangeNotification object:nil];
    for(NSString *name in @[GCControllerDidConnectNotification,GCControllerDidDisconnectNotification,GCKeyboardDidConnectNotification,GCKeyboardDidDisconnectNotification])
        [n addObserver:self selector:@selector(inputDevicesChanged:) name:name object:nil];
    [self inputDevicesChanged:nil];
    _statusTimer=[NSTimer scheduledTimerWithTimeInterval:1 repeats:YES block:^(NSTimer *timer){[weakSelf sample];}];
    [self prepareLibrary];
}
- (void)prepareLibrary {
    NSURL *base=[NSFileManager.defaultManager URLsForDirectory:NSApplicationSupportDirectory inDomains:NSUserDomainMask].firstObject;
    NSURL *folder=[base URLByAppendingPathComponent:@"ReaderEmulator" isDirectory:YES];
    dispatch_async(_storage,^{@autoreleasepool{
        try {
            self->_library=std::make_unique<reader::Library>(folder.fileSystemRepresentation);
            NSData *b7=nil,*b9=nil,*fw=nil;
            auto data=[](const reader::Bytes& b)->NSData *{return b.empty()?nil:[NSData dataWithBytes:b.data() length:b.size()];};
            b7=data(self->_library->system("bios7"));b9=data(self->_library->system("bios9"));fw=data(self->_library->system("firmware"));
            dispatch_async(dispatch_get_main_queue(),^{self->_storageReady=YES;self->_bios7=b7;self->_bios9=b9;self->_firmware=fw;
                self->_status.text=@"Library ready. Import a ROM or choose a stored game.";});
        }catch(const std::exception& error){NSString *message=[NSString stringWithUTF8String:error.what()];dispatch_async(dispatch_get_main_queue(),^{[self error:message];});}
    }});
}
- (void)more {
    if(_loading)return;[self pauseEmulation];
    UIAlertController *menu=[UIAlertController alertControllerWithTitle:@"More" message:nil preferredStyle:UIAlertControllerStyleAlert];
    [menu addAction:[UIAlertAction actionWithTitle:@"DS system files" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a){[self systemFiles];}]];
    [menu addAction:[UIAlertAction actionWithTitle:@"Diagnostic" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a){[self diagnostic];}]];
    [menu addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:menu animated:YES completion:nil];
}
- (void)showLibrary {
    if(_loading)return;if(!_storageReady){[self error:@"Library storage is not ready."];return;}[self pauseEmulation];
    _loading=YES;self.view.userInteractionEnabled=NO;
    dispatch_async(_storage,^{@autoreleasepool{try {
        NSMutableArray *entries=[NSMutableArray new];
        for(const auto& e:self->_library->list()){
            NSString *display=[[NSString alloc] initWithBytes:e.name.data() length:e.name.size() encoding:NSUTF8StringEncoding]?:@"DS game";
            [entries addObject:@{@"id":@(e.id.c_str()),@"name":display,@"code":@(e.code.c_str())?:@"DS"}];
        }
        dispatch_async(dispatch_get_main_queue(),^{
            self->_loading=NO;self.view.userInteractionEnabled=YES;
            if(self.presentedViewController)return;
            GameLibraryController *list=[GameLibraryController new];list.entries=entries;
            __weak EmulatorController *weakSelf=self;list.openGame=^(NSString *identity){[weakSelf openEntry:identity];};
            [self presentViewController:[[UINavigationController alloc] initWithRootViewController:list] animated:YES completion:nil];
        });
    }catch(const std::exception& error){NSString *message=@(error.what());dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self.view.userInteractionEnabled=YES;[self error:message];});}}});
}
- (void)withSavedSession:(void (^)(void))next {
    if(_loading)return;[self pauseEmulation];
    _loading=YES;self.view.userInteractionEnabled=NO;
    [self flushSave:^(BOOL ok){self->_loading=NO;self.view.userInteractionEnabled=YES;
        if(ok)next();else [self error:@"The current cartridge save could not be stored. Free storage or finish saving in-game, then retry. Export save is also available; this session remains open."];}];
}
- (void)openEntry:(NSString *)identity {
    [self withSavedSession:^{
        self->_loading=YES;self.view.userInteractionEnabled=NO;
        dispatch_async(self->_storage,^{@autoreleasepool{try {
            std::string id=identity.UTF8String;auto rom=self->_library->rom(id);reader::SavedGame saved;NSString *saveError=nil,*name=@"DS game";
            try{saved=self->_library->save(id);}catch(const std::exception& error){saveError=@(error.what());}
            for(const auto& entry:self->_library->list())if(entry.id==id){name=[[NSString alloc] initWithBytes:entry.name.data() length:entry.name.size() encoding:NSUTF8StringEncoding]?:@"DS game";break;}
            NSData *romData=[NSData dataWithBytes:rom.data() length:rom.size()],*saveData=[NSData dataWithBytes:saved.bytes.data() length:saved.bytes.size()];
            BOOL recovered=saved.recovered;
            dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self.view.userInteractionEnabled=YES;
                if(saveError){
                    UIAlertController *alert=[UIAlertController alertControllerWithTitle:@"Stored saves need recovery" message:[saveError stringByAppendingString:@" You can open the ROM without saved progress, then use Game save to import a backup. Stored files remain until replacement or a new in-game save."] preferredStyle:UIAlertControllerStyleAlert];
                    [alert addAction:[UIAlertAction actionWithTitle:@"Open ROM to import backup" style:UIAlertActionStyleDestructive handler:^(UIAlertAction *a){[self launchROM:romData name:name save:nil identity:identity replacing:NO recovered:NO];}]];
                    [alert addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:alert animated:YES completion:nil];return;
                }
                [self launchROM:romData name:name save:saveData identity:identity replacing:NO recovered:recovered];});
        }catch(const std::exception& error){NSString *message=@(error.what());dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self.view.userInteractionEnabled=YES;[self error:message];});}}});
    }];
}
// Called only on the emulation queue. Snapshot first, then serialize file work
// on the storage queue; no filesystem calls run in the audio callback or frame.
- (void)captureSave:(void (^)(BOOL))completion {
    if(!_core||_emulatedID.empty()||_core->saveRevision==_storedRevision){
        if(completion)dispatch_async(dispatch_get_main_queue(),^{completion(YES);});return;
    }
    auto save=std::make_shared<reader::Bytes>(_core->copySave());
    auto id=_emulatedID,code=_core->gameCode;uint64_t revision=_core->saveRevision,generation=_generation;
    _savePending=true;_lastAttempt=CACurrentMediaTime();
    dispatch_async(_storage,^{@autoreleasepool{
        BOOL ok=YES,incomplete=NO;NSString *message=nil;
        try {
            std::string reason;
            if((code=="IPGE"||code=="CPUE")&&!reader::validImport(*save,code,reason)){ok=NO;incomplete=YES;}
            else self->_library->writeSave(id,*save);
        }catch(const std::exception& error){ok=NO;message=@(error.what());}
        dispatch_async(self->_emulation,^{
            if(generation==self->_generation){self->_savePending=false;if(ok)self->_storedRevision=std::max(self->_storedRevision,revision);}
            dispatch_async(dispatch_get_main_queue(),^{
                if(ok){self->_status.text=@"Cartridge save stored. Export a backup whenever needed.";self->_saveFailure=NO;}
                else if(!incomplete){BOOL firstFailure=!self->_saveFailure;self->_saveFailure=YES;
                    if(firstFailure){[self pauseEmulation];[self error:[@"Save could not be stored. Previous copy preserved. " stringByAppendingString:message?:@""]];}}
                if(completion)completion(ok);
            });
        });
    }});
}
- (void)flushSave:(void (^)(BOOL))completion {
    if(!_emulation){if(completion)completion(YES);return;}
    dispatch_async(_emulation,^{[self captureSave:completion];});
}
- (void)autosaveIfNeeded {
    if(_emulatedID.empty()||!_core)return;
    double now=CACurrentMediaTime();uint64_t revision=_core->saveRevision;
    if(revision!=_observedRevision){if(_observedRevision==_storedRevision)_dirtySince=now;_lastChange=now;_observedRevision=revision;}
    if(revision!=_storedRevision&&!_savePending&&now-_lastAttempt>=2 && (now-_lastChange>=0.25||now-_dirtySince>=2))
        [self captureSave:nil];
}
- (void)inputDevicesChanged:(NSNotification *)note {
    if(!NSThread.isMainThread){dispatch_async(dispatch_get_main_queue(),^{[self inputDevicesChanged:note];});return;}
    [self releaseInput];__weak EmulatorController *weakSelf=self;
    for(GCController *controller in GCController.controllers){controller.handlerQueue=dispatch_get_main_queue();
        controller.extendedGamepad.valueChangedHandler=^(GCExtendedGamepad *pad,GCControllerElement *element){[weakSelf updateControllerKeys];};}
    GCKeyboard.coalescedKeyboard.keyboardInput.keyChangedHandler=^(GCKeyboardInput *keyboard,GCControllerButtonInput *key,GCKeyCode code,BOOL pressed){
        EmulatorController *s=weakSelf;if(!s||!s->_playing.load())return;int bit=-1;
        const std::pair<GCKeyCode,int> bindings[]={
          {GCKeyCodeKeyZ,0},{GCKeyCodeKeyX,1},{GCKeyCodeRightShift,2},{GCKeyCodeReturnOrEnter,3},
          {GCKeyCodeRightArrow,4},{GCKeyCodeLeftArrow,5},{GCKeyCodeUpArrow,6},{GCKeyCodeDownArrow,7},
          {GCKeyCodeKeyW,8},{GCKeyCodeKeyQ,9},{GCKeyCodeKeyS,10},{GCKeyCodeKeyA,11}};
        for(auto binding:bindings)if(code==binding.first){bit=binding.second;break;}
        if(bit>=0){if(pressed)s->_input.keyboardKeys.fetch_or(uint16_t(1u<<bit));else s->_input.keyboardKeys.fetch_and(uint16_t(~(1u<<bit)));}
    };
}
- (void)updateControllerKeys {
    uint16_t keys=0;
    if(_playing.load())for(GCController *controller in GCController.controllers){GCExtendedGamepad *p=controller.extendedGamepad;if(!p)continue;
        // Physical bottom/right buttons map to DS B/A, top/left to X/Y.
        if(p.buttonB.pressed)keys|=1<<0;if(p.buttonA.pressed)keys|=1<<1;
        if(p.buttonOptions.pressed)keys|=1<<2;if(p.buttonMenu.pressed)keys|=1<<3;
        if(p.dpad.right.pressed||p.leftThumbstick.xAxis.value>0.5)keys|=1<<4;
        if(p.dpad.left.pressed||p.leftThumbstick.xAxis.value< -0.5)keys|=1<<5;
        if(p.dpad.up.pressed||p.leftThumbstick.yAxis.value>0.5)keys|=1<<6;
        if(p.dpad.down.pressed||p.leftThumbstick.yAxis.value< -0.5)keys|=1<<7;
        if(p.rightShoulder.pressed)keys|=1<<8;if(p.leftShoulder.pressed)keys|=1<<9;
        if(p.buttonY.pressed)keys|=1<<10;if(p.buttonX.pressed)keys|=1<<11;
    }_input.controllerKeys=keys;
}
- (UIButton *)action:(NSString *)title selector:(SEL)selector {
    UIButton *b=[UIButton buttonWithType:UIButtonTypeSystem];[b setTitle:title forState:UIControlStateNormal];
    b.titleLabel.font=[UIFont systemFontOfSize:12 weight:UIFontWeightSemibold];
    [b addTarget:self action:selector forControlEvents:UIControlEventTouchUpInside];return b;
}
- (UIStackView *)row:(NSArray<UIView *> *)views {
    UIStackView *s=[[UIStackView alloc] initWithArrangedSubviews:views];s.distribution=UIStackViewDistributionFillEqually;s.spacing=6;return s;
}
- (UIButton *)key:(NSString *)title bit:(NSInteger)bit {
    UIButton *b=[UIButton buttonWithType:UIButtonTypeSystem];b.tag=bit;b.exclusiveTouch=NO;
    [b setTitle:title forState:UIControlStateNormal];b.accessibilityLabel=title;
    b.titleLabel.font=[UIFont systemFontOfSize:17 weight:UIFontWeightSemibold];
    b.backgroundColor=UIColor.secondarySystemBackgroundColor;b.layer.cornerRadius=10;
    [b addTarget:self action:@selector(keyDown:) forControlEvents:UIControlEventTouchDown|UIControlEventTouchDragEnter];
    [b addTarget:self action:@selector(keyUp:) forControlEvents:UIControlEventTouchUpInside|UIControlEventTouchUpOutside|UIControlEventTouchCancel|UIControlEventTouchDragExit];
    return b;
}
- (UIStackView *)buildControls {
    UIStackView *s=[[UIStackView alloc] initWithArrangedSubviews:@[
      [self row:@[[self key:@"L" bit:9],[self key:@"↑" bit:6],[self key:@"R" bit:8],[self key:@"X" bit:10]]],
      [self row:@[[self key:@"←" bit:5],[self key:@"↓" bit:7],[self key:@"→" bit:4],[self key:@"Y" bit:11]]],
      [self row:@[[self key:@"Select" bit:2],[self key:@"Start" bit:3],[self key:@"B" bit:1],[self key:@"A" bit:0]]]]];
    s.axis=UILayoutConstraintAxisVertical;s.spacing=5;s.distribution=UIStackViewDistributionFillEqually;return s;
}
- (void)keyDown:(UIButton *)b { if(_playing.load())_input.touchKeys.fetch_or(uint16_t(1u<<b.tag)); }
- (void)keyUp:(UIButton *)b { _input.touchKeys.fetch_and(uint16_t(~(1u<<b.tag))); }
- (void)releaseInput { _input.clear();[_screen releaseTouch]; }
- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];BOOL wide=self.view.bounds.size.width>self.view.bounds.size.height;
    if(_controlWidth.active==wide && _controlHeight.active==!wide)return;
    [self releaseInput];_title.hidden=wide;_warning.hidden=wide;_metrics.numberOfLines=wide?1:2;
    _controlHeight.active=NO;_controlWidth.active=NO;
    _playArea.axis=wide?UILayoutConstraintAxisHorizontal:UILayoutConstraintAxisVertical;
    if(wide)_controlWidth.active=YES;else _controlHeight.active=YES;
}
- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator {
    [self releaseInput];[super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
}
- (double)activeWall { return _activeBeforePause+(_playing.load()?CACurrentMediaTime()-_resumedAt:0); }
- (void)pauseEmulation {
    ++_timerEpoch;
    if(_playing.exchange(false)){
        _activeBeforePause+=CACurrentMediaTime()-_resumedAt;
        if(_recording){++_pauseCount;[_events addObject:@{@"event":@"pause",@"activeSeconds":@([self activeWall])}];}
    }
    if(_frameTimer){dispatch_source_cancel(_frameTimer);_frameTimer=nil;}
    if(_pipe){_pipe->playing=false;_pipe->primed=false;}
    [_audio stop];_screen.paused=YES;[self releaseInput];[_pause setTitle:@"Resume" forState:UIControlStateNormal];
    [AVAudioSession.sharedInstance setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:nil];
    UIApplication.sharedApplication.idleTimerDisabled=NO;
    [self flushSave:nil];
}
- (void)background:(NSNotification *)note {
    if(!NSThread.isMainThread){dispatch_async(dispatch_get_main_queue(),^{[self background:note];});return;}
    if([note.name isEqual:AVAudioSessionRouteChangeNotification]){
        auto reason=[note.userInfo[AVAudioSessionRouteChangeReasonKey] unsignedIntegerValue];
        if(reason!=AVAudioSessionRouteChangeReasonOldDeviceUnavailable && reason!=AVAudioSessionRouteChangeReasonNewDeviceAvailable)return;
    }
    if([note.name isEqual:AVAudioSessionInterruptionNotification] &&
       [note.userInfo[AVAudioSessionInterruptionTypeKey] unsignedIntegerValue]!=AVAudioSessionInterruptionTypeBegan)return;
    ++_lifecycleEpoch;
    __block UIBackgroundTaskIdentifier task=UIBackgroundTaskInvalid;
    task=[UIApplication.sharedApplication beginBackgroundTaskWithName:@"Finish cartridge save" expirationHandler:^{
        if(task!=UIBackgroundTaskInvalid){[UIApplication.sharedApplication endBackgroundTask:task];task=UIBackgroundTaskInvalid;}
    }];
    [self pauseEmulation];
    [self flushSave:^(BOOL ok){if(task!=UIBackgroundTaskInvalid){[UIApplication.sharedApplication endBackgroundTask:task];task=UIBackgroundTaskInvalid;}}];
}
- (void)togglePause { if(_playing.load())[self pauseEmulation];else [self resumeEmulation]; }
- (void)resumeEmulation {
    if(!_loaded||_loading||_playing.load()||UIApplication.sharedApplication.applicationState!=UIApplicationStateActive)return;
    NSError *error=nil;
    AVAudioSession *session=AVAudioSession.sharedInstance;
    if(![session setCategory:AVAudioSessionCategoryPlayback mode:AVAudioSessionModeDefault options:0 error:&error] ||
       ![session setPreferredSampleRate:reader::SampleRate error:&error] ||
       ![session setPreferredIOBufferDuration:0.01 error:&error] || ![session setActive:YES error:&error]){
        [self error:[@"Audio setup failed: " stringByAppendingString:error.localizedDescription]];return;
    }
    if(!_audio){
        _audio=[AVAudioEngine new];auto pipe=_pipe;
        AVAudioFormat *format=[[AVAudioFormat alloc] initStandardFormatWithSampleRate:reader::SampleRate channels:2];
        AVAudioSourceNode *source=[[AVAudioSourceNode alloc] initWithFormat:format renderBlock:^OSStatus(BOOL *silence,const AudioTimeStamp *stamp,AVAudioFrameCount count,AudioBufferList *list){
            int16_t scratch[2048*2];BOOL any=NO;
            for(unsigned at=0;at<count;){unsigned n=std::min(unsigned(count-at),2048u);
                size_t got=pipe->ring.read(scratch,n);bool play=pipe->playing.load();
                if(play && pipe->primed.load() && got<n)pipe->missingFrames.fetch_add(n-got);
                for(unsigned ch=0;ch<list->mNumberBuffers;++ch){
                    float *out=static_cast<float*>(list->mBuffers[ch].mData);
                    for(unsigned i=0;i<n;++i){float value=play?scratch[i*2+std::min(ch,1u)]/32768.0f:0;out[at+i]=value;if(value!=0)any=YES;}
                }
                at+=n;
            }
            *silence=!any;return noErr;
        }];
        [_audio attachNode:source];[_audio connect:source to:_audio.mainMixerNode format:format];
    }
    if(![_audio startAndReturnError:&error]){[self error:[@"Audio start failed: " stringByAppendingString:error.localizedDescription]];return;}
    _resumedAt=CACurrentMediaTime();_playing=true;_pipe->playing=true;_screen.paused=NO;
    UIApplication.sharedApplication.idleTimerDisabled=YES;[_pause setTitle:@"Pause" forState:UIControlStateNormal];
    _frameTimer=dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER,0,0,_emulation);auto pipe=_pipe;
    uint64_t timerEpoch=++_timerEpoch;
    const uint64_t period=uint64_t(reader::FrameSeconds*NSEC_PER_SEC);
    dispatch_source_set_timer(_frameTimer,dispatch_time(DISPATCH_TIME_NOW,0),period,100000);
    dispatch_source_set_event_handler(_frameTimer,^{@autoreleasepool{
        if(!self->_playing.load()||!self->_core||timerEpoch!=self->_timerEpoch.load())return;
        auto before=std::chrono::steady_clock::now();
        uint32_t touch=self->_input.touch.load();
        double seconds=self->_core->step(self->_input.keys(),touch==0xFFFFFFFF?-1:int(touch&255),touch==0xFFFFFFFF?-1:int((touch>>8)&255));
        [self autosaveIfNeeded];
        if(!self->_core->running()){
            dispatch_async(dispatch_get_main_queue(),^{[self pauseEmulation];[self error:@"The emulated console stopped. Export any available game save before replacing this session."];});return;
        }
        self->_core->copyVideo(self->_video.data());[self->_screen publishPixels:self->_video.data()];
        int16_t audio[4096*2];size_t n=self->_core->readAudio(audio,4096);
        size_t written=pipe->ring.write(audio,n);if(n)pipe->primed=true;
        if(written<n)pipe->overflowFrames.fetch_add(n-written);
        double cost=std::chrono::duration<double>(std::chrono::steady_clock::now()-before).count();
        auto &s=self->_stats;++s.frames;s.emulated+=seconds;s.coreWall+=cost;s.maxFrame=std::max(s.maxFrame,cost);
        if(cost>reader::FrameSeconds)++s.slowFrames;
        ++s.histogram[std::min(size_t(cost*10000),size_t(1000))];
    }});
    dispatch_resume(_frameTimer);
}
- (void)error:(NSString *)message {
    _status.text=message;UIAlertController *a=[UIAlertController alertControllerWithTitle:@"Reader Emulator" message:message preferredStyle:UIAlertControllerStyleAlert];
    [a addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
    if(UIApplication.sharedApplication.applicationState==UIApplicationStateActive&&!self.presentedViewController)[self presentViewController:a animated:YES completion:nil];
}
- (void)pick:(NSString *)purpose {
    if(_loading)return;if(!_storageReady){[self error:@"Library storage is not ready."];return;}[self pauseEmulation];_purpose=purpose;
    UIDocumentPickerViewController *picker=[[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[UTTypeData] asCopy:YES];
    picker.delegate=self;picker.allowsMultipleSelection=NO;[self presentViewController:picker animated:YES completion:nil];
}
- (void)openROM { [self pick:@"rom"]; }
- (void)openSave { if(!_gameID.length){[self error:@"Choose a library game first, then import its raw 512 KB in-game save."];return;}[self pick:@"save"]; }
- (void)systemFiles {
    if(!_storageReady){[self error:@"Library storage is not ready."];return;}
    [self pauseEmulation];UIAlertController *a=[UIAlertController alertControllerWithTitle:@"Optional DS system files" message:@"The prototype defaults to melonDS FreeBIOS and generated firmware. Import your DS dumps to compare compatibility. Files take effect on the next ROM launch." preferredStyle:UIAlertControllerStyleAlert];
    for(NSString *kind in @[@"bios7",@"bios9",@"firmware"])
      [a addAction:[UIAlertAction actionWithTitle:kind style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self pick:kind];}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Use built-in replacements" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self clearSystemFiles];}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:a animated:YES completion:nil];
}
- (void)clearSystemFiles {
    _loading=YES;
    dispatch_async(_storage,^{try{self->_library->clearSystem();dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self->_bios7=nil;self->_bios9=nil;self->_firmware=nil;self->_status.text=@"Built-in system replacements selected for the next launch.";});}
        catch(const std::exception& error){NSString *message=@(error.what());dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;[self error:message];});}});
}
- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller { _purpose=nil; }
- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls {
    NSURL *url=urls.firstObject;if(!url)return;NSString *purpose=_purpose;_loading=YES;
    BOOL access=[url startAccessingSecurityScopedResource];
    dispatch_async(_storage,^{@autoreleasepool{
        NSError *error=nil;NSNumber *size=nil;[url getResourceValue:&size forKey:NSURLFileSizeKey error:&error];
        uint64_t limit=[purpose isEqual:@"rom"]?512ull*1024*1024:0x80000;
        NSData *data=nil;
        if(!error&&size&&size.unsignedLongLongValue<=limit)data=[NSData dataWithContentsOfURL:url options:0 error:&error];
        NSString *message=error.localizedDescription?:@"This file could not be read or exceeds the supported size.";
        if(access)[url stopAccessingSecurityScopedResource];
        dispatch_async(dispatch_get_main_queue(),^{
            [controller dismissViewControllerAnimated:YES completion:^{
                self->_loading=NO;if(!data){[self error:message];return;}
                [self acceptDocument:data name:url.lastPathComponent purpose:purpose];
            }];
        });
    }});
}
- (void)acceptDocument:(NSData *)data name:(NSString *)name purpose:(NSString *)purpose {
    if([purpose isEqual:@"rom"]){
        [self withSavedSession:^{self->_loading=YES;self.view.userInteractionEnabled=NO;
            dispatch_async(self->_storage,^{@autoreleasepool{try {
                auto entry=self->_library->importROM(bytes(data),name.UTF8String);NSString *identity=@(entry.id.c_str());
                dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self.view.userInteractionEnabled=YES;[self openEntry:identity];});
            }catch(const std::exception& error){NSString *message=@(error.what());dispatch_async(dispatch_get_main_queue(),^{self->_loading=NO;self.view.userInteractionEnabled=YES;[self error:message];});}}});
        }];
    }else if([purpose isEqual:@"save"]){
        if(!_gameID.length){[self error:@"Choose a game from the library first. Diagnostic sessions do not accept personal saves."];return;}
        std::string code(reinterpret_cast<const char*>(static_cast<const uint8_t*>(_rom.bytes)+12),4),error;
        if(!reader::validImport(bytes(data),code,error)){[self error:@(error.c_str())];return;}
        NSString *message=[NSString stringWithFormat:@"Associate %@ with %@ (ROM %@)? A save cannot identify a patched ROM uniquely. This replaces the cartridge save for this library entry and restarts the game. The previous copy is retained. Imported files are unchanged.",name,_romName,[_gameID substringToIndex:12]];
        UIAlertController *confirm=[UIAlertController alertControllerWithTitle:@"Replace this game's save?" message:message preferredStyle:UIAlertControllerStyleAlert];
        [confirm addAction:[UIAlertAction actionWithTitle:@"Replace and restart" style:UIAlertActionStyleDestructive handler:^(UIAlertAction *action){
            [self withSavedSession:^{[self launchROM:self->_rom name:self->_romName save:data identity:self->_gameID replacing:YES recovered:NO];}];
        }]];
        [confirm addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:confirm animated:YES completion:nil];
    }else{
        BOOL valid=[purpose isEqual:@"bios7"]?data.length==0x4000:[purpose isEqual:@"bios9"]?data.length==0x1000:
          data.length==0x20000||data.length==0x40000||data.length==0x80000;
        if(!valid){[self error:@"Incorrect DS system-file size (ARM7 16 KB, ARM9 4 KB, firmware 128/256/512 KB)."];return;}
        dispatch_async(_storage,^{@autoreleasepool{try {
            self->_library->writeSystem(purpose.UTF8String,bytes(data));
            dispatch_async(dispatch_get_main_queue(),^{if([purpose isEqual:@"bios7"])self->_bios7=data;else if([purpose isEqual:@"bios9"])self->_bios9=data;else self->_firmware=data;
                self->_status.text=[purpose stringByAppendingString:@" stored for the next game launch."];});
        }catch(const std::exception& error){NSString *message=@(error.what());dispatch_async(dispatch_get_main_queue(),^{[self error:message];});}}});
    }
}
- (void)diagnostic {
    [self withSavedSession:^{auto rom=reader::test::rom();[self launchROM:[NSData dataWithBytes:rom.data() length:rom.size()] name:@"Original diagnostic ROM" save:nil identity:nil replacing:NO recovered:NO];}];
}
- (void)launchROM:(NSData *)rom name:(NSString *)name save:(NSData *)save identity:(NSString *)identity replacing:(BOOL)replacing recovered:(BOOL)recovered {
    [self pauseEmulation];_loading=YES;self.view.userInteractionEnabled=NO;_status.text=@"Loading native melonDS…";
    NSUInteger lifecycleEpoch=_lifecycleEpoch;BOOL foregroundLaunch=UIApplication.sharedApplication.applicationState==UIApplicationStateActive;
    NSData *b7=_bios7,*b9=_bios9,*fw=_firmware;_audio=nil;
    dispatch_async(_emulation,^{@autoreleasepool{
        auto next=std::make_shared<reader::Core>();std::string reason;
        bool loaded=next->load(static_cast<const uint8_t*>(rom.bytes),rom.length,static_cast<const uint8_t*>(save.bytes),save.length,reason,bytes(b7),bytes(b9),bytes(fw));
        NSString *loadError=loaded?nil:@(reason.c_str());
        dispatch_async(self->_storage,^{@autoreleasepool{
            BOOL ok=loaded;NSString *message=loadError;
            if(ok&&replacing)try{self->_library->writeSave(identity.UTF8String,bytes(save));}catch(const std::exception& error){ok=NO;message=@(error.what());}
            dispatch_async(self->_emulation,^{
                if(ok){self->_core=next;self->_stats={};self->_emulatedID=identity.length?identity.UTF8String:"";
                    ++self->_generation;self->_storedRevision=0;self->_observedRevision=0;self->_savePending=false;self->_lastAttempt=0;}
                dispatch_async(dispatch_get_main_queue(),^{
                    self->_loading=NO;self.view.userInteractionEnabled=YES;
                    if(!ok){[self error:message];return;}
                    self->_loaded=YES;self->_rom=rom;self->_romName=name;self->_save=save;self->_romHash=identity?:digest(rom);self->_gameID=identity;
                    self->_activeSystemFiles=@{@"bios7":b7.length?digest(b7):@"FreeBIOS",@"bios9":b9.length?digest(b9):@"FreeBIOS",@"firmware":fw.length?digest(fw):@"generated"};
                    self->_pipe=std::make_shared<AudioPipe>();self->_activeBeforePause=0;self->_lastStats=nil;self->_saveFailure=NO;
                    self->_recording=NO;[self->_samples removeAllObjects];[self->_events removeAllObjects];self->_pause.enabled=YES;
                    [self->_record setTitle:@"Record test" forState:UIControlStateNormal];
                    self->_status.text=[name stringByAppendingString:recovered?@" · Recovered previous cartridge save":@" · Save normally in-game to keep progress"];
                    if(recovered)[self error:@"The newest cartridge save failed its integrity check. The previous valid copy was loaded. Corrupt files are preserved until a new in-game save is stored."];
                    else if(foregroundLaunch&&lifecycleEpoch==self->_lifecycleEpoch)[self resumeEmulation];
                });
            });
        }});
    }});
}
- (NSDictionary *)deviceSample {
    return @{@"timestamp":[[NSISO8601DateFormatter new] stringFromDate:NSDate.date],
      @"batteryFraction":@(UIDevice.currentDevice.batteryLevel),
      @"batteryState":@(UIDevice.currentDevice.batteryState),
      @"thermalState":@(NSProcessInfo.processInfo.thermalState),
      @"lowPowerMode":@(NSProcessInfo.processInfo.lowPowerModeEnabled),
      @"brightness":@(UIScreen.mainScreen.brightness)};
}
- (void)sample {
    if(!_loaded||_loading)return;double wall=[self activeWall];auto pipe=_pipe;
    dispatch_async(_emulation,^{
        FrameStats s=self->_stats;uint64_t sum=0;size_t bin=0;
        for(;bin<s.histogram.size();++bin){sum+=s.histogram[bin];if(sum>=std::ceil(s.frames*0.95))break;}
        NSDictionary *stats=@{@"frames":@(s.frames),@"activeSeconds":@(wall),@"emulatedSeconds":@(s.emulated),
          @"speedRatio":@(wall>0?s.emulated/wall:0),@"meanFrameMs":@(s.frames?s.coreWall*1000/s.frames:0),
          @"p95FrameMsUpperBound":bin<1000?@((bin+1)*0.1):NSNull.null,@"maxFrameMs":@(s.maxFrame*1000),@"slowCoreFrames":@(s.slowFrames),
          @"audioMissingFrames":@(pipe->missingFrames.load()),@"audioOverflowFrames":@(pipe->overflowFrames.load())};
        dispatch_async(dispatch_get_main_queue(),^{
            self->_lastStats=stats;
            self->_metrics.text=[NSString stringWithFormat:@"%.1f%% game speed · %.2f ms mean frame · %llu slow frames\nAudio missing: %llu samples · Thermal: %ld%@",[stats[@"speedRatio"] doubleValue]*100,
              [stats[@"meanFrameMs"] doubleValue],[stats[@"slowCoreFrames"] unsignedLongLongValue],
              [stats[@"audioMissingFrames"] unsignedLongLongValue],(long)NSProcessInfo.processInfo.thermalState,self->_playing.load()?@"":@" · Paused"];
            if(self->_recording&&self->_playing.load()){
                NSMutableDictionary *row=[[self deviceSample] mutableCopy];row[@"stats"]=stats;row[@"scene"]=self->_scene;
                [self->_samples addObject:row];
                if(wall-self->_benchmarkStart>=1800){self->_recording=NO;[self->_record setTitle:@"Record test" forState:UIControlStateNormal];self->_status.text=@"30 active minutes recorded. Pause and export the report.";}
            }
        });
    });
}
- (void)recordTest {
    if(!_loaded){[self error:@"Launch a game before recording its performance."];return;}
    UIAlertController *a=[UIAlertController alertControllerWithTitle:_recording?@"Mark a scene":@"Start a 30-minute test" message:@"Use the same starting save and settings for a matched Delta run. Reports contain battery levels, not measured energy consumption." preferredStyle:UIAlertControllerStyleAlert];
    for(NSString *scene in @[@"Overworld",@"Battle entry",@"Battle",@"Menus"])
      [a addAction:[UIAlertAction actionWithTitle:scene style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){
        self->_scene=scene;
        if(!self->_recording){[self->_samples removeAllObjects];[self->_events removeAllObjects];self->_pauseCount=0;self->_benchmarkStart=[self activeWall];self->_recording=YES;
            NSMutableDictionary *first=[[self deviceSample] mutableCopy];first[@"scene"]=scene;first[@"event"]=@"start";[self->_samples addObject:first];}
        [self->_events addObject:@{@"event":@"scene",@"scene":scene,@"activeSeconds":@([self activeWall])}];
        [self->_record setTitle:@"Mark scene" forState:UIControlStateNormal];
      }]];
    if(_recording)[a addAction:[UIAlertAction actionWithTitle:@"Finish recording" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){self->_recording=NO;[self->_record setTitle:@"Record test" forState:UIControlStateNormal];}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:a animated:YES completion:nil];
}
- (void)exportSave {
    if(!_loaded)return;[self pauseEmulation];
    dispatch_async(_emulation,^{auto save=self->_core->copySave();NSData *data=[NSData dataWithBytes:save.data() length:save.size()];
      dispatch_async(dispatch_get_main_queue(),^{if(!data.length){[self error:@"No cartridge game-save memory is available. The diagnostic ROM has no game save."];return;}[self share:data extension:@"sav"];});});
}
- (void)exportReport {
    if(!_loaded)return;[self pauseEmulation];[self sample];
    // A queue barrier follows pending frame/stat work; UIKit/report data stay on main.
    dispatch_async(_emulation,^{dispatch_async(dispatch_get_main_queue(),^{
        struct utsname device{};uname(&device);
        NSData *buildData=[NSData dataWithContentsOfURL:[NSBundle.mainBundle URLForResource:@"BuildInfo" withExtension:@"json"]];
        NSDictionary *build=buildData?[NSJSONSerialization JSONObjectWithData:buildData options:0 error:nil]:@{};
        NSDictionary *report=@{@"schema":@1,@"appVersion":@READER_BUILD_VERSION,@"core":@"melonDS 1.1",
          @"build":build?:@{},
          @"coreRevision":@READER_CORE_REVISION,@"candidateAccepted":@NO,@"romSHA256":self->_romHash?:@"",
          @"gameSaveSHA256":self->_save?digest(self->_save):@"none imported",
          @"device":@(device.machine),@"iOS":UIDevice.currentDevice.systemVersion,
          @"renderer":@"threaded software, native-resolution Metal presentation",@"jit":@NO,
          @"audioSourceRate":@(reader::SampleRate),@"hardwareAudioRate":@(AVAudioSession.sharedInstance.sampleRate),
          @"systemFiles":self->_activeSystemFiles?:@{},
          @"summary":self->_lastStats?:@{},@"recordedSamples":self->_samples,@"events":self->_events,
          @"recordedActiveSeconds":@(self->_samples.count?[self activeWall]-self->_benchmarkStart:0),@"recordingPauses":@(self->_pauseCount),
          @"finalDeviceSample":[self deviceSample],
          @"limits":@[@"Battery fraction is coarse; it is not a power/energy measurement.",@"Elapsed time excludes pauses; export pauses playback.",@"Slow frames measure core and buffer publication wall time, not total CPU/GPU energy.",@"A diagnostic ROM is not proof of commercial-game compatibility."]};
        NSError *error=nil;NSData *data=[NSJSONSerialization dataWithJSONObject:report options:NSJSONWritingPrettyPrinted|NSJSONWritingSortedKeys error:&error];
        if(!data){[self error:error.localizedDescription];return;}[self share:data extension:@"json"];
    });});
}
- (void)share:(NSData *)data extension:(NSString *)extension {
    NSError *error=nil;NSURL *folder=[NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask].firstObject;
    folder=[folder URLByAppendingPathComponent:@"Exports" isDirectory:YES];
    if(![NSFileManager.defaultManager createDirectoryAtURL:folder withIntermediateDirectories:YES attributes:nil error:&error]){[self error:error.localizedDescription];return;}
    NSURL *url=[folder URLByAppendingPathComponent:[NSString stringWithFormat:@"reader-%@.%@",NSUUID.UUID.UUIDString,extension]];
    if(![data writeToURL:url options:NSDataWritingAtomic error:&error]){[self error:error.localizedDescription];return;}
    UIActivityViewController *sheet=[[UIActivityViewController alloc] initWithActivityItems:@[url] applicationActivities:nil];
    sheet.popoverPresentationController.sourceView=self.view;sheet.popoverPresentationController.sourceRect=CGRectMake(self.view.bounds.size.width/2,self.view.bounds.size.height/2,1,1);
    [self presentViewController:sheet animated:YES completion:nil];
}
@end
