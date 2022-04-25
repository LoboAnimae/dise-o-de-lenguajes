//
// Created by Yagdrassyl on 23/04/22.
//

#include "Writer.hpp"
namespace FSModifier
{
    void Writer::toFile (char *t_name, const char *t_content)
    {
      FILE *file = fopen (t_name, "w");
      fprintf (file, "%s", t_content);
      fclose (file);
    }
    void Writer::toFile (char *t_name, const std::string& t_content)
    {
      Writer::toFile (t_name, (char *)t_content.c_str());
    }
    void Writer::toFile (const std::string &t_name, const char *t_content)
    {
      Writer::toFile ((char *)t_name.c_str(), t_content);
    }
    void Writer::toFile (const std::string &t_name, const std::string &t_content)
    {
      Writer::toFile ((char *)t_name.c_str(), (char *)t_content.c_str());
    }

} // FSModifier