// SPDX-License-Identifier: GPL-3.0-or-later
#pragma once
#include <algorithm>
#include <atomic>
#include <cstdint>
namespace reader {
struct InputState {
    std::atomic<uint16_t> touchKeys{0}, controllerKeys{0}, keyboardKeys{0};
    std::atomic<uint32_t> touch{0xFFFFFFFF};
    uint16_t keys() const { return touchKeys.load()|controllerKeys.load()|keyboardKeys.load(); }
    void setTouch(int x,int y) { touch=(x>=0&&x<256&&y>=0&&y<192)?uint32_t(x|(y<<8)):0xFFFFFFFF; }
    void clear() { touchKeys=0;controllerKeys=0;keyboardKeys=0;touch=0xFFFFFFFF; }
};
struct TouchPoint { int x=-1,y=-1; };
struct ScreenLayout { bool wide;double scale,left,top,width,height; };
inline ScreenLayout screenLayout(double width,double height) {
    bool wide=width>height;double w=wide?512:256,h=wide?192:384;
    double scale=std::min(width/w,height/h);
    return {wide,scale,(width-w*scale)/2,(height-h*scale)/2,w*scale,h*scale};
}
inline TouchPoint mapTouch(double width,double height,double x,double y) {
    auto r=screenLayout(width,height);if(r.scale<=0)return {};
    if(x<r.left||x>=r.left+r.width||y<r.top||y>=r.top+r.height)return {};
    double px=(x-r.left)/r.scale-(r.wide?256:0),py=(y-r.top)/r.scale-(r.wide?0:192);
    if(px<0||px>=256||py<0||py>=192)return {};
    return {int(px),int(py)};
}
}
