#include "Operator.hpp"
#include "Printer.hpp"
#include "BasicError.hpp"
#include "JSON.hpp"
#include <vector>
#include <iostream>
#include <stack>

namespace Operator {
    bool isOpeningParenthesis(const std::string &character) {
        return character == std::string(1, OPENING_PARENTHESIS);
    }

    bool isOpeningParenthesis(char character) {
        return character == OPENING_PARENTHESIS;
    }

    bool isClosingParenthesis(const std::string &character) {
        return character == std::string(1, CLOSING_PARENTHESIS);
    }

    bool isClosingParenthesis(char character) {
        return character == CLOSING_PARENTHESIS;
    }

    bool isSingularOperator(const std::string &character) {
        return character == std::string(1, KLEENE)
               || character == std::string(1, POSITIVE)
               || character == std::string(1, QUESTION);
    }

    bool isSingularOperator(char character) {
        return character == KLEENE
               || character == POSITIVE
               || character == QUESTION;
    }

    bool isDualOperator(const std::string &character) {
        return character == std::string(1, CONCATENATION)
               || character == std::string(1, OR);
    }

    bool isDualOperator(char character) {
        return character == CONCATENATION
               || character == OR;
    }

    Operator::Operator(char content, const std::string &regex, int position) {
        this->position = position;
        this->regex = regex;
        this->content = std::string(1, content);
    }


    bool Operator::validate() {
        if (this->position == 0) {
            this->err = R"([NO TARGET] The operator ")" + this->content +
                        R"(" cannot be the first character of the regex)";


