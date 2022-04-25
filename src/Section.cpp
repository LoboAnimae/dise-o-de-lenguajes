//
// Created by Yagdrassyl on 23/04/22.
//

#include "Section.hpp"

namespace Automaton {
    void Section::concatenateNext(Section *t_next) {
        this->getEnd()->addEmptyTransition(t_next->getBeginning());
    }

    void Section::concatenatePrevious(Section *t_previous) {
        t_previous->getEnd()->addEmptyTransition(this->getBeginning());

    }

    State::GraphNode *Section::getBeginning() {
        return this->m_beginning;
    }

    State::GraphNode *Section::getEnd() {
        return this->m_end;
    }

    void Section::setBeginning(State::GraphNode *t_beginning) {
        this->m_beginning = t_beginning;

    }

    void Section::setEnd(State::GraphNode *t_end) {
        this->m_end = t_end;

    }

    Section::Section(char t_content) {
        this->m_content = t_content;
    }

    Section::~Section() = default;
} // Automaton