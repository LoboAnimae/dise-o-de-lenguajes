#include "FileSystem/Write.h"
#include "fstream"
void write_to_file(char *name, const char *content)
{
    FILE *file = fopen(name, "w");
    fprintf(file, "%s", content);
    fclose(file);
}