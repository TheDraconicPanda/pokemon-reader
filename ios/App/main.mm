// SPDX-License-Identifier: GPL-3.0-or-later
#import <UIKit/UIKit.h>
#import "EmulatorController.h"
@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property(nonatomic,strong) UIWindow *window;
@end
@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)options {
    self.window=[[UIWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
    self.window.rootViewController=[EmulatorController new];
    [self.window makeKeyAndVisible];return YES;
}
@end
int main(int argc,char *argv[]) {
    @autoreleasepool { return UIApplicationMain(argc,argv,nil,NSStringFromClass(AppDelegate.class)); }
}
