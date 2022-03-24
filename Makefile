CC = g++
SRC = ./src/*.cc ./src/**/*.cc
OBJ = main.o
LIB = include



all: $(SRC)
	$(CC) -o $(OBJ) $(SRC) -I$(LIB) 