cmake_minimum_required(VERSION 3.25)
project(ReaderBrowser VERSION 0.1.0 LANGUAGES C CXX)
if(NOT EMSCRIPTEN)
  message(FATAL_ERROR "Configure with emcmake; this target is WebAssembly only")
endif()
set(CMAKE_CXX_STANDARD 17)
set(ENABLE_JIT OFF CACHE BOOL "" FORCE)
set(ENABLE_OGLRENDERER OFF CACHE BOOL "" FORCE)
set(ENABLE_GDBSTUB OFF CACHE BOOL "" FORCE)
set(BUILD_QT_SDL OFF CACHE BOOL "" FORCE)
set(ENABLE_LTO_RELEASE OFF CACHE BOOL "" FORCE)
set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")
if(NOT MELONDS_SOURCE)
  message(FATAL_ERROR "Set MELONDS_SOURCE to the source verified by scripts/build-core.mjs")
endif()
add_subdirectory("${MELONDS_SOURCE}" melon)
add_executable(b1 core/adapter.cpp core/platform.cpp)
target_link_libraries(b1 PRIVATE core)
target_include_directories(b1 PRIVATE core ../ios/Tests)
target_compile_options(b1 PRIVATE -fwrapv)
target_link_options(b1 PRIVATE
  --no-entry -O3
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker,node
  -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 -sMAXIMUM_MEMORY=1073741824
  -sFILESYSTEM=0 -sDISABLE_EXCEPTION_CATCHING=0
  "-sEXPORTED_FUNCTIONS=['_malloc','_free','_b1_load','_b1_step','_b1_video','_b1_audio','_b1_audio_read','_b1_save','_b1_save_size','_b1_revision','_b1_word','_b1_diagnostic','_b1_diagnostic_write','_b1_diagnostic_rom','_b1_diagnostic_rom_size']"
  "-sEXPORTED_RUNTIME_METHODS=['HEAPU8','HEAP16','HEAPU32']")
set_target_properties(b1 PROPERTIES SUFFIX ".mjs" RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/vendor")
