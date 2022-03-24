#include "Error/Error.h"
#include <exception>
#include "Screen/Screen.h"
#include "Screen/Menu.h"
#include <string>
#include "Automaton/Automaton.h"
#include "Constants/Console.h"
#include <iostream>
#include <stdexcept>
#include "Constants/Operators.h"

int execute();

int main(int argc, char *argv[])
{
    while (execute())
    {
    }
    return 0;
}

int execute()
{
    bool is_actively_testing = true;
    // Allocate the automaton in the stack
    int option;
    std::string regex = "";
    clear();
    std::cout << "To start, please input an initial regex:\n >>> ";
    while (true)
    {
        try
        {
            std::getline(std::cin, regex);
            bool is_valid = validate(regex),
                 is_grouping = grouping_validation(&regex);
            while (!(is_valid && is_grouping))
            {
                std::cout << "Please input a valid regex:\n >>> ";
                std::getline(std::cin, regex);
                is_valid = validate(regex);
                is_grouping = grouping_validation(&regex);
            }
            break;
        }
        catch (std::exception &e)
        {
            std::cout << e.what() << std::endl;
            std::cout << "Please input a valid regex:\n >>> ";
            continue;
        }
    }
    TreeState *syntax_tree = generate_syntax_tree(NULL, regex);
    Automaton afn = Automaton(regex);
    DeterministicAutomaton afd = DeterministicAutomaton(regex);
    clear();
    try
    {
        // Grab an initial input
        // Check if the input is valid

        // If the input is valid, generate both the AFN and the AFD and enter a loop

        while (is_actively_testing)
        {
            try
            {
                std::cout << "Regex: " << regex << "\n";
                std::cout << "Please select an option:\n\t1. Change Regex\n\t2. Test a string\n\t3. Exit\n\n>>> ";
                // Try grabbing the input from the user.
                scanf("%d", &option);

                switch (option)
                {
                case REGEX_CHANGE:
                    clear();
                    while (true)
                    {
                        try
                        {
                            std::cout << "Please input a regex:\n >>> ";
                            std::getline(std::cin, regex);
                            bool is_valid = false, is_grouped = false;
                            while (!(validate(regex) || grouping_validation(&regex)))
                            {
                                std::cout << "Please input a valid regex:\n >>> ";
                                std::getline(std::cin, regex);
                            }
                            break;
                        }
                        catch (std::exception &e)
                        {
                            std::cout << e.what() << std::endl;
                            std::cout << "Please input a valid regex:\n >>> ";
                            continue;
                        }
                    }
                    // Because the automaton is in the stack and not in the heap, the same memory is used.

                    // automaton = Automaton(regex);
                    break;
                case STRING_TEST:
                    break;

                case EXIT:
                    exit(0);
                    break;
                default:
                    throw std::runtime_error("Invalid option");
                    break;
                }
            }
            // catch (const std::runtime_error &e)
            // {
            //     clear();
            //     std::string error_message = "Error: " + std::string(e.what());
            //     print_with_color(RED, error_message);
            //     printf("\n");
            // }
            catch (std::exception &e)
            {
                clear();

                std::string error_message = "Error: " + std::string(e.what());
                print_with_color(RED, error_message);
                printf("\n");
            }
        }
    }
    catch (std::exception &e)
    {
    }
    return 1;
}
