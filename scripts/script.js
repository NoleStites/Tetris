// TODO
// - Change the level after a while
// - - Redraw the ctxBack to update the colors
// - Handle row completion logic (delete row and cascade downwards)

const canvasBox = document.getElementById("canvasBox");
const gameCanvasBack = document.getElementById("gameCanvasBack");
const gameCanvasFore = document.getElementById("gameCanvasFore");
var ctxBack = gameCanvasBack.getContext("2d");
var ctxFore = gameCanvasFore.getContext("2d");

// Access CSS vars
const root = document.documentElement;
const styles = getComputedStyle(root);
const boardBackgroundColor = styles.getPropertyValue("--boardBackgroundColor");

// Other
var gameSpeed = 750;
var collapseSpeed = 100;
var gameStarted = false;
var gameIntervalID;
var currentLevel = 1;
var isCollapsing = false;

// Board setup
gameWidth = 10;
gameHeight = 18;
var pixelSize = Math.floor(canvasBox.offsetWidth / gameWidth);

gameCanvasBack.width = pixelSize * gameWidth;
gameCanvasBack.height = pixelSize * gameHeight;
gameCanvasBack.style.aspectRatio = `${gameWidth}/${gameHeight}`;
gameCanvasFore.width = pixelSize * gameWidth;
gameCanvasFore.height = pixelSize * gameHeight;
gameCanvasFore.style.aspectRatio = `${gameWidth}/${gameHeight}`;

// Current shape variables
var shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
var levelColors = {
    1: ['green', 'blue'],
    2: ['purple', 'pink'],
}
var originX_default = 4;
var originY_default = 4;
// var originY_default = gameHeight - 1;
var originX = originX_default;
var originY = originY_default;
var currentShape; // I, J, L, O, S, T, Z
var currentOrientation = 0; // 0: default (up), 1: right, 2: down, 3: left
var currentShapeCoordinates = [];
var currentColorIndex;
var currentTexture;
var scale = 0.85;
var offset = (pixelSize-pixelSize*scale)/2;

// Game state
// Usage: state[xCoord][yCoord]
// 0: no shape; 1: placed shapes; 2: current shape
var state = [];
for (let i = 0; i < gameWidth; i++) {
    let col = [];
    for (let j = 0; j < gameHeight; j++) {
        col.push(0);
    }
    state.push(col);
}

// Placed texture state
// Keeps track of the colors and textures of placed shapes
// for when redrawing after a row collapse
// Usage: state[xCoord][yCoord]
// Each cell contains: [colorIndex, texture]
// colorIndex: 0 for primary and 1 for secondary color of current level
// texture (0) = filled with colorIndex
// texture (1) = outlined with colorIndex
var textureState = [];
for (let i = 0; i < gameWidth; i++) {
    let col = [];
    for (let j = 0; j < gameHeight; j++) {
        col.push([]);
    }
    textureState.push(col);
}

// _drawGrid();
spawnNewShape();
startGameLoop();

// Draws the grid lines of the game board
function _drawGrid()
{
    // ctx.fillStyle = "red";
    ctxBack.lineWidth = 1;
    ctxBack.strokeStyle = "rgb(80,80,80)";
    for (let i = 0; i < gameWidth; i++)
    {
        for (let j = 0; j < gameHeight; j++)
        {
            // ctx.fillStyle = randomColor();
            // ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
            ctxBack.strokeRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
        }
    }
}

function _clearGrid(ctx)
{
    ctx.clearRect(0, 0, pixelSize*gameWidth, pixelSize*gameHeight);
}

// Loops through the state var and removes all occurances of the value '2' for current shape
// Used for repositioning the shape
function _clearCurrentShapeFromState()
{
    for (const [x, y] of currentShapeCoordinates) {
        if (state[x][y] == 2) {
            state[x][y] = 0;
        }
    }
}

// Loops through the state var and updates all occurances of the value '2' for current shape
// to be '1', meaning it was placed
// Also updates the texture map to account for all segments of the piece and their color/texture
function _placeCurrentShapeInStateAndTexture()
{
    for (const [x, y] of currentShapeCoordinates) {
        if (state[x][y] == 2) {
            state[x][y] = 1;
            textureState[x][y] = [currentColorIndex, currentTexture];
        }
    }
}

