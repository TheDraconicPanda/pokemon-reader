// SPDX-License-Identifier: GPL-3.0-or-later
#include "ReaderServer.h"
#include <iostream>
int main(int argc,char** argv){if(argc<2)return 2;reader::ReaderServer server(argv[1],argc>2?uint16_t(std::stoi(argv[2])):0);std::cout<<server.port()<<std::endl;std::cin.get();}
