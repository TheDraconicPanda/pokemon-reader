// SPDX-License-Identifier: GPL-3.0-or-later
#import <UIKit/UIKit.h>
@interface ReaderWebController : UIViewController
- (instancetype)initWithOrigin:(NSURL *)origin configuration:(NSDictionary *)configuration packet:(NSDictionary *)packet;
@end
