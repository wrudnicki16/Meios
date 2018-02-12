# Meios

## Overview
Meios is a game oriented around a little cell trying to eat its way to the top of the food chain. Along the way there will be other cells trying to eat you to add to their size, you must eat the food scattered around the map and eat other smaller cells at the opportune moment.

Though you can go through the game as one cell, it is often advantageous to split into multiple cells to move faster and cover more area. This comes with the caveat, however, that your divided cells can be consumed more easily by other cells.

In addition to other cells posing a threat, you must also avoid obstacles that are going in random directions, otherwise they might break your cell down into smaller pieces.

## Functionality & MVP

In Meios, players will be able to:

- [ ] Divide into multiple smaller cells
- [ ] Merge back into bigger cells, combining their sizes
- [ ] Eat other cells
- [ ] Eject parts of themselves

In addition, this project will include:

- [ ] An about modal describing the basic functionality
- [ ] Cell AI

## Wireframes

This app will consist of a single screen with just canvas and an about modal which shows up on initial loading of the screen to describe how to play the game.

On the top left will show the score of the player as is associated with their size and how much food they have eaten. Once they reach a certain score, they will win the game.

![Wireframe 1](https://github.com/wrudnicki16/Meios/blob/master/meios1.png)

## Architecture and Technologies

This project will be implemented with the following technologies:
  * Vanilla Javascript for the overall structure and game logic as well as cell animation,
  * `HTML5 Canvas` for DOM manipulation and rendering.

There will be 2 scripts involves in this file:

`classes.js`: this script will handle providing a cell class structure and functionality.
`main.js`: this script will provide the main bulk of logic for the game, including the draw loop and collision detection.

## Implementation Timeline

### Over the weekend:
- [ ] Completed breakout tutorial
- [ ] Created uniform distribution of food
- [ ] Finished cell following the mouse position smoothly

### Day 1:
Continue working on split mechanics, tweak the split launch speed and go in the right direction. Implement camera follow. Goals for the day:
- [ ] Finish split mechanics - try to make cells less stuck in the same orientation.
- [ ] Implement reform mechanics
- [ ] Implement camera follow

### Day 2:
Goals for the day:
- [ ] Introduce simple AI, will hardcode random sizes.
- [ ] Do logic for eating other AI cells.

### Day 3:
Goals for the day:
- [ ] Create obstacles which hurt your cell
- [ ] Do logic for ejecting part of your cell

### Day 4:
Goals for the day:
- [ ] Make website nicer looking - animations + CSS
- [ ] Create the about modal

## Bonus features

- [ ] Add appropriate music to the game
- [ ] Create a split animation on collision with an obstacle of smaller size.
- [ ] Add more animations for collisions of different sizes - wall vs food vs cells
- [ ] Make it look like food is being sucked up by the cell
