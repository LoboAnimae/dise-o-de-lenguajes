#ifndef JSON_LANG_H
#define JSON_LANG_H

typedef struct json JSON_TREE;

struct json
{
    int id;
    int left;
    int right;
    bool acceptance;
    char content;
};

typedef struct parenthesis_pair
{
    int left_pos;
    int right_pos;
} parenthesis_pair;

parenthesis_pair *get_subgroup(std::string regex);
#endif