//
// Created by Yagdrassyl on 23/04/22.
//

#include "NFA.hpp"
#include "File.hpp"

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
                         a
			         o ----> o
                         A                         a        b
                         .             =        o ----> o ----> o
                         B
                         b
           		      o ---->
         */

				// Get the left and right graphs
				State::TransitionPointers* left = from(t_root->getLeft(), t_idCounter);
				State::TransitionPointers* right = from(t_root->getRight(), t_idCounter);

				// Expect the end of left to have no outgoing transitions.
				for (auto transition : right->beginning->m_transitionsTo)
				{
					left->end->addTransition(transition);
				}

				delete right->beginning;
				// Make the beginning of the right, the end of the left
				right->beginning = left->end;

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

				Then:           <-e
						        -----
				          e    /  a  \    e
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
				beginning->addEmptyTransition(end);
				beginning->addEmptyTransition(middle->beginning);
				middle->end->addEmptyTransition(end);
				middle->end->addEmptyTransition(middle->beginning);
				return new State::TransitionPointers{ beginning, end };
			}
			case '+':
			{
				/*
				A positive operator will always have a left child to work on. It does not have a right child.
				It is like a kleene operator, but it needs to appear at least once, so it's like a concatenation and a kleene operator.

				Given:
					A* where A is a graph for a

				Then:              <-e
				                  -----
                    a            /  a  \
				o ----> o ----> o ----> o ----> o ---->
						 \                      /
						  ----------------------
									e->
				*/

				if (t_root->getLeft() == nullptr || t_root->getRight() != nullptr)
				{
					throw std::runtime_error("There seems to be a problem with the positive operator.");
				}

				// This is forced, because nothing has been applied yet
				State::TransitionPointers* middleForced = from(t_root->getLeft(), t_idCounter);
				// The kleene start is middleForced->end
				// This is also forced, so it will have to be concatenated with a null state
				State::TransitionPointers* middleOptional = from(t_root->getLeft(), t_idCounter);
				auto *kleeneEnd = new State::GraphNode(t_idCounter);

				middleForced->end->addEmptyTransition(middleOptional->beginning);
				middleOptional->end->addEmptyTransition(middleOptional->beginning);
				middleOptional->end->addEmptyTransition(kleeneEnd);
				middleForced->end->addEmptyTransition(kleeneEnd);

				return new State::TransitionPointers{ middleForced->beginning, kleeneEnd };
			}
			case '?':
			{
				/*
				 Like the kleene operator, but it does not repeat "as many times as possible". Rather, it is like a "can come or not"

				 Given:
					 A* where A is a graph for a

				 Then:

						   a
				 ----> o ----> o ---->
					   \       /
						-------
						   e->


			 */

				State::TransitionPointers* middle = from(t_root->getLeft(), t_idCounter);
				middle->beginning->addEmptyTransition(middle->end);
				return new State::TransitionPointers{ middle->beginning, middle->end };
			}
			default:
				throw std::runtime_error("Unimplemented operator.");
			}
		}
			// If not, then it will be a content that can be simplified into a single state and returned
		else
		{
			/*

					          a
			  	    	  o ----> o

			*/
			auto* beginning = new State::GraphNode(t_idCounter);
			auto* end = new State::GraphNode(t_idCounter);

			beginning->addTransition(end, value);
			if (value == '#')
			{
				end->setAcceptanceState(true);
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