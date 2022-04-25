//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_WRITER_HPP
#define DISENOLENGUAJES_WRITER_HPP
#include <string>
namespace FSModifier {

    class Writer {
    public:
        static void toFile(char *t_name, const char *t_content);
        static void toFile(char *t_name, const std::string& t_content);
        static void toFile(const std::string& t_name, const char *t_content);
        static void toFile(const std::string& t_name, const std::string& t_content);
    };

} // FSModifier

#endif //DISENOLENGUAJES_WRITER_HPP
