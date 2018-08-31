var boardSlots;
var curPlayer = 0;
var slots = new Array;
var slotsPoints = new Array;
winner = false;
function movePebbles(curSpot, numberPebbles) {
    slotsPoints[curSpot] = 0;
    for(var m = numberPebbles; m > 0; m--)
    {
        curSpot++;
        if(curSpot>14)
        {
            curSpot = 1;
        }
        slotsPoints[curSpot] += 1;
    }
    updateSlotsText();
}

function updateSlotsText()
{
    for(var z = 1; z < 15; z++)
    {
        slots[z].innerHTML = slotsPoints[z];
    }
}

function switchPlayer()
{
    if(winner === true)
    {
        return;
    }
    curPlayer++;
    var counter = 0;
    for(var l = 1; l < 15; l++)//Check if anyone can move
    {
        if(l != 7 && l != 14)
        {
            counter += slotsPoints[l];
            console.log(slotsPoints[l]);
        }  
    }
    console.log(counter);
    if(counter == 0)//Check for Winner
    {
        if(slotsPoints[14]> slotsPoints[7])
        {
            document.getElementById("turnText").innerHTML = "Player One Has Won!";
        }
        else if(slotsPoints[7] > slotsPoints[14])
        {
            document.getElementById("turnText").innerHTML = "Player Two Has Won!";
        }
        else
        {
            document.getElementById("turnText").innerHTML = "Draw!";
        }
        winner = true;
    }

    if(curPlayer%2 === 0)//Tops Turn
    {
        counter = 0;    
        for(var y = 8; y < 14; y++)//Check if Top can make a move
        {
            counter += slotsPoints[y];
        }
        if(counter == 0)
        {
            for(var b = 1; b < 15; b++)
            {
                if( b != 7 && b != 14)
                {
                    counter+= slotsPoints[b];
                    slotsPoints[b] = 0;
                }
            }
            slotsPoints[7] += counter;
            updateSlotsText();
            switchPlayer();//Top cannot move
            return;
        }
        document.getElementById("turnText").innerHTML = "It's Player one's turn. [Top]";
    }
    if(curPlayer %2 === 1)//Bottoms turn
    {
        counter = 0;    
        for(var y = 1; y < 7; y++)//Check if bottom can make a move
        {
            counter += slotsPoints[y];
        }
        if(counter == 0)
        {
            for(var c = 1; c < 15; c++)
            {
                if( c != 7 && c != 14)
                {
                    counter+= slotsPoints[c];
                    slotsPoints[c] = 0;
                }
            }
            slotsPoints[14] += counter;
            updateSlotsText();
            switchPlayer();//Bottom cannot move
            return;
        }
        document.getElementById("turnText").innerHTML = "It's Player two's turn. [Bottom]";
    }
}

function initGame() {
    curPlayer = 0;
    winner = false;
    for(var i = 1; i < 15; i++)
    {
        if(i === 7 || i === 14)
        {
            slotsPoints[i] = 0;
        }
        else 
        {
            slotsPoints[i] = 4;
        } 
        slots[i] = document.getElementById(i.toString());
        slots[i].innerHTML = slotsPoints[i];
    }
    document.getElementById("turnText").innerHTML = "It's Player one's turn. [Top]";
    addListeners();
}
window.onload = initGame();
function addListeners()
{
    for(var j = 1; j < 15; j++)
    {
        slots[j].addEventListener("click", function(){
            var slotId = this.id;
            console.log(winner);
            if(winner === true)
            {
                return;
            }
            if(slotId == 7 || slotId == 14)
            {
                return;
            }
            else if(curPlayer % 2 === 0 && slotId >= 1 && slotId <= 6)
            {
                return;
            }
            else if(curPlayer % 2 === 1 && slotId >= 8 && slotId <= 13)
            {
                return;
            }
            else if(slotsPoints[slotId] == 0)
            {
                return;
            }
            else
            {
                movePebbles(this.id, slotsPoints[this.id]);
                switchPlayer();
            }  
        });
    }
}