// A more visually appealing console log of the state var
function logState() {
    console.clear();

    const numRows = state[0].length; // The length of a column becomes our new row count
    const numCols = state.length;    // The number of columns becomes our new column count
    let visualGrid = "";

    // Dictionary mapping cell values to their visual characters
    const symbols = {
        0: '·', // Empty space
        1: '□', // Placed shape (Open box)
        2: '■'  // Current shape (Solid box)
    };

    // Loop through Y first (rows), then X (columns) to flip the axes
    for (let y = 0; y < numRows; y++) {
        let rowString = "";
        for (let x = 0; x < numCols; x++) {
            const cell = state[x][y];
            
            // Use the symbol mapping, defaulting to a dot if something goes wrong
            const char = symbols[cell] || '·'; 
            
            rowString += char + ' ';
        }
        visualGrid += rowString.trim() + '\n';
    }

    console.log(visualGrid);
}

// Draws the specified shape on the grid
// Possible shapes include:
// I, J, L, O, S, T, Z
// orientation: 0, 1, 2, 3
// debug: set to true if you want to place it as a non-current piece (1) for collision testing
function drawShape(shape, orientation, x, y, place=false)
{
    let shapeValue = place ? 1 : 2;
    let ctx = place ? ctxBack : ctxFore;

    currentShape = shape;
    _clearCurrentShapeFromState();

    ctx.lineWidth = 5;
    if (currentTexture == 0) { // Filled with color
        // ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.strokeStyle = levelColors[currentLevel][currentColorIndex];
        ctx.fillStyle = levelColors[currentLevel][currentColorIndex];
    } else { // Outlined with color
        ctx.strokeStyle = levelColors[currentLevel][currentColorIndex];
        ctx.fillStyle = "rgb(255, 255, 255)";
    }

    switch(shape)
    {
        // IMPORTANT: make sure the origin [x,y] is the first index
        case 'I':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-2,y], [x-1,y], [x+1,y]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x,y-2], [x,y-1], [x,y+1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x+2,y]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x,y+2]];
            }
            break;
        case 'J':
            if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x-1,y+1]];
            } else if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x-1,y-1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x+1,y-1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x+1,y+1]];
            }
            break;
        case 'L':
            if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x+1,y+1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x-1,y+1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x-1,y-1]];
            } else if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x+1,y-1]];
            }
            break;
        case 'O':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x-1,y+1], [x,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x-1,y-1], [x,y-1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x+1,y-1], [x,y-1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x+1,y+1], [x,y+1]];
            }
            break;
        case 'S':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x,y+1], [x-1,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x,y+1], [x-1,y], [x-1,y-1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x-1,y], [x+1,y-1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x+1,y], [x+1,y+1]];
            }
            break;
        case 'T':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x,y-1], [x,y+1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x,y-1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x,y-1], [x,y+1]];
            }
            break;
        case 'Z':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x,y+1], [x+1,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x,y-1], [x-1,y+1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x,y-1], [x-1,y-1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x+1,y], [x,y+1], [x+1,y-1]];
            }
            break;
    }

    for (const [x, y] of currentShapeCoordinates) {
        ctx.fillRect(x*pixelSize + offset, y*pixelSize + offset, pixelSize*scale, pixelSize*scale);
        ctx.strokeRect(x*pixelSize + offset, y*pixelSize + offset, pixelSize*scale, pixelSize*scale);
        state[x][y] = shapeValue; // Mark corresponding pos. in state as a shape
    }
    // logState();
}

// Redraws the ctxBack to reflect the updated state var
function drawBackground()
{
    ctxBack.clearRect(0, 0, gameWidth*pixelSize, gameHeight*pixelSize);
    for (let x = 0; x < gameWidth; x++) {
        for (let y = 0; y < gameHeight; y++) {   
            let cellTexture = textureState[x][y];
            if (state[x][y] != 1) {continue;}
            if (cellTexture[1] == 0) { // Filled with color
                ctxBack.strokeStyle = levelColors[currentLevel][cellTexture[0]];
                ctxBack.fillStyle = levelColors[currentLevel][cellTexture[0]];
            } else { // Outlined with color
                ctxBack.strokeStyle = levelColors[currentLevel][cellTexture[0]];
                ctxBack.fillStyle = "rgb(255, 255, 255)";
            }

            ctxBack.fillRect(x*pixelSize + offset, y*pixelSize + offset, pixelSize*scale, pixelSize*scale);
            ctxBack.strokeRect(x*pixelSize + offset, y*pixelSize + offset, pixelSize*scale, pixelSize*scale);
        }
    }
}

