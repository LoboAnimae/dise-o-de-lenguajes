#ifndef CONSTANTS_VALIDATION_PR_H
#define CONSTANTS_VALIDATION_PR_H
#include <vector>
#include <string>
/**
 * @brief All the possible states for an AFN. More would be too complicated.
 *
 */
std::vector<char> possible_states = {'A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e'};

/**
 * @brief Operators that can appear in an Input
 *
 */
std::vector<char> operators = {'*', '+', '?', '|', ')', '.'};
std::vector<char> non_grouping_operators = {'*', '+', '?'};
/**
 * @brief The possible characters that can appear in an Input
 *
 */

std::vector<char> alphabet = {'a', 'b'};

std::string NULL_SPACE = "ε";
#endif