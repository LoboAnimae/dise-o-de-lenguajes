#ifndef OPERATORS_LANG_H
#define OPERATORS_LANG_H
#include <string>
typedef enum OPERATORS
{
} OPERATORS;

/**
 * @brief The operator class is used for validation only. They work on operators with targets.
 *
 */
class Operator
{
public:
    /**
     * @brief Construct a new Operator object.
     *
     * @param content The type of operator
     * @param regex
     */
    Operator(char content, std::string *regex, int position);
    std::string *regex;
    ~Operator();
    int position;
    virtual bool validate();
};

/**
 * @brief Zero or unlimited times
 *
 */
class Kleene : public Operator
{
public:
    Kleene(char content, std::string *regex, int position);
};

/**
 * @brief Any non-operator character, such as letters or numbers
 *
 */
class Character : public Operator
{
public:
    Character(char content, std::string *regex, int position);
    bool validate() override;
};

/**
 * @brief One or unlimited times
 *
 */
class Positive : public Operator
{
public:
    Positive(char content, std::string *regex, int position);
};

/**
 * @brief One or no times
 *
 */
class Question : public Operator
{
public:
    Question(char content, std::string *regex, int position);
};

class Or : public Operator
{
public:
    Or(char content, std::string *regex, int position);
    bool validate() override;
};

Operator *get_operator(char content, std::string *regex, int position);

#endif