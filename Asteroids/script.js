// Screen dimensions
const WIDTH = 740
const HEIGHT = 480

// Create the canvas and context
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);

//CLASSES
function Bullet(newX, newY, newDir) 
{
    this.x = newX;
    this.y = newY;
    this.direction = newDir;
}

function EnemyBullet(newX, newY)
{
    this.x = newX;
    this.y = newY;
}

function Enemy(newX, newY, newMass, newXVel, newYVel)
{
    this.x = newX;
    this.y = newY;
    this.mass = newMass;
    this.xVel = newXVel;
    this.yVel = newYVel;
    if(this.xVel == 0)this.xVel++;
    if(this.yVel == 0)this.yVel++;
}
//END CLASSES



/* Game state variables */
var start = null;
var shipVelocity = 0;
var lives = 3;
var bulletArray = [];
var enemyArray = [];
var reloadTime = 250;
var bulletReload = reloadTime;
var numAsteroids = 3;
var enemyFlag = false;
var shipAcceleration = .1;
var shipMaxVelocity = 2;
var shipDirection = 0;
var shipTurnSpeed = 2;
var xVel = 0;
var yVel = 0;
var currentLevel = 0;
var normalMass = 32;
var score = 0;


var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
spawnWave();//Initial enemy wave


//Set Ship Pos
var x = 15;
var y = screen.height-75;

/** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event) {
  switch(event.key) {
    case ' ':
      currentInput.space = true;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = true;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = true;
      break;
    case 'ArrowUp':
    case 'w':
        currentInput.up = true;
        break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keydown', handleKeydown);

/** @function handleKeyup
  * Event handler for keyup events
  * @param {KeyEvent} event - the keyup event
  */
function handleKeyup(event) {
  switch(event.key) {
    case ' ':
      currentInput.space = false;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = false;
      break;
    case 'ArrowUp':
    case 'w':
        currentInput.up = false;
        break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keyup', handleKeyup);

/** @function loop
  * The main game loop
  * @param {DomHighResTimestamp} timestamp - the current system time,
  * in milliseconds, expressed as a double.
  */
function loop(timestamp) {
  if(!start) start = timestamp;
  var elapsedTime = timestamp - start;
  start = timestamp;
  pollInput();
  update(elapsedTime);
  render(elapsedTime);
  window.requestAnimationFrame(loop);
}

/** @function pollInput
  * Copies the current input into the previous input
  */
function pollInput() {
  priorInput = JSON.parse(JSON.stringify(currentInput));
}

/** @function update
  * Updates the game's state
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function update(elapsedTime) {

    //CHECK FOR NEW WAVE
    if(enemyArray.length == 0)
    {
        spawnWave();
    }

    //CREATE BULLET
  if(bulletReload > 0) bulletReload-=elapsedTime;
  if(currentInput.space && bulletReload <= 0) {
    var bullet = new Bullet(x + Math.cos(toRadians(shipDirection))*20, y + Math.sin(toRadians(shipDirection))*20, shipDirection);
    bulletArray.push(bullet);
    bulletReload = reloadTime;
    var audio = new Audio('Laser_Shoot.wav');
    audio.play();
  }
    
    updatePlayer();
  
    //UPDATE BULLETS AND ENEMY BULLETS
    bulletArray.forEach(function (item)
    {
        if(!updateBullets(item))
    {
        bulletArray.splice(bulletArray.indexOf(item), 1);
    }
    })


    //UPDATE ENEMY
    enemyArray.forEach(function (item)
    {
        updateEnemy(item);
        checkCollisions(item);
    })

    //CHECK ENEMY COLLISIONS
    enemyArray.forEach(function (enemy)
        {
            bulletArray.forEach(function (bullet)
            {
                if(checkEnemyCollisions(enemy, bullet))
                {
                    enemyArray.splice(enemyArray.indexOf(enemy), 1);
                    bulletArray.splice(bulletArray.indexOf(bullet), 1);
                }
            })

            enemyArray.forEach(function(asteroid)
            {
                if(enemy === asteroid)
                {

                }
                else
                {
                    checkAsteroidCollisions(enemy, asteroid);
                }
            })
        })

    //CHECK COLISSIONS
    
    checkGameOver();

}//END UPDATE FUNCTION


function updatePlayer()
{
    
   
    //UPDATE SHIP POS
    if(currentInput.right) {
        shipDirection += shipTurnSpeed;
        if(shipDirection > 360) shipDirection %= 360; //Normalize angle
    }
    if(currentInput.left) {
        shipDirection -= shipTurnSpeed;
        if(shipDirection < 0) shipDirection += 360; //Normalize angle
    }
    if(currentInput.up) {
        var xComponent = Math.cos(toRadians(shipDirection))*shipAcceleration;
        var yComponent = Math.sin(toRadians(shipDirection))*shipAcceleration;
        
        /*
        if(Math.abs(Math.pow(xComponent+xVel, 2)) + Math.abs(Math.pow(yComponent+yVel, 2)) > 10)
        {
            xComponent = 0;
            yComponent = 0;
        }*/
        xVel += xComponent;
        yVel += yComponent;
        /*
        var trueMaxXVel = shipMaxVelocity * Math.cos(toRadians(shipDirection));//SHIFT X VEL VECTORS
        var trueMaxYVel = shipMaxVelocity * Math.sin(toRadians(shipDirection));//SHIFT Y VEL VECTORS
        console.log(trueMaxYVel);


        if(xVel > trueMaxXVel) xVel = trueMaxXVel;
        else if(xVel < -trueMaxXVel) xVel = -trueMaxXVel;
        if(yVel > trueMaxYVel) yVel = trueMaxYVel;
        else if(yVel < -trueMaxYVel) yVel = -trueMaxYVel;
        */
        
    }
    x += xVel;
    y += yVel;

    if(x > WIDTH) x %= WIDTH;
    if(x < 0) x += WIDTH;
    if(y > HEIGHT) y %= HEIGHT;
    if(y < 0) y += HEIGHT;
    //END SHIP POS
}

