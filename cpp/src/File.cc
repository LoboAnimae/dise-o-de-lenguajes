#include "core/File.h"
#include <string>
#include <iostream>
#include <fstream>

FileController::FileController(std::string name)
{
    this->file_path = name;
    this->file_output = "OUT_" + name;
    this->is_valid = -1;
}

bool FileController::is_valid_file_name()
{
    if (this->is_valid == -1)
    {
        this->is_valid = !(this->file_path.empty() && this->file_path.find('.') == std::string::npos)
                             ? 1
                             : 0;
    }
    return this->is_valid == 1;
}

std::string FileController::read()
{

    std::fstream input_file;
    input_file.open(this->file_path, std::ios::in);
    if (!input_file.is_open())
    {
        std::cout << "Error opening file: "
                  << this->file_path
                  << "\nMake sure that this file exists"
                  << std::endl;
        return "";
    }

    // Read the file
    std::string file_content;
    std::string line;
    while (std::getline(input_file, line))
    {
        file_content += line + "\n";
    }
    // Remove the last paragraph break
    file_content.pop_back();
    input_file.close();
    return file_content;
}

void FileController::write(std::string content)
{
    std::fstream output_file;
    output_file.open(this->file_output, std::ios::out);
    if (!output_file.is_open())
    {
        std::cout << "Error opening file: "
                  << this->file_output
                  << "\nMake sure that this file exists"
                  << std::endl;
        return;
    }
    output_file << content;
    output_file.close();
}