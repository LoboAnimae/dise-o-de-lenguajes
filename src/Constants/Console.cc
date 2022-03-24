#include "Constants/Console.h"
#include <string>

void print_with_color(Colors color, const char *str)
{
    printf("\033[%dm%s\033[%dm", color, str, RESET);
}
void print_with_color(Colors color, std::string str)
{
    printf("\033[%dm%s\033[%dm", color, str.c_str(), RESET);
}

std::string get_with_color(Colors color, std::string str)
{
    return "\033[" + std::to_string(color) + "m" + str + "\033[0m";
}