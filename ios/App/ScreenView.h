// SPDX-License-Identifier: GPL-3.0-or-later
#import <MetalKit/MetalKit.h>
NS_ASSUME_NONNULL_BEGIN
@interface ScreenView : MTKView <MTKViewDelegate>
@property(nonatomic,copy,nullable) void (^touchHandler)(int x,int y);
- (void)publishPixels:(const uint32_t *)pixels;
- (void)releaseTouch;
@end
NS_ASSUME_NONNULL_END