function toRadians(angle)
{
    return angle * (Math.PI /180);
}

function spawnWave()
{
    for(i = 0; i < 3+currentLevel; i++)
    {
        var asteroid = new Enemy(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT), normalMass, Math.floor(Math.random() * 3)-2, Math.floor(Math.random() * 3)-2);
        enemyArray.push(asteroid);
    }
    currentLevel++;
}

function updateEnemy(asteroid)
{
    asteroid.x += asteroid.xVel;
    asteroid.y += asteroid.yVel;

    if(asteroid.x > WIDTH) asteroid.x %= WIDTH;
    if(asteroid.x < 0) asteroid.x += WIDTH;
    if(asteroid.y > HEIGHT) asteroid.y %= HEIGHT;
    if(asteroid.y < 0) asteroid.y += HEIGHT;
}

function checkCollisions(enemy)
{
    var dist = Math.pow((x) - enemy.x, 2) + Math.pow((y) - enemy.y, 2);
    if(dist < Math.pow(enemy.mass, 2) && lives > 0)
    {
        var audio = new Audio('Death.wav');
        audio.play();
        lives--;
        x = WIDTH/2;
        y = HEIGHT/2;
        xVel = 0;
        yVel = 0;
    }
    return false;
}

function toDegrees(radians)
{
    return radians * 57.2958;
}

function checkAsteroidCollisions(asteroid1, asteroid2)
{
    var dist = Math.pow((asteroid1.x) - asteroid2.x, 2) + Math.pow((asteroid1.y) - asteroid2.y, 2);
    if(dist < Math.pow(asteroid1.mass+asteroid2.mass, 2))
    {
        var audio = new Audio('Hit.wav');
        audio.play();
        var xVel1 = asteroid1.xVel;
        var yVel1 = asteroid1.yVel;
        var xVel2 = asteroid2.xVel;
        var yVel2 = asteroid2.yVel;
        var angle = Math.tan((asteroid1.y-asteroid2.y)/(asteroid1.x-asteroid2.x));
        
        if((xVel1*xVel1+yVel1*yVel1) > (xVel2*xVel2+yVel2*yVel2))
        {
            asteroid2.xVel += xVel1;
            asteroid2.yVel += yVel1;
        }
        else
        {
            asteroid1.xVel += xVel2;
            asteroid1.yVel += yVel2;
        }


        /*
        if((angle >= 315 && angle <= 45) || (angle >= 135 && angle <= 225))
        {
            asteroid1.xVel *= -.8;
            asteroid2.xVel *= -.8;
        }
        if((angle < 315 && angle > 225) || (angle < 135 && angle > 45))
        {
            asteroid1.yVel *= -.8;
            asteroid2.yVel *= -.8;
        }
        
        /*
        asteroid1.xVel += xVel2// * asteroid2.mass / asteroid1.mass;
        asteroid1.yVel += yVel2// * asteroid2.mass / asteroid1.mass;
        asteroid2.xVel += xVel1// * asteroid1.mass / asteroid2.mass;
        asteroid2.yVel += yVel1 //* asteroid1.mass / asteroid2.mass;
        */
        asteroid1.xVel *= .6;
        asteroid1.yVel *= .6;
        asteroid2.xVel *= .6;
        asteroid2.yVel *= .6;
    
        asteroid1.x += 4 * Math.sign(asteroid1.x - asteroid2.x);
        asteroid1.y += 4 * Math.sign(asteroid1.y - asteroid2.y);
        

        
    }
}

