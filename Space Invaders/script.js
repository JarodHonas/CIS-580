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
function Bullet(newX, newY) 
{
    this.x = newX;
    this.y = newY;
}

function EnemyBullet(newX, newY)
{
    this.x = newX;
    this.y = newY;
}

function Enemy(newX, newY, newShift)
{
    this.x = newX;
    this.y = newY;
    this.shift = newShift;
}
//END CLASSES



/* Game state variables */
var start = null;
var shipSpeed = .2;
var lives = 3;
var score = 0
var bulletArray = [];
var enemyArray = [];
var enemyBulletArray = [];
var reloadTime = 250;
var bulletReload = reloadTime;
var sinSum = 0;
var numShips = 16;// 655 / 8 = 82
var shipWiggle = 41;// 82/2
var lastSign = 1;
var shiftTime = 5000;
var shiftCountdown = shiftTime;
var enemyShootTime = 1000;
var enemyShootCooldown = enemyShootTime;
var enemyFlag = false;

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
    if(enemyFlag)
    {
        enemyArray.forEach(function(enemy)
        {
            enemyArray.splice(enemyArray.indexOf(enemy), 1);
        })
    }

    //ENEMY SHOOT
    if(enemyShootCooldown > 0) enemyShootCooldown-=elapsedTime;
    if(enemyShootCooldown<=0 && !enemyFlag)
    {
        var index = Math.floor(Math.random() * Math.floor(5));
        var newEnemyBullet = new EnemyBullet(enemyArray[index].x+13, enemyArray[index].y);
        enemyBulletArray.push(newEnemyBullet);
        enemyShootCooldown = enemyShootTime;
    }

    //SHIFT SIN WAVE
    sinSum += elapsedTime/1000;
    
    if(shiftCountdown > 0) shiftCountdown -= elapsedTime;
    if(shiftCountdown <= 0 && !enemyFlag)
    {
        enemyArray.forEach(function (item)
        {
            shiftEnemy(item);
        })
        spawnWave()
        shiftCountdown = shiftTime;
    }

  //CREATE BULLET
  if(bulletReload > 0) bulletReload-=elapsedTime;
  if(currentInput.space && bulletReload <= 0) {
    var bullet = new Bullet(x+13, y);
    bulletArray.push(bullet);
    bulletReload = reloadTime;
  }

  //UPDATE SHIP POS
  if(currentInput.left) {
      if(x-(shipSpeed*elapsedTime) > 10)
      {
        x -= shipSpeed * elapsedTime;
      }
      else
      {
          x = 10;//Clamp
      }
  }
  if(currentInput.right) {
      if(x+(shipSpeed*elapsedTime) < screen.width-50)
      {
        x += shipSpeed * elapsedTime;
      }
      else
      {
          x = screen.width-50;//Clamp
      }
  }
  //END SHIP POS
  
  //UPDATE BULLETS AND ENEMY BULLETS
  bulletArray.forEach(function (item)
  {
    if(!updateBullets(item))
    {
        bulletArray.splice(bulletArray.indexOf(item), 1);
    }
  })

  enemyBulletArray.forEach(function (item)
  {
    if(!updateEnemyBullets(item))
    {
        enemyBulletArray.splice(enemyBulletArray.indexOf(item), 1);
    }
  })

    //UPDATE ENEMY
    enemyArray.forEach(function (item)
    {
        updateEnemy(item);
    })

    //CHECK ENEMY COLLISIONS
    enemyArray.forEach(function (enemy)
        {
            bulletArray.forEach(function (bullet)
            {
                if(checkEnemyCollisions(enemy, bullet))
                {
                    score += 10;
                    enemyArray.splice(enemyArray.indexOf(enemy), 1);
                    bulletArray.splice(bulletArray.indexOf(bullet), 1);
                }
            })
        })

    //CHECK COLISSIONS
    enemyBulletArray.forEach(function (enemyBullet)
    {
        if(checkCollisions(enemyBullet))
        {
            if(lives>0)lives -= 1;
            enemyBulletArray.splice(enemyBulletArray.indexOf(enemyBullet), 1);
        }
    })

    checkGameOver();

}//END UPDATE FUNCTION

function spawnWave()
{
    for(var i = 0; i < numShips; i+=2)
    {
        var xPos = 25 + (i * shipWiggle) + (shipWiggle * Math.sin(sinSum));
        var ship = new Enemy(xPos, 25, i);
        enemyArray.push(ship);
    }
}

function shiftEnemy(ship)
{
    ship.y += 50;
}

function updateEnemy(ship)
{
    ship.x = 35 + (ship.shift * shipWiggle) + (shipWiggle * Math.sin(sinSum));
    if(ship.y > y)
    {
        enemyFlag = true;
    }
}

function checkCollisions(bullet)
{
    var dist = Math.pow((x+10) - bullet.x, 2) + Math.pow((y+10) - bullet.y, 2);
    if(dist < Math.pow(10, 2)) return true;
    return false;
}

function checkEnemyCollisions(enemy, bullet)
{
    var dist = Math.pow((enemy.x +10) - bullet.x, 2) + Math.pow((enemy.y+10) - bullet.y, 2);
    if(dist < Math.pow(10, 2)) return true;
    return false;
}

function renderEnemy(ship)
{
    //var str = "#" + ship.shift.toString() + ship.shift.toString() + "0000";
    screenCtx.fillStyle = "#ff0000";
    screenCtx.fillRect(10+ship.x, 10+ship.y, 20, 20);
}

function updateBullets(bullet) 
{
    bullet.y -= 7;
    if(bullet.y < 0)
    {
        return false;
    }
    return true;
}

function renderBullets(bullet)
{
    //screenCtx.clearRect(0,0, WIDTH, HEIGHT);
    screenCtx.fillStyle = "#8f079b";
    screenCtx.fillRect(3+bullet.x, 3+bullet.y, 6, 6);
}

function updateEnemyBullets(bullet)
{
    bullet.y += 7;
    if(bullet.y > screen.height)
    {
        return false;
    }
    return true;
}

function renderEnemyBullets(bullet)
{
    screenCtx.fillStyle = "#ff0000";
    screenCtx.fillRect(3+bullet.x, 3+bullet.y, 6, 6);
}

function checkGameOver()
{
    if(lives <= 0 || enemyFlag)
    {
        enemyFlag = true;
    }   
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(elapsedTime) {
    //RENDER SHIP
    screenCtx.clearRect(0, 0, WIDTH, HEIGHT);
    screenCtx.fillStyle = "#8f079b";
    screenCtx.fillRect(10+x,10+y,20,20);
    
    //RENDER BULLETS AND ENEMY BULLETS
    bulletArray.forEach(function (item)
    {
        renderBullets(item);
    })
    enemyBulletArray.forEach(function (item)
    {
        renderEnemyBullets(item);
    })

    //RENDER ENEMY
    enemyArray.forEach(function (item)
    {
        renderEnemy(item);
    })
    //RENDER TEXT
    screenCtx.font = "20px Arial";
    screenCtx.fillStyle = "#000000";
    screenCtx.fillText("LIVES: " + lives, 10, screen.height-25);
    screenCtx.fillText("SCORE: " +score, screen.width -150, screen.height-25);

    if(enemyFlag)
    {
        screenCtx.font = "120px Arial";
        screenCtx.fillStyle = "#000000";
        screenCtx.fillText("GAME OVER" , 15, 250);
    }
}

// Start the game loop
window.requestAnimationFrame(loop);
