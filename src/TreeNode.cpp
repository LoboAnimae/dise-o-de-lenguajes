//
// Created by Yagdrassyl on 23/04/22.
//

#include "TreeNode.hpp"
#include "Operator.hpp"
#include "JSON.hpp"
#include "BasicError.hpp"
#include "File.hpp"
#include <algorithm>
#include <iostream>
namespace State
{
	TreeNode* TreeNode::m_generate(const std::string& t_regex, int* t_idCounter)
	{
		if (t_regex.empty())
			return nullptr;
		if (t_regex.length() == 1)
			return new TreeNode(t_idCounter, t_regex[0]);
		TreeNode* parent = nullptr;

		for (int i = 0; i < t_regex.length(); ++i)
		{
			const char currentChar = t_regex[i];
			if (Operator::isClosingParenthesis(currentChar))
			{
				// Do nothing and move onto the next iteration
			}
			else if (Operator::isOpeningParenthesis(currentChar))
			{
				Structures::ParenthesisPair* subgroupPositions = Structures::JSON::getSubgroup(t_regex.substr(i),
					i);

				int leftPosition = subgroupPositions->leftPosition,
					rightPosition = subgroupPositions->rightPosition;

				std::string contentInsideParenthesis = t_regex.substr(leftPosition, rightPosition - leftPosition + 1);

				if (contentInsideParenthesis.empty())
				{
					continue;
				}

				auto* grouperNode = new State::TreeNode(t_idCounter, currentChar);
				State::TreeNode* subTree = m_generate(contentInsideParenthesis, t_idCounter);
				i += rightPosition - leftPosition + 1;

				if (subTree != nullptr)
				{
					grouperNode->setLeft(subTree);
				}
				if (parent == nullptr)
				{
					parent = grouperNode;
				}
				else if (parent->getLeft() == nullptr)
				{
					parent->setLeft(grouperNode);
				}
				else if (parent->getRight() == nullptr)
				{
					parent->setRight(grouperNode);
				}
				else
				{
					throw std::runtime_error(Error::BasicError::generate(Error::UNGROUPED_SYMBOL,
						"There is an unbalanced parenthesis, which lead to a parent having more than two children"));
				}

			}
			else if (Operator::isSingularOperator(currentChar))
			{
				if (parent == nullptr)
				{
					throw std::runtime_error(Error::BasicError::generate(Error::EMPTY_OPERATOR, "An operator has no target!"));
				}

				if (parent->getRight() != nullptr)
				{
					State::TreeNode* target = parent->getRight();
					auto* operatorNode = new State::TreeNode(t_idCounter, currentChar);
					operatorNode->setLeft(target);
					parent->setRight(operatorNode);
				}
				else if (parent->getLeft() != nullptr)
				{
					State::TreeNode* target = parent->getLeft();
					auto* operatorNode = new State::TreeNode(t_idCounter, currentChar);
					operatorNode->setLeft(target);
					parent->setLeft(operatorNode);
				}
				else
				{
					parent = new State::TreeNode(t_idCounter, currentChar, parent);
				}
			}
			else if (Operator::isDualOperator(currentChar))
			{
				if (parent == nullptr)
				{
					throw std::runtime_error(Error::BasicError::generate(Error::EMPTY_OPERATOR, "A dual operator has no target(s)!"));
				}

				parent = new State::TreeNode(t_idCounter, currentChar, parent);
			}
			else
			{
				if (parent == nullptr)
				{
					parent = new State::TreeNode(t_idCounter, currentChar);
				}
				else if (parent->getLeft() == nullptr)
				{
					parent->setLeft(new State::TreeNode(t_idCounter, currentChar));
				}
				else if (parent->getRight() == nullptr)
				{
					parent->setRight(new State::TreeNode(t_idCounter, currentChar));
				}
				else
				{
					throw std::runtime_error(Error::BasicError::generate(Error::INVALID_SYNTAX, "There seems to be a problem with the augmented expression"));
				}
			}
		}
		return parent;

	}
	TreeNode::TreeNode() = default;
	TreeNode::TreeNode(int t_id, char t_content)
		: ContentNode(t_content, t_id)
	{
	}
	TreeNode::TreeNode(int* t_id, char t_content)
		: TreeNode(++(*t_id), t_content)
	{
	}
	TreeNode::TreeNode(int t_id, char t_content, TreeNode* t_left)
		: TreeNode(t_id, t_content)
	{
		this->m_left = t_left;

	}
	TreeNode::TreeNode(int* t_id, char t_content, TreeNode* t_left)
		: TreeNode(++(*t_id), t_content)
	{
		this->m_left = t_left;
	}
	TreeNode::TreeNode(int t_id, char t_content, TreeNode* t_left, TreeNode* t_right)
		: TreeNode(t_id, t_content)
	{
		this->m_left = t_left;
		this->m_right = t_right;
	}
	TreeNode::TreeNode(int* t_id, char t_content, TreeNode* t_left, TreeNode* t_right)
		: TreeNode(++(*t_id), t_content)
	{
		this->m_left = t_left;
		this->m_right = t_right;
	}
	void TreeNode::setLeft(TreeNode* t_left)
	{
		this->m_left = t_left;
	}

