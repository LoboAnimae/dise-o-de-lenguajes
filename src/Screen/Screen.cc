
#include "Screen/Screen.h"
#include <iostream>

void clear()
{
#ifdef _WIN32
    system("cls");
#elif __APPLE__
    system("clear");
#elif __linux__
    system("clear");
#endif
}