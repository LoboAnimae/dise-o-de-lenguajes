#include "Constants/Operators.h"
#include <stack>
#include "Constants/Console.h"
#include <stdexcept>
#include <string>
#include <vector>
#include <iostream>
Operator::Operator(char content, std::string *regex, int position)
{
    this->position = position;
    this->regex = regex;

    this->content = std::string(1, content);
}

Operator::~Operator() {}

bool Operator::validate()
{
    // Check if the position is 0
    if (this->position == 0)
    {
        this->err = "[NO TARGET] The operator \"" + get_with_color(RED, this->content) + "\" cannot be the first character of the regex.";
        return false;
    }

    // Check if the operator has anything before it (target)
    std::string previous_char = this->regex->substr(this->position - 1, 1);
    if (previous_char == " " || previous_char == "+" || previous_char == "*" || previous_char == "?" || previous_char == "|" || previous_char == "?" || previous_char == "(")
    {
        this->err = "[INVALID TARGET] The operator \"" + get_with_color(RED, this->content) + "\" cannot come after the operator \"" + previous_char + "\".";
        return false;
    }
    return true;
}

bool Or::validate()
{
    // Check if the position is 0 or the last in the string
    if (this->position == 0 || this->position == this->regex->length() - 1)
    {
        this->err = "[NO TARGET] The operator \"" + get_with_color(RED, std::string(this->position, 1)) + "\" cannot be the first or last character of the regex.";
        return false;
    }
    // Check if the operator has an opening parenthesis before it
    std::string previous_char = this->regex->substr(this->position - 1, 1);
    if (previous_char == "(")
    {
        this->err = "[NO TARGET] The operator \"" + get_with_color(RED, "|") + "\" has no target!";
        return false;
    }

    // If it is not in the last position, then it must have something around it
    return true;
}

bool Character::validate()
{
    return true;
}

Positive::Positive(char content, std::string *regex, int position) : Operator(content, regex, position)
{
}

Kleene::Kleene(char content, std::string *regex, int position) : Operator(content, regex, position)
{
}

Question::Question(char content, std::string *regex, int position) : Operator(content, regex, position)
{
}

Or::Or(char content, std::string *regex, int position) : Operator(content, regex, position)
{
}

Character::Character(char content, std::string *regex, int position) : Operator(content, regex, position)
{
}

bool validate(std::string regex)
{
    std::vector<std::string> errors = {};
    // For character in regex
    for (int i = 0; i < regex.length(); ++i)
    {
        Operator *operator_instance = get_operator(regex[i], &regex, i);
        if (operator_instance == nullptr)
        {
            throw std::runtime_error("There was an error with instance of operator");
        }
        if (!operator_instance->validate())
        {
            // Given the instance that something is wrong, point it out
            std::string message = "ERROR in position " + std::to_string(i + 1) + ".\n" + operator_instance->err + ": ";
            // Add everything before the operator
            message += regex.substr(0, i);
            // Make the operator red
            message += get_with_color(RED, regex.substr(i, 1));
            // Add everything after the operator
            message += regex.substr(i + 1, regex.length() - i - 1);
            // Throw the message
            errors.push_back(message);
        }
        delete operator_instance;
    }
    if (errors.size() > 0)
    {
        for (std::string error : errors)
        {
            std::cout << error << std::endl;
        }
        return false;
    }
    return errors.size() == 0;
}

bool grouping_validation(std::string *regex)
{
    struct char_stack
    {
        char c;
        int position;
    };
    std::stack<char_stack *> parenthesis_stack = {};
    // For character in the string
    for (int i = 0; i < regex->length(); ++i)
    {
        char current = regex->at(i);
        if (current == '(')
        {
            parenthesis_stack.push(
                new char_stack{
                    current,
                    i});
        }
        else if (current == ')')
        {
            if (parenthesis_stack.empty())
            {
                parenthesis_stack.push(
                    new char_stack{
                        current,
                        i});
                break;
            }
            else
            {
                parenthesis_stack.pop();
            }
        }
    }
    if (!parenthesis_stack.empty())
    {
        // Convert the regex to a vector
        std::vector<std::string> regex_vector = {};
        for (const char &c : *regex)
        {
            regex_vector.push_back(std::string(1, c));
        }
        while (!parenthesis_stack.empty())
        {
            char_stack *top = parenthesis_stack.top();
            parenthesis_stack.pop();
            regex_vector[top->position] = get_with_color(RED, regex_vector[top->position]);
        }
        std::string message = "[MISSING OPERAND] FOR OPERAND IN REGEX: ";
        for (const std::string &s : regex_vector)
        {
            message += s;
        }
        std::cout << message << std::endl;
        // Throw the message
        return false;
    }
    return true;
}
Operator *get_operator(char content, std::string *regex, int position)
{
    switch (content)
    {
    case '+':
        return new Positive(content, regex, position);
    case '*':
        return new Kleene(content, regex, position);
    case '?':
        return new Question(content, regex, position);
    case '|':
        return new Or(content, regex, position);
    default:
        return new Character(content, regex, position);
    }
}
