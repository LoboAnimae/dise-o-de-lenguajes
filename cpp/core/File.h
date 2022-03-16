#ifndef FILE_PROJECT_H
#define FILE_PROJECT_H
#include <string>

class FileController
{
private:
public:
    std::string file_path;            // Used by the reader method
    std::string file_output;          // Used by the writer method
    int is_valid = -1;                // Used by the method is_valid_file_name()
    FileController(std::string name); // Constructor
    ~FileController();                // None
    std::string read();               // Implemented in File.cc
    bool is_valid_file_name();        // Implemented in File.cc
    void write(std::string content);  // Implemented in File.cc
};

#endif