function updateCurrentShape(shape, orientation, x, y)
{
    _clearGrid(ctxFore);
    drawShape(shape, orientation, x, y);
}


// Enable keyboard movement inputs
window.addEventListener("keydown", function(e) {
    switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            handleMovementLeft();
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            handleMovementRight();
            break;
        case 'j':
        case 'J':
            handleRotationCCW();
            break;
        case 'k':
        case 'K':
            handleRotationCW();
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            handleSoftDrop();
            break;
    }
});

function handleMovementLeft()
{
    for (const [x, y] of currentShapeCoordinates) {
        if ((x == 0) || (state[x-1][y] == 1)) {return;}
    }
    originX -= 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
}

function handleMovementRight()
{
    for (const [x, y] of currentShapeCoordinates) {
        if ((x == gameWidth - 1) || (state[x+1][y] == 1)) {return;}
    }
    originX += 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
}

function handleRotationCW()
{
    if (!isValidRotationCW(currentShapeCoordinates, 0)) {return;}
    currentOrientation = (currentOrientation + 1) % 4;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
    return;
}

function handleRotationCCW()
{
    if (!isValidRotationCCW(currentShapeCoordinates, 0)) {return;}
    currentOrientation = (currentOrientation - 1 + 4) % 4;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
    return;
}

// Returns true is the shape was successfully lowered
// Returns false if it would collide
function handleSoftDrop()
{
    for (const [x, y] of currentShapeCoordinates) {
        if ((y+1 == gameHeight) || (state[x][y+1] == 1)) {
            return false;
        }
    }
    originY += 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
    return true;
}

// Calls the helper functions necessary to determine if a rotation will be valid
// or if it will collide
// Returns false if invalid and true otherwise
function isValidRotationCW(coordinates, originIndex)
{
    let newCoords = previewRotationCW(coordinates, originIndex);
    return validateRotation(newCoords);
}

// Calls the helper functions necessary to determine if a rotation will be valid
// or if it will collide
// Returns false if invalid and true otherwise
function isValidRotationCCW(coordinates, originIndex)
{
    let newCoords = previewRotationCCW(coordinates, originIndex);
    return validateRotation(newCoords);
}

// Returns a piece's new coordinates after a CW rotation
function previewRotationCW(coordinates, originIndex) 
{
    // 1. Get the x and y of your designated origin piece
    const [ox, oy] = coordinates[originIndex];
    
    // 2. Map through all coordinates to calculate their new positions
    return coordinates.map(([x, y]) => {
        // Apply the clockwise rotation math relative to the origin
        const newX = ox - (y - oy);
        const newY = oy + (x - ox);
        
        return [newX, newY];
    });
}

// Returns a piece's new coordinates after a CCW rotation
function previewRotationCCW(coordinates, originIndex) 
{
    // 1. Get the x and y of your designated origin piece
    const [ox, oy] = coordinates[originIndex];
    
    // 2. Map through all coordinates to calculate their new positions
    return coordinates.map(([x, y]) => {
        // Apply the counter-clockwise rotation math relative to the origin
        const newX = ox + (y - oy);
        const newY = oy - (x - ox);
        
        return [newX, newY];
    });
}

// Checks for collisions between the given coords and the current state
// returns false for invalid rotation and true otherwise
function validateRotation(previewCoords)
{
    for (const [x, y] of previewCoords) {
        // Check that stays within board on left, right, bottom
        if ((x < 0) || (x > gameWidth - 1) || (y > gameHeight - 1) || (y < 0)) {return false;}

        // Check that coords would not collide with other pieces
        if (state[x][y] == 1) {return false;}
    }

    return true;
}

