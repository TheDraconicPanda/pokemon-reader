cmake_minimum_required(VERSION 3.25)
project(ReaderEmulator VERSION 0.1.0 LANGUAGES C CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
include(FetchContent)
file(READ "${CMAKE_CURRENT_SOURCE_DIR}/core.lock.json" CORE_LOCK)
string(JSON CORE_REVISION GET "${CORE_LOCK}" revision)
set(ENABLE_JIT OFF CACHE BOOL "No emulator JIT on iPhone" FORCE)
set(ENABLE_OGLRENDERER OFF CACHE BOOL "Native software DS renderer" FORCE)
set(ENABLE_GDBSTUB OFF CACHE BOOL "No debug network server" FORCE)
set(BUILD_QT_SDL OFF CACHE BOOL "No desktop frontend" FORCE)
set(ENABLE_LTO_RELEASE OFF CACHE BOOL "Portable initial build baseline" FORCE)
FetchContent_Declare(melonds
  GIT_REPOSITORY https://github.com/melonDS-emu/melonDS.git
  GIT_TAG "${CORE_REVISION}"
  GIT_PROGRESS TRUE)
FetchContent_MakeAvailable(melonds)
find_package(Threads REQUIRED)
add_library(reader_core STATIC Core/Core.cpp Core/Platform.cpp)
target_include_directories(reader_core PUBLIC Core)
target_link_libraries(reader_core PUBLIC core Threads::Threads)
target_compile_definitions(reader_core PUBLIC READER_CORE_REVISION="${CORE_REVISION}")

if(CMAKE_SYSTEM_NAME STREQUAL "iOS")
  enable_language(OBJCXX)
  set(CMAKE_OBJCXX_STANDARD 17)
  set(CMAKE_OBJCXX_STANDARD_REQUIRED ON)
  add_executable(ReaderEmulator MACOSX_BUNDLE App/main.mm App/EmulatorController.mm App/ScreenView.mm)
  target_compile_options(ReaderEmulator PRIVATE -fobjc-arc)
  target_link_libraries(ReaderEmulator PRIVATE reader_core
    "-framework UIKit" "-framework Foundation" "-framework Metal"
    "-framework MetalKit" "-framework AVFoundation" "-framework UniformTypeIdentifiers")
  target_compile_definitions(ReaderEmulator PRIVATE READER_BUILD_VERSION="${PROJECT_VERSION}")
  set_target_properties(ReaderEmulator PROPERTIES
    MACOSX_BUNDLE_INFO_PLIST "${CMAKE_CURRENT_SOURCE_DIR}/App/Info.plist.in"
    MACOSX_BUNDLE_GUI_IDENTIFIER "dev.thedraconicpanda.readeremulator"
    XCODE_ATTRIBUTE_PRODUCT_BUNDLE_IDENTIFIER "dev.thedraconicpanda.readeremulator"
    XCODE_ATTRIBUTE_TARGETED_DEVICE_FAMILY "1,2"
    XCODE_ATTRIBUTE_ENABLE_BITCODE "NO"
    XCODE_ATTRIBUTE_CLANG_ENABLE_MODULES "YES"
    XCODE_ATTRIBUTE_CODE_SIGNING_ALLOWED "NO"
    XCODE_ATTRIBUTE_GENERATE_INFOPLIST_FILE "NO"
    XCODE_ATTRIBUTE_CURRENT_PROJECT_VERSION "1"
    XCODE_ATTRIBUTE_MARKETING_VERSION "${PROJECT_VERSION}")
else()
  enable_testing()
  add_executable(reader_core_tests Tests/CoreTests.cpp)
  target_link_libraries(reader_core_tests PRIVATE reader_core)
  add_test(NAME reader-core-integration COMMAND reader_core_tests)
endif()
