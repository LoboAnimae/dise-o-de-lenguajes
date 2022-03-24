#ifndef STRING_GENERATORS_LANG_H
#define STRING_GENERATORS_LANG_H
#include <string>
#include <ctime>
#include <iostream>
#include <unistd.h>

static const char possible_id_elements[] =
    "0123456789"
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
class Generators
{

    static std::string GenerateID()
    {
        srand((unsigned)time(NULL) * getpid());
        std::string result = "";

        for (int i = 0; i < 12; ++i)
        {
            result += possible_id_elements[rand() % (sizeof(possible_id_elements) - 1)];
        }
        return result;
    }
};

#endif