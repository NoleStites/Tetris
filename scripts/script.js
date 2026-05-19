// TODO
// - 

const canvasBox = document.getElementById("canvasBox");
const gameCanvasBack = document.getElementById("gameCanvasBack");
const gameCanvasFore = document.getElementById("gameCanvasFore");
var ctxBack = gameCanvasBack.getContext("2d");
var ctxFore = gameCanvasFore.getContext("2d");

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
var originX_default = 4;
var originY_default = 4;
// var originY_default = gameHeight - 1;
var originX = originX_default;
var originY = originY_default;
var currentShape; // I, J, L, O, S, T, Z
var currentOrientation = 0; // 0: default (up), 1: right, 2: down, 3: left
var currentShapeCoordinates = [];

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

_drawGrid();
drawShape('I', currentOrientation, 5, 6, true);
drawShape('Z', currentOrientation, originX, originY);

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
// debug: set to true if you want to place it as a non-current piece (1) for collision testing
function drawShape(shape, orientation, x, y, debug=false)
{
    let shapeValue = debug ? 1 : 2;
    let ctx = debug ? ctxBack : ctxFore;

    currentShape = shape;
    _clearCurrentShapeFromState();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.fillStyle = "rgb(29, 134, 8)";

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
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x-1,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x-1,y-1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x+1,y-1]];
            } else if (orientation == 3) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x+1,y+1]];
            }
            break;
        case 'L':
            if (orientation == 0) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x+1,y+1]];
            } else if (orientation == 1) {
                currentShapeCoordinates = [[x,y], [x-1,y], [x+1,y], [x-1,y+1]];
            } else if (orientation == 2) {
                currentShapeCoordinates = [[x,y], [x,y-1], [x,y+1], [x-1,y-1]];
            } else if (orientation == 3) {
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
        ctx.fillRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize);
        ctx.strokeRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize);
        state[x][y] = shapeValue; // Mark corresponding pos. in state as a shape
    }
    logState();
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

function handleSoftDrop()
{
    for (const [x, y] of currentShapeCoordinates) {
        if ((y+1 == gameHeight) || (state[x][y+1] == 1)) {return;}
    }
    originY += 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY);
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