function checkEnemyCollisions(enemy, bullet)
{
    var dist = Math.pow((enemy.x) - bullet.x, 2) + Math.pow((enemy.y) - bullet.y, 2);
    if(dist < Math.pow(enemy.mass, 2))
    {
        var audio = new Audio('Hit.wav');
        audio.play();
        score += 10;
        if(enemy.mass > normalMass/4)
        {
            var rand = Math.random()*.5;
            var rand1 = (1-rand)*.5;
            rand += 1;
            rand1 += 1;
            var yMod = 1;
            var xMod = 1;
            if(enemy.yVel>enemy.xVel)
            {
                xMod = -1;
            }
            else
            {
                yMod = -1;
            }

            var asteroid1 = new Enemy(enemy.x, enemy.y+10, enemy.mass/2, enemy.xVel*rand, enemy.yVel*rand);
            var asteroid2 = new Enemy(enemy.x, enemy.y-10, enemy.mass/2, enemy.xVel*rand1*xMod, enemy.yVel*rand1*yMod);
            enemyArray.push(asteroid1);
            enemyArray.push(asteroid2);
        }
        return true;
    }
    return false;
}

function renderEnemy(asteroid)
{
    //var str = "#" + ship.shift.toString() + ship.shift.toString() + "0000";
    screenCtx.fillStyle = "#ffffff";
    screenCtx.beginPath();
    screenCtx.arc(asteroid.x, asteroid.y, asteroid.mass, 0, 2 * Math.PI, false);
    screenCtx.fill();
}

function updateBullets(bullet) 
{
    bullet.x += Math.cos(toRadians(bullet.direction))*5;
    bullet.y += Math.sin(toRadians(bullet.direction))*5;
    if(bullet.y < 0 || bullet.y > HEIGHT || bullet.x < 0 || bullet.x > WIDTH)
    {
        return false;
    }
    return true;
}

function renderBullets(bullet)
{
    //screenCtx.clearRect(0,0, WIDTH, HEIGHT);
    screenCtx.fillStyle = "#ffffff";
    screenCtx.fillRect(bullet.x, bullet.y, 3, 3);
}


function checkGameOver()
{
    if(lives <= 0 || enemyFlag)
    {
        enemyFlag = true;
        x = WIDTH*2;
        y = HEIGHT*2;
    }   
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(elapsedTime) {
    //RENDER SHIP
    /*
    screenCtx.clearRect(0, 0, WIDTH, HEIGHT);
    screenCtx.fillStyle = "#8f079b";
    screenCtx.fillRect(10+x,10+y,20,20);
    */
   screenCtx.clearRect(0,0, WIDTH, HEIGHT);
   screenCtx.beginPath(); // note usage below 
    var TriTopX = x + Math.cos(toRadians(shipDirection)) * 20;
    var TriTopY = y + Math.sin(toRadians(shipDirection)) * 20;
    var TriLeftX = x + Math.cos(toRadians(shipDirection+90)) * 6;
    var TriLeftY = y + Math.sin(toRadians(shipDirection+90)) * 6;
    var TriRightX = x + Math.cos(toRadians(shipDirection-90)) * 6;
    var TriRightY = y + Math.sin(toRadians(shipDirection-90)) * 6;

    //DIVOT
    var TriDivotX = x + Math.cos(toRadians(shipDirection+180)) * 8;
    var TriDivotY = y + Math.cos(toRadians(shipDirection+180)) * 8;
    //DIVOT

   // triangle
   screenCtx.fillStyle = "#FFFFFF";//WHITE
   screenCtx.moveTo(TriTopX, TriTopY); 
   screenCtx.lineTo(TriLeftX, TriLeftY); 
  // screenCtx.lineTo(TriDivotX, TriDivotY);
   screenCtx.lineTo(TriRightX, TriRightY); 
   screenCtx.fill(); // connect and fill



    //RENDER BULLETS
    bulletArray.forEach(function (item)
    {
        renderBullets(item);
    })
   

    //RENDER ENEMY
    enemyArray.forEach(function (item)
    {
        renderEnemy(item);
    })

    //RENDER TEXT
    screenCtx.font = "20px Arial";
    screenCtx.fillStyle = "#FFFFFF";//WHITE
    screenCtx.fillText("LIVES: " + lives, 10, screen.height-25);
    screenCtx.fillText("LEVEL: " + (currentLevel), WIDTH/2-50, screen.height-25);
    screenCtx.fillText("SCORE: " + score, WIDTH-130, screen.height-25);
    

    if(enemyFlag)
    {
        screenCtx.font = "120px Arial";
        screenCtx.fillStyle = "#ffffff";
        screenCtx.fillText("GAME OVER" , 15, 250);
    }
}

// Start the game loop
window.requestAnimationFrame(loop);
