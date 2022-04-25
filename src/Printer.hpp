//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_PRINTER_HPP
#define DISENOLENGUAJES_PRINTER_HPP

#include <string>

namespace Console {

    typedef enum Colors {
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


    class Printer {
    public:
        /**
         * Prints a string using a t_color
         * @param t_color The t_color to be used, using the enum
         * @param t_message The string to be printed
         */
        static void withColor(Colors t_color, const std::string &t_message);

        /**
         * Prints a string using a t_color
         * @param t_color The t_color to be used, using the enum
         * @param t_message The string to be printed
         */
        static void withColor(Colors t_color, const char *t_message);

        /**
         * Wraps a string with a t_color
         * @param t_color The t_color to be used, using the enum
         * @param t_message The string to be wrapped
         * @return The string wrapped with a t_color
         */
        static std::string getWithColor(Colors t_color, const std::string &t_message);

        /**
         * Wraps a string with a t_color
         * @param t_color The t_color to be used, using the enum
         * @param t_message The string to be wrapped
         * @return The string wrapped with a t_color
         */
        static std::string getWithColor(Colors t_color, const char *t_message);
    };

} // Console

#endif //DISENOLENGUAJES_PRINTER_HPP
