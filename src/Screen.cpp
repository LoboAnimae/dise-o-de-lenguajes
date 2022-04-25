//
// Created by Yagdrassyl on 23/04/22.
//

#include "Screen.hpp"
#include <iostream>

namespace Console {
    void Screen::clear() {
#ifdef _WIN32
        system("cls");
#elif __APPLE__
        system("clear");
#elif __linux__
        system("clear");
#endif
    }
}