	void TreeNode::setRight(TreeNode* t_right)
	{
		this->m_right = t_right;
	}
	void TreeNode::setTreeNodeId(int t_newId)
	{
		this->m_treeBuilderId = t_newId;
	}
	void TreeNode::setNullable(bool t_newState)
	{
		this->m_isNullable = t_newState;
	}
	TreeNode* TreeNode::getLeft()
	{
		return this->m_left;
	}
	TreeNode* TreeNode::getRight()
	{
		return this->m_right;
	}
	TreeNode* TreeNode::from(const std::string& t_regex, int* t_idCounter)
	{
		if (t_idCounter == nullptr)
		{
			t_idCounter = new int(0);
		}
		TreeNode* newTree = m_generate(t_regex, t_idCounter);
		clean(newTree, nullptr, 'l');
		setDFAInputs(newTree, nullptr, false);
		return newTree;
	}

	bool existsInVector(const std::vector<int>& source, int to_find)
	{
		for (const int& value : source)
		{
			if (value == to_find)
				return true;
		}
		return false;
	}

	void TreeNode::setDFAInputs(TreeNode* t_root, int* t_idCounter, bool t_nullable)
	{
		if (t_root == nullptr)
		{
			return;
		}
		bool alreadyIncremented = false;
		bool isOperator = true;
		if (t_idCounter == nullptr)
		{
			t_idCounter = new int(1);
		}



		setDFAInputs(t_root->getLeft(), t_idCounter, t_nullable);
		setDFAInputs(t_root->getRight(), t_idCounter, t_nullable);

		auto currentChar = std::string(1, t_root->getValue());

		/**
		 * Type         |   Nullable                                |   firstPos                                                    |   lastPos
		 * ____________________________________________________________________________________________________________________________________________________________________________________
		 * NULL_STATE   |   true                                    |   {}                                                          |   {}
		 * ____________________________________________________________________________________________________________________________________________________________________________________
		 *    i         |   false                                   |   {i}                                                         |   {i}
		 * ____________________________________________________________________________________________________________________________________________________________________________________
		 *   c1|c2      |   Nullable(c1) || Nullable(c2)            |   firstPost(c1) U firstPos(c2)                                |   lastPos(c1) U lastPos(c2)
		 * ____________________________________________________________________________________________________________________________________________________________________________________
		 *   c1.c2      |   Nullable(c1) && Nullable(c2)            |   Nullable(c1) ? firstPos(c1) U firstPos(c2) : firstPos(c1)   |   Nullable(c2) ? lastPos(c1) U lastPos(c2) : lastPos(c2)
		 * ____________________________________________________________________________________________________________________________________________________________________________________
		 *    c1*       |   true                                    |   firstPos(c1)                                                |   lastPos(c1)
		 *
		 */

		if (Constants::isNullState(currentChar))
		{
			t_root->setNullable(true);
			isOperator = false;
		}
		else if (currentChar == std::string(1, OR))
		{
			bool left = t_root->getLeft()->isNullable(),
				right = t_root->getRight()->isNullable();

			t_root->setNullable(left || right);

			for (const int& value : *t_root->getLeft()->firstPosition())
			{
				t_root->firstPosition()->push_back(value);
			}

			for (const int& value : *t_root->getRight()->firstPosition())
			{
				if (existsInVector(*t_root->firstPosition(), value))
				{
					continue;
				}
				t_root->firstPosition()->push_back(value);
			}

			for (const int& value : *t_root->getLeft()->lastPosition())
			{
				t_root->lastPosition()->push_back(value);
			}

			for (const int& value : *t_root->getRight()->lastPosition())
			{
				if (existsInVector(*t_root->lastPosition(), value))
					continue;
				t_root->lastPosition()->push_back(value);
			}

		}
		else if (currentChar == std::string(1, CONCATENATION))
		{

			bool left = t_root->getLeft()->isNullable(),
				right = t_root->getRight()->isNullable();

			t_root->setNullable(left && right);
			if (left)
			{
				for (const int& value : *t_root->getLeft()->firstPosition())
				{
					t_root->firstPosition()->push_back(value);
				}

				for (const int& value : *t_root->getRight()->firstPosition())
				{
					if (existsInVector(*t_root->firstPosition(), value))
						continue;
					t_root->firstPosition()->push_back(value);
				}
			}
			else
			{
				for (const int& value : *t_root->getLeft()->firstPosition())
				{
					t_root->firstPosition()->push_back(value);
				}
			}
			if (right)
			{
				for (const int& value : *t_root->getLeft()->lastPosition())
				{
					t_root->lastPosition()->push_back(value);
				}

				for (const int& value : *t_root->getRight()->lastPosition())
				{
					if (existsInVector(*t_root->lastPosition(), value))
						continue;
					t_root->lastPosition()->push_back(value);
				}
			}
			else
			{
				for (const int& value : *t_root->getRight()->lastPosition())
				{
					t_root->lastPosition()->push_back(value);
				}
			}
		}
		else if (currentChar == std::string(1, KLEENE))
		{
			t_root->setNullable(true);
			t_root->m_firstPosition = *t_root->getLeft()->firstPosition();
			t_root->m_lastPosition = *t_root->getLeft()->lastPosition();
		}
		else
		{
			// Defaults are already set as false
			t_root->setTreeNodeId((*t_idCounter)++);
			alreadyIncremented = true;
			t_root->firstPosition()->push_back((t_root->treeId()));
			t_root->lastPosition()->push_back(t_root->treeId());
			isOperator = false;
		}

		if (!(alreadyIncremented || isOperator))
		{
			t_root->setTreeNodeId((*t_idCounter)++);
		}
	}
	void TreeNode::clean(TreeNode* t_root, TreeNode* t_parent, char t_side)
	{
		if (t_root == nullptr)
		{
			return;
		}

		clean(t_root->getLeft(), t_root, 'l');
		clean(t_root->getRight(), t_root, 'r');

		if (t_root->getValue() == '(')
		{
			// Given that it is a parenthesis, the parent should never be null, because it should at least concatenate to the # of an augmented expression
			if (t_parent == nullptr)
			{
				throw std::runtime_error(Error::BasicError::generate(Error::UNGROUPED_SYMBOL, ""));
			}

			if (t_side == 'l')
			{
				t_parent->setLeft(t_root->getLeft());
			}
			else if (t_side == 'r')
			{
				t_parent->setRight(t_root->getLeft());
			}
			else
			{
				throw std::runtime_error(Error::BasicError::generate(Error::INVALID_SYNTAX, ""));
			}
		}
	}
	void TreeNode::print(TreeNode* t_root, int t_level)
	{
		if (t_root == nullptr)
		{
			return;
		}
		print(t_root->getRight(), t_level + 1);
		for (int i = 0; i < t_level; i++)
		{
			std::cout << "    ";
		}
		std::cout << t_root->getValue() << std::endl;
		print(t_root->getLeft(), t_level + 1);
	}
	TreeNode::~TreeNode() = default;
} // State














