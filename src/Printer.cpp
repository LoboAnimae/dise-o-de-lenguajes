//
// Created by Yagdrassyl on 23/04/22.
//

#include "Printer.hpp"
#include <iostream>
#include <string>
namespace Console {
    void Printer::withColor(Colors t_color, const std::string& t_message) {
        std::string opening_color = "\033[" + std::to_string(t_color) + "m";
        std::string closing_color = "\033[" + std::to_string(RESET) + "m";
        std::cout << opening_color << t_message << closing_color;
    }

    void Printer::withColor(Colors t_color, const char *t_message) {
        std::string opening_color = "\033[" + std::to_string(t_color) + "m";
        std::string closing_color = "\033[" + std::to_string(RESET) + "m";
        std::cout << opening_color << t_message << closing_color;
    }

    std::string Printer::getWithColor(Colors t_color, const std::string& t_message) {
        std::string opening_color = "\033[" + std::to_string(t_color) + "m";
        std::string closing_color = "\033[" + std::to_string(RESET) + "m";
        return opening_color + t_message + closing_color;
    }

    std::string Printer::getWithColor(Colors t_color, const char* t_message) {
        std::string opening_color = "\033[" + std::to_string(t_color) + "m";
        std::string closing_color = "\033[" + std::to_string(RESET) + "m";
        return opening_color + std::string(t_message) + closing_color;
    }
} // Console