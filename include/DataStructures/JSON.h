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
#endif