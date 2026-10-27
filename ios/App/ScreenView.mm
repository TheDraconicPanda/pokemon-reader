// SPDX-License-Identifier: GPL-3.0-or-later
#import "ScreenView.h"
#include "Core.h"
#include <mutex>
@implementation ScreenView {
    id<MTLCommandQueue> _commands;
    id<MTLRenderPipelineState> _pipeline;
    NSArray<id<MTLTexture>> *_textures;
    dispatch_semaphore_t _inFlight;
    unsigned _textureIndex;
    std::array<uint32_t,reader::Pixels*2> _pixels;
    std::mutex _pixelLock;
    UITouch *_activeTouch;
}
- (instancetype)initWithFrame:(CGRect)frame device:(id<MTLDevice>)device {
    if(!(self=[super initWithFrame:frame device:device]))return nil;
    self.delegate=self;self.colorPixelFormat=MTLPixelFormatBGRA8Unorm;
    self.preferredFramesPerSecond=60;self.clearColor=MTLClearColorMake(0.015,0.015,0.025,1);
    self.accessibilityLabel=@"Nintendo DS top and touch screens";
    _commands=[device newCommandQueue];_inFlight=dispatch_semaphore_create(3);
    NSString *source=@"#include <metal_stdlib>\nusing namespace metal;\n"
      "struct V { float4 p [[position]]; float2 uv; };\n"
      "vertex V vertexMain(uint id [[vertex_id]]) { float2 p[3]={float2(-1,1),float2(-1,-3),float2(3,1)};"
      " float2 uv[3]={float2(0,0),float2(0,2),float2(2,0)}; return {float4(p[id],0,1),uv[id]}; }\n"
      "fragment float4 fragmentMain(V v [[stage_in]], texture2d<float> image [[texture(0)]]) {"
      " constexpr sampler s(filter::nearest,address::clamp_to_edge); return image.sample(s,v.uv); }";
    NSError *error=nil;id<MTLLibrary> library=[device newLibraryWithSource:source options:nil error:&error];
    if(!library)[NSException raise:@"Metal setup" format:@"%@",error.localizedDescription];
    MTLRenderPipelineDescriptor *d=[MTLRenderPipelineDescriptor new];
    d.vertexFunction=[library newFunctionWithName:@"vertexMain"];d.fragmentFunction=[library newFunctionWithName:@"fragmentMain"];
    d.colorAttachments[0].pixelFormat=self.colorPixelFormat;
    _pipeline=[device newRenderPipelineStateWithDescriptor:d error:&error];
    if(!_pipeline)[NSException raise:@"Metal setup" format:@"%@",error.localizedDescription];
    NSMutableArray *textures=[NSMutableArray new];
    for(int i=0;i<3;++i){
        auto desc=[MTLTextureDescriptor texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm width:256 height:384 mipmapped:NO];
        desc.usage=MTLTextureUsageShaderRead;desc.storageMode=MTLStorageModeShared;
        [textures addObject:[device newTextureWithDescriptor:desc]];
    }
    _textures=textures;std::fill(_pixels.begin(),_pixels.end(),0xFF000000);
    return self;
}
- (void)publishPixels:(const uint32_t *)pixels {
    std::lock_guard<std::mutex> l(_pixelLock);std::copy_n(pixels,reader::Pixels*2,_pixels.begin());
}
- (CGRect)paintRect:(CGSize)size {
    double scale=std::min(size.width/256.0,size.height/384.0);
    return CGRectMake((size.width-256*scale)/2,(size.height-384*scale)/2,256*scale,384*scale);
}
- (void)drawInMTKView:(MTKView *)view {
    // Drop a presentation rather than block the UI or queue unlimited GPU work.
    if(dispatch_semaphore_wait(_inFlight,DISPATCH_TIME_NOW))return;
    auto pass=view.currentRenderPassDescriptor;auto drawable=view.currentDrawable;
    if(!pass||!drawable){dispatch_semaphore_signal(_inFlight);return;}
    id<MTLTexture> texture=_textures[_textureIndex++%3];
    {std::lock_guard<std::mutex> l(_pixelLock);
      [texture replaceRegion:MTLRegionMake2D(0,0,256,384) mipmapLevel:0 withBytes:_pixels.data() bytesPerRow:256*4];}
    id<MTLCommandBuffer> command=[_commands commandBuffer];auto encoder=[command renderCommandEncoderWithDescriptor:pass];
    CGRect r=[self paintRect:view.drawableSize];
    [encoder setViewport:(MTLViewport){r.origin.x,r.origin.y,r.size.width,r.size.height,0,1}];
    [encoder setRenderPipelineState:_pipeline];[encoder setFragmentTexture:texture atIndex:0];
    [encoder drawPrimitives:MTLPrimitiveTypeTriangle vertexStart:0 vertexCount:3];[encoder endEncoding];
    auto semaphore=_inFlight;
    [command addCompletedHandler:^(id<MTLCommandBuffer> buffer){dispatch_semaphore_signal(semaphore);}];
    [command presentDrawable:drawable];[command commit];
}
- (void)mtkView:(MTKView *)view drawableSizeWillChange:(CGSize)size { [self releaseTouch]; }
- (void)updateTouch:(UITouch *)touch {
    CGRect r=[self paintRect:self.bounds.size];CGPoint p=[touch locationInView:self];
    if(!CGRectContainsPoint(r,p)){if(self.touchHandler)self.touchHandler(-1,-1);return;}
    int x=int((p.x-r.origin.x)*256/r.size.width),y=int((p.y-r.origin.y)*384/r.size.height)-192;
    if(self.touchHandler)self.touchHandler(x,y>=0&&y<192?y:-1);
}
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if(!_activeTouch){_activeTouch=touches.anyObject;[self updateTouch:_activeTouch];}
}
- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event { if(_activeTouch)[self updateTouch:_activeTouch]; }
- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event { if([touches containsObject:_activeTouch])[self releaseTouch]; }
- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event { [self releaseTouch]; }
- (void)releaseTouch { _activeTouch=nil;if(self.touchHandler)self.touchHandler(-1,-1); }
@end
