//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_NFA_HPP
#define DISENOLENGUAJES_NFA_HPP

#include "GraphNode.hpp"
#include "TreeNode.hpp"
#include "Node.hpp"

namespace Automaton
{
	bool isOperator(char t_character);
	bool isOperator(std::string t_character);
	class NFA
	{

	 protected:
		std::string m_regex;
		bool m_hasRegex{ false };
		State::TreeNode* m_tree{ nullptr };
		std::vector<State::Node*> m_states{};

	 public:

		/**
		 * @brief Recursively creates a new NFA from a Syntax Tree
		 *
		 * @param root The root of the syntax m_tree to be worked on
		 * @param id_counter An id counter that can be used to instantiate new m_states
		 * @param current The current state that the NFA is being built from
		 * @return State::TransitionPointers*
		 */
		static State::TransitionPointers* from(State::TreeNode* t_root, int* t_idCounter);
		NFA();
		NFA(std::string t_with);
		NFA(State::TreeNode* t_syntaxTree);
		NFA(State::TransitionPointers* t_pointers);
		~NFA();
	};

} // Automaton

#endif //DISENOLENGUAJES_NFA_HPP