// Returns a random integer between two given values (exclusive)
function randIntBetween(a, b) {
    return (Math.floor(Math.random() * b) + a);
}

// Solidifies the current shape's placement since it can no longer move
function placeShape()
{
    // Update the state var
    _placeCurrentShapeInStateAndTexture();

    // Place the shape in the background
    drawShape(currentShape, currentOrientation, originX, originY, place=true);
}

function spawnNewShape()
{
    originX = 5;
    originY = -2;
    currentOrientation = 0;
    currentColorIndex = randIntBetween(0,2);
    currentTexture = randIntBetween(0,2);
    let newShape = shapes[randIntBetween(0,shapes.length)];
    drawShape(newShape, currentOrientation, originX, originY);
}

// Returns a list of indexes for the rows to collapse this tick
function _getRowsToCollapse()
{
    let rowsToCollapse = []; // Contains row index numbers for rows to collapse

    // Loop through Y first (rows), then X (columns) to flip the axes
    for (let y = 0; y < gameHeight; y++) {
        let collapse = true;
        for (let x = 0; x < gameWidth; x++) {
            if ((state[x][y] == 0) || (state[x][y] == 2)) {
                collapse = false;
                break;
            }
        }

        if (collapse) {rowsToCollapse.push(y);}
    }
    return rowsToCollapse;
}

// Shifts all placed cells on the board down (after row(s) collapse)
function shiftBlocksDown(rows)
{
    for (let x = 0; x < gameWidth; x++) {
        rows.forEach(row => {
            for (let y = row-1; y >= 0; y--) {
                state[x][y+1] = state[x][y];
                textureState[x][y+1] = textureState[x][y];
            }
        });
    }
    // Rerender the background
    drawBackground();
}

// Runs animation for row collapse and updates all state vars accordingly
function collapseRows(rows)
{
    let collapseIndexOffset = 0; // Collapse offset starting from center of row

    let collapseIntervalID = setInterval(() => {
        let currX_left = gameWidth/2 - collapseIndexOffset - 1;
        let currX_right = gameWidth/2 + collapseIndexOffset;

        for (let i = 0; i < rows.length; i++){
            ctxBack.clearRect(currX_left*pixelSize, rows[i]*pixelSize, pixelSize, pixelSize);
            ctxBack.clearRect(currX_right*pixelSize, rows[i]*pixelSize, pixelSize, pixelSize);
        }

        // Increment this once per frame
        collapseIndexOffset++;

        if (collapseIndexOffset >= gameWidth/2) {
            // Animation finished
            clearInterval(collapseIntervalID);
            isCollapsing = false;
            shiftBlocksDown(rows);
        }
    }, collapseSpeed);
    
    return;
}

// Top-level function that scans the state of the board for any complete rows that can be deleted
// Handles the logic for deleting the row(s) and cascading downwards
function handleRowCollapse()
{
    let rows = _getRowsToCollapse();
    if (rows.length == 0) {
        // startGameLoop();
        return;
    }

    // Clear row(s) in state 
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < gameWidth; x++) {
            state[x][rows[y]] = 0;
            textureState[x][rows[y]] = [];
        }
    }
    isCollapsing = true;
    collapseRows(rows);
}

// Check to see if the player lost
// Condition: a placed piece flows out the top of the grid
// Returns 0 if no loss and 1 for loss
function checkForLoss()
{
    for (const [x, y] of currentShapeCoordinates) {
        if (y < 0) {
            return 1;
        }
    }
    return 0;
}

// The logic for game over
function endGame()
{
    // Stop game loop
    clearInterval(gameIntervalID);
}

// The top-level to run every game tick responsible for all game actions
function generateGameTick()
{
    // Check if shape can be placed
    if (!handleSoftDrop()) {
        placeShape();

        // Check for loss
        if (checkForLoss() == 1) {
            console.log("GAME OVER");
            endGame();
        };

        // Check for row collapses
        handleRowCollapse();

        spawnNewShape();
    }
}

// Begins the game logic (and loop timer)
function startGameLoop()
{
    if (gameStarted || isCollapsing) {return;}

    // gameIntervalID = setInterval(generateGameTick, 500);
    gameStarted = true;
    gameIntervalID = setInterval(generateGameTick, gameSpeed);
}