#include "Constants/Operators.h"

Operator::Operator(char content, std::string *regex, int position)
{
    this->position = position;
    this->regex = regex;
}

Operator::~Operator() {}

bool Operator::validate()
{
    // Check if the position is 0
    if (this->position == 0)
    {
        return false;
    }

    // Check if the operator has anything before it (target)
    std::string previous_char = this->regex->substr(this->position - 1, 1);
    if (previous_char == " " || previous_char == "+" || previous_char == "*" || previous_char == "?" || previous_char == "|" || previous_char == "?")
    {
        return false;
    }
    return true;
}

bool Or::validate()
{
    // Check if the position is 0 or the last in the string
    if (this->position == 0 || this->position == this->regex->length() - 1)
    {
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
