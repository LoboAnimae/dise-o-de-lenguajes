//
// Created by Yagdrassyl on 23/04/22.
//

#ifndef DISENOLENGUAJES_TREE_NODE_HPP
#define DISENOLENGUAJES_TREE_NODE_HPP

#include "ContentNode.hpp"
#include <vector>
#include <string>

namespace State
{
	class TreeNode : public ContentNode
	{
	 private:
		static TreeNode* m_generate(const std::string& t_regex, int* t_idCounter);
		/**
		 * The m_right child of a node
		 */
		TreeNode* m_right{ nullptr };
		/**
		 * The m_left child of a node
		 */
		TreeNode* m_left{ nullptr };

		/**
		 * An id for the m_tree. Non-default.
		 */
		int m_treeBuilderId{ -1 };
		/**
		 * Shows if a m_tree node is nullable or not. Defaults to false.
		 */
		bool m_isNullable{ false };

		/**
		 * The first position vector for the generation of a dfa
		 */
		std::vector<int> m_firstPosition{};
		/**
		 * The last position vector for the generation of a dfa
		 */
		std::vector<int> m_lastPosition{};

	 public:

		/*****************************************************
		 * Getters
		 *****************************************************/

		[[nodiscard]] int treeId() const
		{
			return this->m_treeBuilderId;
		};
		[[nodiscard]] bool isNullable() const
		{
			return this->m_isNullable;
		};

		[[maybe_unused]] [[nodiscard]] std::vector<int>* firstPosition()
		{
			return &(this->m_firstPosition);
		}
		[[maybe_unused]] [[nodiscard]] std::vector<int>* lastPosition()
		{
			return &(this->m_lastPosition);
		}

		/**
		 * Creates a syntax m_tree from a m_regex
		 * @param t_regex The m_regex that will be used
		 * @param t_idCounter An id counter to control the state ids. Can be NULL.
		 * @return The root of the m_tree
		 */
		static TreeNode* from(const std::string& t_regex, int* t_idCounter);

		/**
		 * Calculates the dfa inputs (such as first position and last position)
		 * @param t_root The t_root of a m_tree
		 * @param t_idCounter An id counter. Can be NULL.
		 * @param t_nullable
		 */
		static void setDFAInputs(TreeNode* t_root, int* t_idCounter, bool t_nullable);

		/**
		 * Cleans a m_tree from leftover nodes, such as the ( node.
		 * @param t_root The t_root of a m_tree
		 * @param t_parent The current t_parent for recursion.
		 * @param t_side The t_side of the t_parent currently being worked on
		 */
		static void clean(TreeNode* t_root, TreeNode* t_parent, char t_side);

		/**
		 * Recursively prints a m_tree
		 * @param t_root The t_root of the m_tree
		 * @param t_level The current t_level of the m_tree
		 */
		static void print(TreeNode* t_root, int t_level);

		/**
		 * A m_tree constructor
		 */
		TreeNode();

		/**
		 * Creates a new m_tree root
		 * @param t_id The t_id of this node
		 * @param t_content The m_content
		 */
		TreeNode(int t_id, char t_content);

		/**
		 * Creates a new m_tree root
		 * @param t_id An t_id controller for this node to use
		 * @param t_content The m_content
		 */
		TreeNode(int* t_id, char t_content);

		/**
		 * Creates a new m_tree root with a t_left child
		 * @param t_id
		 * @param t_content
		 * @param t_left
		 */
		TreeNode(int t_id, char t_content, TreeNode* t_left);

		/**
		 * Creates a new m_tree root with a t_left child
		 * @param t_id
		 * @param t_content
		 * @param t_left
		 */
		TreeNode(int* t_id, char t_content, TreeNode* t_left);

		/**
		 * Creates a new m_tree root with a t_left and t_right child
		 * @param t_id
		 * @param t_content
		 * @param t_left
		 * @param t_right
		 */
		TreeNode(int t_id, char t_content, TreeNode* t_left, TreeNode* t_right);

		/**
		 * Creates a new m_tree root with a t_left and t_right child
		 * @param t_id
		 * @param t_content
		 * @param t_left
		 * @param t_right
		 */
		TreeNode(int* t_id, char t_content, TreeNode* t_left, TreeNode* t_right);

		/**
		 * Sets the t_left child of the node
		 * @param t_left
		 */
		void setLeft(TreeNode* t_left);

		/**
		 * Sets the t_right child of the node
		 * @param t_right
		 */
		void setRight(TreeNode* t_right);

		/**
		 * Sets the node id
		 * @param t_newId
		 */
		void setTreeNodeId(int t_newId);

		/**
		 * Sets whether the node is nullable or not
		 * @param t_newState
		 */
		void setNullable(bool t_newState);

		/**
		 * Gets the m_left child.
		 * @return The m_left child. Could be NULL.
		 */
		TreeNode* getLeft();

		/**
		 * Gets the m_right child.
		 * @return The m_right child. Could be NULL.
		 */
		TreeNode* getRight();

		/**
		 * Recursively destroys the m_tree
		 */
		~TreeNode();
	};

} // State

#endif //DISENOLENGUAJES_TREE_NODE_HPP
