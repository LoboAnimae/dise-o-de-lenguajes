#ifndef CONSOLE_LANG_H
#define CONSOLE_LANG_H
#include <string>

typedef enum Colors
{
    BLACK = 30,
    RED = 31,
    GREEN = 32,
    YELLOW = 33,
    BLUE = 34,
    MAGENTA = 35,
    CYAN = 36,
    WHITE = 37,
    RESET = 0
} Colors;

void print_with_color(Colors color, std::string str);
void print_with_color(Colors color, const char *str);
#endif