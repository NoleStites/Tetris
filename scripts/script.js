// TODO
// - When creating/rotating a piece, manipulate the 'state' variable
// - Do not allow rotation out of the canvas except for top

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
var originX = originX_default;
var originY = originY_default;
var currentShape; // I, J, L, O, S, T, Z
var currentOrientation = 0; // 0: default (up), 1: right, 2: down, 3: left

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
drawShape('I', currentOrientation, originX, originY);

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

// Draws the specified shape on the grid
// Possible shapes include:
// I, J, L, O, S, T, Z
function drawShape(shape, orientation, x, y)
{
    currentShape = shape;

    ctxFore.lineWidth = 5;
    ctxFore.strokeStyle = "rgb(255, 255, 255)";
    ctxFore.fillStyle = "rgb(29, 134, 8)";

    switch(shape)
    {
        case 'I':
            if (orientation == 0) {
                ctxFore.fillRect((x-2)*pixelSize, y*pixelSize, 4*pixelSize, pixelSize);
                ctxFore.strokeRect((x-2)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x-1)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x+1)*pixelSize, y*pixelSize, pixelSize, pixelSize);
            }
            else if (orientation == 1) {
                ctxFore.fillRect(x*pixelSize, (y-2)*pixelSize, pixelSize, 4*pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y-2)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y-1)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y+1)*pixelSize, pixelSize, pixelSize);
            }
            if (orientation == 2) {
                ctxFore.fillRect((x-1)*pixelSize, y*pixelSize, 4*pixelSize, pixelSize);
                ctxFore.strokeRect((x-1)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x+1)*pixelSize, y*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect((x+2)*pixelSize, y*pixelSize, pixelSize, pixelSize);
            }
            else if (orientation == 3) {
                ctxFore.fillRect(x*pixelSize, (y-1)*pixelSize, pixelSize, 4*pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y-1)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y+1)*pixelSize, pixelSize, pixelSize);
                ctxFore.strokeRect(x*pixelSize, (y+2)*pixelSize, pixelSize, pixelSize);
            }
            break;
    }
}

// params
// Action: 'left', 'right', 'cw', 'ccw' (clock- and counter-clock-wise)
function updateCurrentShape(shape, orientation, x, y, action)
{
    _clearGrid(ctxFore);

    switch(action)
    {
        case 'left':
            drawShape(shape, orientation, x, y);
            break;
        case 'right':
            drawShape(shape, orientation, x, y);
            break;
        case 'cw':
            drawShape(shape, orientation, x, y);
            break;
        case 'ccw':
            drawShape(shape, orientation, x, y);
            break;
    }
}


// Enable keyboard movement inputs
window.addEventListener("keydown", function(e) {
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            handleRotationCW();
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            handleMovementLeft(currentShape, currentOrientation);
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            handleRotationCCW();
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            handleMovementRight(currentShape, currentOrientation);
            break;
    }
});

function handleMovementLeft(shape, orientation)
{
    switch(shape)
    {
        case "I":
            if ((orientation == 0) && (originX - 2 <= 0)) {
                return;
            } else if ((orientation == 2) && (originX - 1 <= 0)) {
                return;
            } else {
                if (originX <= 0) {return;}
            }
            break;
    }

    originX -= 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY, 'left');
}

function handleMovementRight(shape, orientation)
{
    switch(shape)
    {
        case "I":
            if ((orientation == 0) && (originX + 2 == gameWidth)) {
                return;
            } else if ((orientation == 2) && (originX + 3 == gameWidth)) {
                return;
            } else {
                if (originX > gameWidth - 2) {return;}
            }
            break;
    }

    originX += 1;
    updateCurrentShape(currentShape, currentOrientation, originX, originY, 'right');
}

function handleRotationCW()
{
    currentOrientation = (currentOrientation + 1) % 4;
    updateCurrentShape(currentShape, currentOrientation, originX, originY, 'cw');
    return;
}

function handleRotationCCW()
{
    currentOrientation = (currentOrientation - 1 + 4) % 4;
    updateCurrentShape(currentShape, currentOrientation, originX, originY, 'ccw');
    return;
}