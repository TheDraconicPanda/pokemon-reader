// SPDX-License-Identifier: GPL-3.0-or-later
#import "EmulatorController.h"
#import "ScreenView.h"
#import <AVFoundation/AVFoundation.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <CommonCrypto/CommonDigest.h>
#include "Core.h"
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

@interface EmulatorController () <UIDocumentPickerDelegate>
@end
@implementation EmulatorController {
    dispatch_queue_t _emulation;
    dispatch_source_t _frameTimer;
    std::unique_ptr<reader::Core> _core;
    std::shared_ptr<AudioPipe> _pipe;
    std::atomic<bool> _playing;
    std::atomic<uint16_t> _keys;
    std::atomic<int> _touchX,_touchY;
    FrameStats _stats; // confined to _emulation
    std::array<uint32_t,reader::Pixels*2> _video;
    ScreenView *_screen;
    UIStackView *_playArea,*_controls;
    NSLayoutConstraint *_controlWidth,*_controlHeight;
    UILabel *_status,*_metrics;
    UIButton *_pause,*_record;
    AVAudioEngine *_audio;
    NSTimer *_statusTimer;
    NSData *_rom,*_save,*_bios7,*_bios9,*_firmware;
    NSString *_romName,*_romHash,*_purpose,*_scene;
    NSDictionary *_lastStats;
    NSMutableArray *_samples,*_events;
    BOOL _loaded,_loading,_recording;
    double _activeBeforePause,_resumedAt,_benchmarkStart;
    NSInteger _pauseCount;
}
- (void)viewDidLoad {
    [super viewDidLoad];
    _playing=false;_keys=0;_touchX=-1;_touchY=-1;
    _emulation=dispatch_queue_create("dev.thedraconicpanda.emulation",DISPATCH_QUEUE_SERIAL);
    dispatch_set_target_queue(_emulation,dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE,0));
    _samples=[NSMutableArray new];_events=[NSMutableArray new];_scene=@"unlabelled";
    self.view.backgroundColor=UIColor.systemBackgroundColor;
    UILabel *title=[UILabel new];title.text=@"Reader Emulator · E1 prototype";title.font=[UIFont boldSystemFontOfSize:19];
    _status=[UILabel new];_status.text=@"Open a SoulSilver/Platinum ROM, or run the built-in diagnostic.";
    _status.font=[UIFont systemFontOfSize:12];_status.numberOfLines=2;
    UIStackView *files=[self row:@[
      [self action:@"Open ROM" selector:@selector(openROM)],
      [self action:@"Game save" selector:@selector(openSave)],
      [self action:@"System files" selector:@selector(systemFiles)],
      [self action:@"Diagnostic" selector:@selector(diagnostic)]]];
    _pause=[self action:@"Resume" selector:@selector(togglePause)];_pause.enabled=NO;
    _record=[self action:@"Record test" selector:@selector(recordTest)];
    UIStackView *actions=[self row:@[_pause,[self action:@"Export save" selector:@selector(exportSave)],_record,[self action:@"Report" selector:@selector(exportReport)]]];
    _metrics=[UILabel new];_metrics.text=@"Normal speed · melonDS 1.1 · no fast-forward";
    _metrics.font=[UIFont monospacedDigitSystemFontOfSize:11 weight:UIFontWeightRegular];_metrics.numberOfLines=2;
    id<MTLDevice> device=MTLCreateSystemDefaultDevice();
    if(!device){[self error:@"Metal is unavailable on this device."];return;}
    _screen=[[ScreenView alloc] initWithFrame:CGRectZero device:device];_screen.paused=YES;
    __weak EmulatorController *weakSelf=self;
    _screen.touchHandler=^(int x,int y){EmulatorController *s=weakSelf;if(s){s->_touchX=x;s->_touchY=y;}};
    _controls=[self buildControls];
    _playArea=[[UIStackView alloc] initWithArrangedSubviews:@[_screen,_controls]];_playArea.spacing=8;
    _controlWidth=[_controls.widthAnchor constraintEqualToConstant:260];
    _controlHeight=[_controls.heightAnchor constraintEqualToConstant:148];
    UILabel *warning=[UILabel new];warning.numberOfLines=2;warning.font=[UIFont systemFontOfSize:11];warning.textColor=UIColor.secondaryLabelColor;
    warning.text=@"Test build: save in-game, then Export save before ending a session. Automatic persistence and recovery come in E2/E3.";
    UIStackView *root=[[UIStackView alloc] initWithArrangedSubviews:@[title,_status,files,actions,_metrics,_playArea,warning]];
    root.axis=UILayoutConstraintAxisVertical;root.spacing=6;root.translatesAutoresizingMaskIntoConstraints=NO;[self.view addSubview:root];
    UILayoutGuide *safe=self.view.safeAreaLayoutGuide;
    [NSLayoutConstraint activateConstraints:@[[root.leadingAnchor constraintEqualToAnchor:safe.leadingAnchor constant:12],
      [root.trailingAnchor constraintEqualToAnchor:safe.trailingAnchor constant:-12],
      [root.topAnchor constraintEqualToAnchor:safe.topAnchor constant:6],
      [root.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor constant:-6],
      [_screen.heightAnchor constraintGreaterThanOrEqualToConstant:96],
      [_screen.widthAnchor constraintGreaterThanOrEqualToConstant:64]]];
    [title setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisVertical];
    [warning setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisVertical];
    UIDevice.currentDevice.batteryMonitoringEnabled=YES;
    NSNotificationCenter *n=NSNotificationCenter.defaultCenter;
    [n addObserver:self selector:@selector(background:) name:UIApplicationWillResignActiveNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:AVAudioSessionInterruptionNotification object:nil];
    [n addObserver:self selector:@selector(background:) name:AVAudioSessionRouteChangeNotification object:nil];
    _statusTimer=[NSTimer scheduledTimerWithTimeInterval:1 repeats:YES block:^(NSTimer *timer){[weakSelf sample];}];
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
- (void)keyDown:(UIButton *)b { if(_playing.load())_keys.fetch_or(uint16_t(1u<<b.tag)); }
- (void)keyUp:(UIButton *)b { _keys.fetch_and(uint16_t(~(1u<<b.tag))); }
- (void)releaseInput { _keys=0;[_screen releaseTouch]; }
- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];BOOL wide=self.view.bounds.size.width>self.view.bounds.size.height;
    if(_controlWidth.active==wide && _controlHeight.active==!wide)return;
    _controlHeight.active=NO;_controlWidth.active=NO;
    _playArea.axis=wide?UILayoutConstraintAxisHorizontal:UILayoutConstraintAxisVertical;
    if(wide)_controlWidth.active=YES;else _controlHeight.active=YES;
}
- (double)activeWall { return _activeBeforePause+(_playing.load()?CACurrentMediaTime()-_resumedAt:0); }
- (void)pauseEmulation {
    if(_playing.exchange(false)){
        _activeBeforePause+=CACurrentMediaTime()-_resumedAt;
        if(_recording){++_pauseCount;[_events addObject:@{@"event":@"pause",@"activeSeconds":@([self activeWall])}];}
    }
    if(_frameTimer){dispatch_source_cancel(_frameTimer);_frameTimer=nil;}
    if(_pipe){_pipe->playing=false;_pipe->primed=false;}
    [_audio stop];_screen.paused=YES;[self releaseInput];[_pause setTitle:@"Resume" forState:UIControlStateNormal];
    UIApplication.sharedApplication.idleTimerDisabled=NO;
}
- (void)background:(NSNotification *)note {
    if(!NSThread.isMainThread){dispatch_async(dispatch_get_main_queue(),^{[self background:note];});return;}
    if([note.name isEqual:AVAudioSessionRouteChangeNotification]){
        auto reason=[note.userInfo[AVAudioSessionRouteChangeReasonKey] unsignedIntegerValue];
        if(reason!=AVAudioSessionRouteChangeReasonOldDeviceUnavailable && reason!=AVAudioSessionRouteChangeReasonNewDeviceAvailable)return;
    }
    if([note.name isEqual:AVAudioSessionInterruptionNotification] &&
       [note.userInfo[AVAudioSessionInterruptionTypeKey] unsignedIntegerValue]!=AVAudioSessionInterruptionTypeBegan)return;
    [self pauseEmulation];
}
- (void)togglePause { if(_playing.load())[self pauseEmulation];else [self resumeEmulation]; }
- (void)resumeEmulation {
    if(!_loaded||_loading||_playing.load())return;
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
    const uint64_t period=uint64_t(reader::FrameSeconds*NSEC_PER_SEC);
    dispatch_source_set_timer(_frameTimer,dispatch_time(DISPATCH_TIME_NOW,0),period,100000);
    dispatch_source_set_event_handler(_frameTimer,^{@autoreleasepool{
        if(!self->_playing.load()||!self->_core)return;
        auto before=std::chrono::steady_clock::now();
        double seconds=self->_core->step(self->_keys.load(),self->_touchX.load(),self->_touchY.load());
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
    if(!self.presentedViewController)[self presentViewController:a animated:YES completion:nil];
}
- (void)pick:(NSString *)purpose {
    if(_loading)return;[self pauseEmulation];_purpose=purpose;
    UIDocumentPickerViewController *picker=[[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[UTTypeData] asCopy:YES];
    picker.delegate=self;picker.allowsMultipleSelection=NO;[self presentViewController:picker animated:YES completion:nil];
}
- (void)openROM { [self pick:@"rom"]; }
- (void)openSave { if(!_loaded){[self error:@"Open a ROM first, then import its raw 512 KB in-game save."];return;}[self pick:@"save"]; }
- (void)systemFiles {
    [self pauseEmulation];UIAlertController *a=[UIAlertController alertControllerWithTitle:@"Optional DS system files" message:@"The prototype defaults to melonDS FreeBIOS and generated firmware. Import your DS dumps to compare compatibility. Files take effect on the next ROM launch." preferredStyle:UIAlertControllerStyleAlert];
    for(NSString *kind in @[@"bios7",@"bios9",@"firmware"])
      [a addAction:[UIAlertAction actionWithTitle:kind style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self pick:kind];}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Use built-in replacements" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){self->_bios7=nil;self->_bios9=nil;self->_firmware=nil;}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:a animated:YES completion:nil];
}
- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls {
    NSURL *url=urls.firstObject;if(!url)return;NSString *purpose=_purpose;
    BOOL access=[url startAccessingSecurityScopedResource];NSError *error=nil;NSNumber *size=nil;
    [url getResourceValue:&size forKey:NSURLFileSizeKey error:&error];
    uint64_t limit=[purpose isEqual:@"rom"]?512ull*1024*1024:0x80000;
    if(error||!size||size.unsignedLongLongValue>limit){if(access)[url stopAccessingSecurityScopedResource];[self error:@"This file could not be read or exceeds the supported size."];return;}
    NSData *data=[NSData dataWithContentsOfURL:url options:0 error:&error];if(access)[url stopAccessingSecurityScopedResource];
    if(!data){[self error:error.localizedDescription];return;}
    if([purpose isEqual:@"rom"]){
        [self confirmReplacement:^{[self launchROM:data name:url.lastPathComponent save:nil];}];
    }else if([purpose isEqual:@"save"]){
        if(data.length!=0x80000){[self error:@"Choose a raw 512 KB in-game save. Save states and .dsv containers are not accepted by E1."];return;}
        [self confirmReplacement:^{[self launchROM:self->_rom name:self->_romName save:data];}];
    }else{
        BOOL valid=[purpose isEqual:@"bios7"]?data.length==0x4000:[purpose isEqual:@"bios9"]?data.length==0x1000:
           data.length==0x20000||data.length==0x40000||data.length==0x80000;
        if(!valid){[self error:@"Incorrect DS system-file size (ARM7 16 KB, ARM9 4 KB, firmware 128/256/512 KB)."];return;}
        if([purpose isEqual:@"bios7"])_bios7=data;else if([purpose isEqual:@"bios9"])_bios9=data;else _firmware=data;
        _status.text=[purpose stringByAppendingString:@" loaded for the next ROM launch."];
    }
}
- (void)confirmReplacement:(void (^)(void))replace {
    if(!_loaded){replace();return;}
    UIAlertController *a=[UIAlertController alertControllerWithTitle:@"Replace this test session?" message:@"Export its in-game save first if you want to keep progress. Automatic persistence is not implemented in this E1 prototype." preferredStyle:UIAlertControllerStyleAlert];
    [a addAction:[UIAlertAction actionWithTitle:@"Export current save" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action){[self exportSave];}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Replace session" style:UIAlertActionStyleDestructive handler:^(UIAlertAction *action){replace();}]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil]];[self presentViewController:a animated:YES completion:nil];
}
- (void)diagnostic {
    [self pauseEmulation];[self confirmReplacement:^{auto rom=reader::test::rom();[self launchROM:[NSData dataWithBytes:rom.data() length:rom.size()] name:@"Original diagnostic ROM" save:nil];}];
}
- (void)launchROM:(NSData *)rom name:(NSString *)name save:(NSData *)save {
    [self pauseEmulation];_loading=YES;self.view.userInteractionEnabled=NO;_status.text=@"Loading native melonDS…";
    NSData *b7=_bios7,*b9=_bios9,*fw=_firmware;_audio=nil;
    dispatch_async(_emulation,^{@autoreleasepool{
        std::string error;auto next=std::make_unique<reader::Core>();
        bool ok=next->load(static_cast<const uint8_t*>(rom.bytes),rom.length,static_cast<const uint8_t*>(save.bytes),save.length,error,bytes(b7),bytes(b9),bytes(fw));
        if(ok){self->_core=std::move(next);self->_stats={};}
        NSString *message=ok?@"Loaded":[NSString stringWithUTF8String:error.c_str()];
        NSString *hash=ok?digest(rom):nil;
        dispatch_async(dispatch_get_main_queue(),^{
            self->_loading=NO;self.view.userInteractionEnabled=YES;
            if(!ok){[self error:message];return;}
            self->_loaded=YES;self->_rom=rom;self->_romName=name;self->_save=save;self->_romHash=hash;
            self->_pipe=std::make_shared<AudioPipe>();self->_activeBeforePause=0;self->_lastStats=nil;
            self->_recording=NO;[self->_samples removeAllObjects];[self->_events removeAllObjects];self->_pause.enabled=YES;
            [self->_record setTitle:@"Record test" forState:UIControlStateNormal];
            self->_status.text=[name stringByAppendingString:@" · E1 test session"];
            [self resumeEmulation];
        });
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
          @"systemFiles":@{@"bios7":self->_bios7?digest(self->_bios7):@"FreeBIOS",@"bios9":self->_bios9?digest(self->_bios9):@"FreeBIOS",@"firmware":self->_firmware?digest(self->_firmware):@"generated"},
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
    folder=[folder URLByAppendingPathComponent:@"E1Exports" isDirectory:YES];
    if(![NSFileManager.defaultManager createDirectoryAtURL:folder withIntermediateDirectories:YES attributes:nil error:&error]){[self error:error.localizedDescription];return;}
    NSURL *url=[folder URLByAppendingPathComponent:[NSString stringWithFormat:@"reader-e1-%@.%@",NSUUID.UUID.UUIDString,extension]];
    if(![data writeToURL:url options:NSDataWritingAtomic error:&error]){[self error:error.localizedDescription];return;}
    UIActivityViewController *sheet=[[UIActivityViewController alloc] initWithActivityItems:@[url] applicationActivities:nil];
    sheet.popoverPresentationController.sourceView=self.view;sheet.popoverPresentationController.sourceRect=CGRectMake(self.view.bounds.size.width/2,self.view.bounds.size.height/2,1,1);
    [self presentViewController:sheet animated:YES completion:nil];
}
@end
