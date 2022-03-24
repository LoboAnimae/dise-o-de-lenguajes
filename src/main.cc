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

bool validate(std::string regex)
{
    // For character in regex
    for (int i = 0; i < regex.length(); ++i)
    {
        Operator *operator_instance = get_operator(regex[i], &regex, i);
        if (operator_instance == nullptr || !operator_instance->validate())
        {
            return false;
        }
        delete operator_instance;
    }
    return true;
}

int main(int argc, char *argv[])
{
    if (!validate("(a*a*)*(a|b)*(a?a)+"))
    {
        // throw std::runtime_error("Invalid regex");
        std::cout << "Invalid regex" << std::endl;
    }
    else
    {
        std::cout << "Valid regex" << std::endl;
    }

    // Never use exceptions
    // while (execute())
    // {
    // }
    return 0;
}

int execute()
{
    // bool is_actively_testing = true;
    // // Allocate the automaton in the stack
    // Automaton automaton = Automaton();
    // int option;
    // std::string regex = "";
    // clear();
    // try
    // {
    //     // Grab an initial input
    //     // Check if the input is valid

    //     // If the input is valid, generate both the AFN and the AFD and enter a loop

    //     while (is_actively_testing)
    //     {
    //         try
    //         {
    //             printf("Please select an option:\n\t1. Change Regex\n\t2. Test a string\n\t3. Exit\n\n>>> ");
    //             // Try grabbing the input from the user.
    //             scanf("%d", &option);

    //             switch (option)
    //             {
    //             case REGEX_CHANGE:
    //                 clear();
    //                 std::getline(std::cin, regex);
    //                 // Because the automaton is in the stack and not in the heap, the same memory is used.

    //                 automaton = Automaton(regex);
    //                 break;
    //             case STRING_TEST:
    //                 break;

    //             case EXIT:
    //                 exit(0);
    //                 break;
    //             default:
    //                 throw std::runtime_error("Invalid option");
    //                 break;
    //             }
    //         }
    //         // catch (const std::runtime_error &e)
    //         // {
    //         //     clear();
    //         //     std::string error_message = "Error: " + std::string(e.what());
    //         //     print_with_color(RED, error_message);
    //         //     printf("\n");
    //         // }
    //         catch (std::exception &e)
    //         {
    //             clear();

    //             std::string error_message = "Error: " + std::string(e.what());
    //             print_with_color(RED, error_message);
    //             printf("\n");
    //         }
    //     }
    // }
    // catch (std::exception &e)
    // {
    // }
    return 1;
}

void print_with_color(Colors color, const char *str)
{
    printf("\033[%dm%s\033[%dm", color, str, RESET);
}
void print_with_color(Colors color, std::string str)
{
    printf("\033[%dm%s\033[%dm", color, str.c_str(), RESET);
}
