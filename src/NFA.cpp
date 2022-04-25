//
// Created by Yagdrassyl on 23/04/22.
//

#include "NFA.hpp"

namespace Automaton
{
	State::TransitionPointers* NFA::from(State::TreeNode* t_root, int* t_idCounter)
	{
		if (t_root == nullptr)
		{
			return nullptr;
		}
		if (t_idCounter == nullptr)
		{
			t_idCounter = new int(0);
		}
		// Get what is in the t_root
		char value = t_root->getValue();
		// If it is an operator, then it will have a left and right
		if (isOperator(value))
		{

			// Given that it is an operator, we need to get the graphs for both the left and the right
			// State::TransitionPointers *left = create(t_root->getLeft(), t_idCounter);
			// State::TransitionPointers *right = create(t_root->getRight(), t_idCounter);

			// Check which operator it is and return the correct transition
			switch (value)
			{
			case '.':
			{ /*
         If it is a concatenation, just get the left and the right trees and concatenate them.
         In any case, a concatenation will always have left and right children to concatenate.
         Concatenation:
          Given:
           A.B where A is a graph for a and B is a graph for b

          Then:
                     e       a      e
           ----> o ----> o ----> o ----> o ---->
                         A                                  e        a       e      e       e       b        e
                         .                       = ----> o ----> o ----> o ----> o ----> o ----> o ----> o ----> o ---->
                         B
                     e       b      e
           ----> o ----> o ----> o ----> o ---->
         */

				// Get the left and right graphs
				State::TransitionPointers* left = from(t_root->getLeft(), t_idCounter);
				State::TransitionPointers* right = from(t_root->getRight(), t_idCounter);

				left->end->addEmptyTransition(right->beginning);
				return new State::TransitionPointers{ left->beginning, right->end };
			}
				break;
			case '|':
			{
				/*
				An or operator will always have left and right children to work on. Even if it is a null state.
				Because of this, anything beforehand must ensure that the | operator has a left and right child.

				Given:
					A | B where A is a graph for a and B is a graph for b

				Then:
							 A
							 a
					  e  o ----> o
					   /          \ e  e
				----> o      |     o ---->
					  \          / e
					 e  o ----> o
							b
							B
				*/
				auto* beginning = new State::GraphNode(t_idCounter);

				State::TransitionPointers* left = from(t_root->getLeft(), t_idCounter);

				State::TransitionPointers* right = from(t_root->getRight(), t_idCounter);

				auto* end = new State::GraphNode(t_idCounter);

				beginning->addEmptyTransition(left->beginning);
				beginning->addEmptyTransition(right->beginning);

				left->end->addEmptyTransition(end);
				right->end->addEmptyTransition(end);

				return new State::TransitionPointers{ beginning, end };
			}
			case '*':
			{
				/*
				A kleene operator will always have a left child to work on. It does not have a right child.

				Given:
					A* where A is a graph for a

				Then:            <-e
						---------------------
					   /  e      a       e    \
				----> o ----> o ----> o ----> o ---->
					  \                      /
					   ----------------------
								  e->
				*/

				if (t_root->getLeft() == nullptr || t_root->getRight() != nullptr)
				{
					throw std::runtime_error("There seems to be a problem with the kleene operator.");
				}
				auto* beginning = new State::GraphNode(t_idCounter);
				State::TransitionPointers* middle = from(t_root->getLeft(), t_idCounter);
				auto* end = new State::GraphNode(t_idCounter);

				// From the beginning to the middle
				beginning->addEmptyTransition(middle->beginning);
				// From the middle to the end
				middle->end->addEmptyTransition(end);

				// From the beginning to the end
				beginning->addEmptyTransition(end);
				// From the end to the beginning
				end->addEmptyTransition(beginning);
				return new State::TransitionPointers{ beginning, end };
			}
			case '+':
			{
				/*
				A positive operator will always have a left child to work on. It does not have a right child.
				It is like a kleene operator, but it needs to appear at least once, so it's like a concatenation and a kleene operator.

				Given:
					A* where A is a graph for a

				Then:                                    <-e
												---------------------
						 e       a       e    /  e      a       e    \
				----> o ----> o ----> o ----> o ----> o ----> o ----> o ---->
											   \                      /
												----------------------
														e->
				*/

				if (t_root->getLeft() == nullptr || t_root->getRight() != nullptr)
				{
					throw std::runtime_error("There seems to be a problem with the positive operator.");
				}

				auto* beginning = new State::GraphNode(t_idCounter);
				// This is forced, because nothing has been applied yet
				State::TransitionPointers* middle_forced = from(t_root->getLeft(), t_idCounter);
				// This is also forced, so it will have to be concatenated with a null state
				State::TransitionPointers* middle_optional = from(t_root->getLeft(), t_idCounter);
				auto* end = new State::GraphNode(t_idCounter);

				// From the beginning to the middle
				beginning->addEmptyTransition(middle_forced->beginning);
				// From the middle to the end
				middle_forced->end->addEmptyTransition(middle_optional->beginning);
				// From the middle_optional to the end
				middle_optional->end->addEmptyTransition(end);
				// From the end to the beginning
				end->addEmptyTransition(middle_forced->end);
				middle_forced->end->addEmptyTransition(end);
				return new State::TransitionPointers{ beginning, end };
			}
			case '?':
			{
				/*
				 Like the kleene operator, but it does not repeat "as many times as possible". Rather, it is like a "can come or not"

				 Given:
					 A* where A is a graph for a

				 Then:
								  A
						   e      a       e
				 ----> o ----> o ----> o ----> o ---->
					   \                      /
						----------------------
								   e->
			 */

				auto* beginning = new State::GraphNode(t_idCounter);
				State::TransitionPointers* middle = from(t_root->getLeft(), t_idCounter);
				auto* end = new State::GraphNode(t_idCounter);

				// From the beginning to the middle
				beginning->addEmptyTransition(middle->beginning);
				// From the middle to the end
				middle->end->addEmptyTransition(end);
				// From the end to the beginning
				beginning->addEmptyTransition(end);
				return new State::TransitionPointers{ beginning, end };
			}
			default:
				throw std::runtime_error("Unimplemented operator.");
			}
		}
			// If not, then it will be a content that can be simplified into a single state and returned
		else
		{
			/*

					  e       a       e
			----> o ----> o ----> o ----> o ---->

			*/
			auto* beginning = new State::GraphNode(t_idCounter);
			auto* first = new State::GraphNode(t_idCounter);
			auto* second = new State::GraphNode(t_idCounter);
			auto* end = new State::GraphNode(t_idCounter);

			beginning->addEmptyTransition(first);
			first->addTransition(second, value);
			if (value != '#') {
			second->addEmptyTransition(end);
			} else {
				delete end;
				second->setAcceptanceState(true);
				return new State::TransitionPointers {beginning, second};
			}
			return new State::TransitionPointers{ beginning, end };
		}
	}
	bool isOperator(char t_character)
	{
		return t_character == '|'
			   || t_character == '.'
			   || t_character == '*'
			   || t_character == '+'
			   || t_character == '?';
	}
} // Automaton