            return false;

        }

        std::string previousChar = this->regex.substr(this->position - 1, 1);
        if (!Operator::isValidTarget(previousChar)) {
            this->err = R"([INVALID TARGET] The operator ")"
                        + this->content
                        + R"(" cannot come after the operator ")"
                        + previousChar
                        + R"(".)";
            return false;
        }
        return true;
    }

    bool Or::validate() {
        if (this->position == 0 || this->position == this->regex.length() - 1) {
            this->err = R"([NO TARGET] The operator "|" cannot be the first or last character of the regex)";
            return false;
        }

        std::string previousChar = std::string(1, this->regex.at(this->position - 1));
        std::string nextChar = std::string(1, this->regex.at(this->position + 1));
        bool isValid = true;
        if (!Operator::isValidTarget(previousChar)) {
            this->err = R"([NO TARGET] The operator "|" has no valid left target)";
            isValid = false;
        }
        if (!Operator::isValidTarget(nextChar)) {
            if (!this->err.empty()) {
                this->err += " nor valid right target";
            } else {
                this->err = R"([NO TARGET] The operator "|" has no valid right target)";
            }
            isValid = false;
        }
        return isValid;
    }

    Or::Or(char content, const std::string &regex, int position) : Operator(content, regex, position) {

    }


    bool Operator::isValidTarget(const std::string &t_target) {
        return t_target != " "
               && t_target != std::string(1, POSITIVE)
               && t_target != std::string(1, KLEENE)
               && t_target != std::string(1, QUESTION)
               && t_target != std::string(1, OR)
               && t_target != std::string(1, OPENING_PARENTHESIS);
    }

    bool Operator::isValidTarget(const char t_target) {
        return t_target != ' '
               && t_target != POSITIVE
               && t_target != KLEENE
               && t_target != QUESTION
               && t_target != OR
               && t_target != OPENING_PARENTHESIS;
    }

    bool Operator::validate(const std::string &t_regex) {
        std::vector<std::string> errors = {};

        for (int i = 0; i < t_regex.length(); ++i) {
            auto operatorInstance = getOperator(t_regex[i], t_regex, i);
            if (operatorInstance == nullptr) {
                throw std::runtime_error(Error::BasicError::generate(Error::ERROR_ALLOCATING_MEMORY, ""));
            }

            if (!operatorInstance->validate()) {
                std::string message = Error::BasicError::generate(Error::INVALID_SYNTAX,
                                                                  R"(Invalid Syntax in position )");

                message += std::to_string(i + 1);
                message += "\n";
                std::string subMessage = operatorInstance->err + ": ";
                int messageDisplacement = subMessage.length();
                message += subMessage;
                message += t_regex.substr(0, i);
                message += Console::Printer::getWithColor(Console::RED, std::string(1, t_regex.at(i)));
                message += t_regex.substr(i + 1, t_regex.length() - i - 1);
                message += "\n";

                std::string messageDisplacer;
                while (messageDisplacer.length() < messageDisplacement + i) {
                    messageDisplacer += " ";
                }
                message += messageDisplacer + "^ Error found here!";
                errors.push_back(message);
            }
            delete operatorInstance;
        }

        if (!errors.empty()) {
            for (const std::string &error: errors) {
                std::cout << error << std::endl;
            }
            return false;
        }
        return errors.empty();
    }

    bool Operator::groupingValidation(const std::string &regex) {
        struct CharStack {
            char character;
            int position;

            CharStack(char t_character, int t_position) : character(t_character), position(t_position) {};
        };
        std::stack<CharStack *> parenthesisStack = {};

        for (int i = 0; i < regex.length(); ++i) {
            char currentChar = regex.at(i);

            if (currentChar == OPENING_PARENTHESIS) {
                parenthesisStack.push(new CharStack(currentChar, i));
            } else if (currentChar == CLOSING_PARENTHESIS) {
                if (parenthesisStack.empty()) {
                    parenthesisStack.push(new CharStack(currentChar, i));
                    break;
                } else {
                    parenthesisStack.pop();
                }
            }
        }

        if (!parenthesisStack.empty()) {
            std::vector<std::string> regexVector = {};

            for (const char &c: regex) {
                regexVector.emplace_back(1, c);
            }

            std::stack<CharStack *> inverted = {};

            while (!parenthesisStack.empty()) {
                inverted.push(parenthesisStack.top());
                parenthesisStack.pop();
            }

            while (!inverted.empty()) {
                int position = inverted.top()->position;
                inverted.pop();
                regexVector[position] = Console::Printer::getWithColor(Console::RED, regexVector[position]);
                std::string message = Error::BasicError::generate(Error::UNGROUPED_SYMBOL,
                                                                  R"(FOR OPERAND IN REGEX ->)");
                int messageDisplacement = message.length();
//                for (const std::string &member: regexVector) {
//                    message += member;
//                }
                message += regex.substr(0, position);
                message += Console::Printer::getWithColor(Console::RED, std::string(1, regex.at(position)));
                message += regex.substr(position + 1, regex.length());
//                message[position] = Console::Printer::getWithColor(Console::RED, regexVector[position]);

                std::cout << message << "\"" << std::endl;
                std::string messagePointer = "";
                while (messagePointer.length() < position + messageDisplacement) {
                    messagePointer += " ";
                }

                std::cout << messagePointer << "^ Missing closing operand" << std::endl;
            }
            return false;
        }

        return true;
    }

    Operator *getOperator(char content, const std::string &regex, int position) {
        switch (content) {
            case POSITIVE:
                return new Positive(content, regex, position);
            case KLEENE:
                return new Kleene(content, regex, position);
            case QUESTION:
                return new Question(content, regex, position);
            case OR:
                return new Or(content, regex, position);
            default:
                return new Character(content, regex, position);
        }
    }

    Operator *getOperator(const std::string &content, const std::string &regex, int position) {
        return getOperator(((char *) content.c_str())[0], regex, position);
    }

    Operator::~Operator() = default;

    Kleene::Kleene(char content, const std::string &regex, int position) : Operator(content, regex, position) {

    }

    Character::Character(char content, const std::string &regex, int position) : Operator(content, regex, position) {

    }

    bool Character::validate() {
        return true;
    }

    Positive::Positive(char content, const std::string &regex, int position) : Operator(content, regex, position) {

    }

    Question::Question(char content, const std::string &regex, int position) : Operator(content, regex, position) {

    }
}