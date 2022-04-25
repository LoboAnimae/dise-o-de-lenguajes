//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_OPERATOR_HPP
#define DISENOLENGUAJES_OPERATOR_HPP

#include <string>

#define OPENING_PARENTHESIS '('
#define CLOSING_PARENTHESIS ')'
#define KLEENE '*'
#define POSITIVE '+'
#define QUESTION '?'
#define CONCATENATION '.'
#define OR '|'

namespace Operator
{
    /**
     * Checks whether a character is an opening parenthesis
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isOpeningParenthesis (const std::string &character);

    /**
     * Checks whether a character is an opening parenthesis
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isOpeningParenthesis (char character);

    /**
     * Checks whether a character is a closing parenthesis
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isClosingParenthesis (const std::string &character);

    /**
     * Checks whether a character is a closing parenthesis
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isClosingParenthesis (char character);

    /**
     * A singular operator only has one child to the m_left, and none to the m_right
     * @example The Kleene Star Operator (*), the Positive Lock Operator (+) and the Question Mark Operator (?) are all singular operators
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isSingularOperator (const std::string &character);
    /**
     * A singular operator only has one child to the m_left, and none to the m_right
     * @example The Kleene Star Operator (*), the Positive Lock Operator (+) and the Question Mark Operator (?) are all singular operators
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isSingularOperator (char character);
    /**
     * A dual operator has two children, one to the m_right and one to the m_left.
     * @example The Concatenation Operator (.) and the OR Operator (|) are both dual operators
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isDualOperator (const std::string &character);
    /**
     * A dual operator has two children, one to the m_right and one to the m_left.
     * @example The Concatenation Operator (.) and the OR Operator (|) are both dual operators
     * @param character The character
     * @return True if it is. False otherwise
     */
    bool isDualOperator (char character);

    class Operator {
     public:
      static bool isValidTarget (const std::string &t_target);
      static bool isValidTarget (char t_target);
      static bool validate (const std::string &t_regex);
      static bool groupingValidation (const std::string &regex);
      /**
       * @brief Construct a new Operator object.
       *
       * @param content The type of operator
       * @param regex
       */
      Operator (char content, const std::string &regex, int position);
      std::string regex;
      ~Operator ();
      int position;
      virtual bool validate ();
      std::string content;
      std::string err;
    };

    [[maybe_unused]] Operator *getOperator (char content, const std::string &regex, int position);
    [[maybe_unused]] Operator *getOperator (const std::string &content, const std::string &regex, int position);

/**
 * @brief Zero or unlimited times
 *
 */
    class Kleene : public Operator {
     public:
      Kleene (char content, const std::string &regex, int position);
    };

/**
 * @brief Any non-operator character, such as letters or numbers
 *
 */
    class Character : public Operator {
     public:
      Character (char content, const std::string &regex, int position);
      bool validate () override;
    };

    /**
     * @brief One or unlimited times
     *
     */
    class Positive : public Operator {
     public:
      Positive (char content, const std::string &regex, int position);
    };

    /**
     * @brief One or no times
     *
     */
    class Question : public Operator {
     public:
      Question (char content, const std::string &regex, int position);
    };

    class Or : public Operator {
     public:
      Or (char content, const std::string &regex, int position);
      bool validate () override;
    };

}

#endif //DISENOLENGUAJES_OPERATOR_HPP
