/* 
 * @ABroadwell
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Initialize num of rows and cols to use as the game grid
var numCols = 9;
var numRows = 13;

//set avatar location to be in the center of the bottom row
var avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString();
var avatarIsPlaced = false;
var shooting = false;
var boxes = new Array();

//audio initilaization 
//var a = document.createElement('audio');
var a = new Audio('Intro.mp3');
a.setAttribute('src', 'Intro.mp3');
var warford = new Audio('areYouWithMe.mp3');
warford.setAttribute('src','areYouWithMe.mp3');
//Tank audio
var aTank = new Audio('pew.mp3');
aTank.setAttribute('src', 'pew.mp3');
//deathBox audio
var explode = new Audio('explode.mp3');
explode.setAttribute('src', 'explode.mp3');
//win level audio
var winning = new Audio('winning.mp3');
winning.setAttribute('src', 'winning.mp3');


//show users what levels are open to them and which ones are not
var oldGame = false;
if (localStorage.getItem("continue")) {
    oldGame = localStorage.getItem("continue");
}
;
var unlocked = 30;
//if (localStorage.getItem("unlockedLevels")) {
//    unlocked = localStorage.getItem("unlockedLevels");
//}
//;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.show();

    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 1800);
}
//code goes to menu function first
init();
startScreen(oldGame);
//sets up the game grid 
//puts id's for outer and locations to be used when shooting to test if avatar and laser are in the same row/col
function game(level) {
    var deathBoxCount;
    a.src = 'Game.mp3';
    a.play();
    var audioLoop = setInterval(function() {
        if (a.currentTime > 29) {
            a.pause();
            a.src = 'Game.mp3'; //resets a.currentTime
            a.play();
        }
    }, 3100);
    var id = level;
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><img id="thing" src="thing.jpg"><div class="laserGate">\n\
                    <table id="grid" border="0" cellspacing = "0" cellpadding = "0" id="a" align = "center">');
    for (i = 0; i <= numRows; i++) {
        document.write("<tr class='row" + i + "'>");
        for (j = 0; j <= numCols; j++) {
            if (j === 0) {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer top left corner'></td>");
                } else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer bottom left corner'></td>");
                } else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer left '></td>");
                }
            }
            else if (j === numCols) {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer corner top right'></td>");
                } else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class='outer corner bottom right'></td>");
                } else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class ='outer right'></td>");
                }
            }
            else {
                if (i === 0) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer top'></td>");
                } else if (i === numRows) {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "' class = 'outer bottom'></td>");
                } else {
                    document.write("<td id= '" + i.toString() + "_" + j.toString() + "'></td>");
                }
            }
        }
        document.write('</tr></div>');
    }
    ;
    // Current score functionality adds 10 points for each box hit and counts the number of shots
    Score = {
        hit: 0,
        shots: 0,
        total: 0
    };
    document.write('</table>');
    document.write('<div id="scoreBar"><div id="button"><button id="menu" align="center">Pause</button></div>');
    document.write('<div id="score-header"><p id="score">Score: ' + Score.hit + '</p></div></div>');

    if (unlocked === 1) {
        setTimeout(handHolding, 500);
    }
    ;

    function Box(boxId, hitCount) {
        this.boxId = boxId;
        this.hitCount = hitCount;
    }
    Box.prototype.setHitCount = function(hitCount) {
        this.hitCount = hitCount;
    };
    Box.prototype.getId = function() {
        return this.boxId;
    };

    Box.prototype.getHitCount = function() {
        return this.hitCount;
    };

    Box.prototype.draw = function(id, hitCount) {
        hitCount < 1 ? $("#" + id + "").removeClass("hit2") : $("#" + id + "").removeClass("hit3");
    };

    Box.prototype.boxDim = function(id) {
        var boxPos = getElementPosition(this.getId());
        return {
            left: boxPos.left,
            top: boxPos.top,
            right: boxPos.left + document.getElementById(id).offsetWidth,
            bottom: boxPos.top + document.getElementById(id).offsetHeight
        };
    };

    var laserCount = 0;
    var disappearingLasers = new Array();
    //used to create the levels
    gameLevels(id);
    function gameLevels(id) {

        //place lasers
        for (var i = 0; i < levels.level[id].laser.length; i++) {
            $("#" + levels.level[id].laser[i].position).addClass("laser");
            laserCount++;
            if (levels.level[id].laser[i].disappear) {
                disappearingLasers.push(levels.level[id].laser[i].position);
            }
        }
        ;

        //place boxes
        //boxes is an array of box objects 
        deathBoxCount = 0;
        for (var j = 0; j < levels.level[id].box.length; j++) {
            boxes[j] = new Box(levels.level[id].box[j].position, levels.level[id].box[j].hitCount);
            var box = boxes[j];
            if (levels.level[id].box[j].deathBox) {
                $("#" + box.getId() + "").addClass("deathBox");
                deathBoxCount++;
            } else {
                var boxHitCount = box.getHitCount();
                var boxId = box.getId();
                if (boxHitCount < 1) {
                    $("#" + boxId + "").addClass("unHit");
                } else if (boxHitCount == 1) {
                    $("#" + boxId + "").addClass("unHit").addClass("hit2");
                } else {
                    $("#" + boxId + "").addClass("unHit").addClass("hit2").addClass("hit3");
                }
            }
        }
        ;

        //set avatar location
        avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString();
        $("#" + avatar + "").addClass("avatar").addClass("tankTop");
        avatarIsPlaced = true;
    }

//used to get element position 
//@param of id
    function getElementPosition(id) {
        var element = document.getElementById(id);
        return {top: element.offsetTop, left: element.offsetLeft};
    }
    ;

    var grid = document.getElementById("grid");
    for (i = 0; i <= numRows; i++) {
        for (j = 0; j <= numCols; j++) {
            grid.rows[i].cells[j].onclick = function(e) {
                if ($(this).hasClass("outer") && !shooting) {
                    //get top and left coordinates of the new clicked position
                    var currentPosition = $(this).attr("id");
                    var position = getElementPosition(currentPosition);

                    //set appropriate x and y coordinates of the new position
                    var xPosition = setXLocation(this, position);
                    var yPosition = setYLocation(this, position);

                    if ($(this).hasClass("laser") && avatarIsPlaced) {
                        if (checkLocation(currentPosition)) {
                            shooting = true;
                            Score.shots += 1;

                            //fetch avatar location 
                            var temp = getElementPosition(avatar);
                            var avatarX = setXLocation(avatar, temp);
                            var avatarY = setYLocation(avatar, temp);

                            //set the thing to avatar location on a zero transition speed
                            var theThing = document.getElementById("thing");
                            theThing.style.transition = "left 0s ease-in, top 0s ease-in";
                            theThing.style.left = avatarX;
                            theThing.style.top = avatarY;
//                          
//                          //make the pew sound
                            aTank.play();
//                            setTimeout(function() {
//                                aTank.pause();
//                                aTank.src = 'pew.mp3';
//                            }, 1000);

                            //make the thing visible and change transition speed back to 1s
                            setTimeout(function() {
                                theThing.style.visibility = "visible";
                                theThing.style.transition = "left 1.2s ease-in, top 1.2s ease-in";
                            }, 1);

                            //set new location of the thing, in which it will show the transition to get there
                            setTimeout(function() {
                                var theThing = document.querySelector("#thing");
                                theThing.style.left = xPosition + "px";
                                theThing.style.top = yPosition + "px";
                            }, 1);

                            //check for collisions with box objects
                            var hit = new Array();
                            var j = 0;
                            var deathBoxCollision = false;
                            var removeLaser = false;
                            var testCollision = setInterval(function() {
                                //get the necessary location of the thing at that moment
                                var thingPosition = getElementPosition("thing");
                                var thingLeft = thingPosition.left;
                                var thingTop = thingPosition.top;

                                //test if the laser collides with any boxes
                                for (var i = 0; i < boxes.length; i++) {
                                    var box = boxes[i];
                                    var boxID = box.getId();
                                    var boxDim = box.boxDim(boxID);
                                    xOverlap = collides(thingLeft, boxDim.left, boxDim.right) || collides(thingLeft, boxDim.right, boxDim.left);
                                    yOverlap = collides(thingTop, boxDim.top, boxDim.bottom) || collides(thingTop, boxDim.bottom, boxDim.top);
                                    if (xOverlap && yOverlap) {
                                        if (!$("#" + boxID + "").hasClass("deathBox")) {
                                            box.setHitCount(box.getHitCount() - 1);
                                            if (box.getHitCount() < 0) {
                                                $("#" + boxID + "").removeClass("unHit");
                                            }
                                            else {
                                                hit[j++] = box;
                                                box.draw(boxID, box.getHitCount());
                                            }
                                            boxes.splice(i, 1);
                                            Score.hit += 100;
                                            if (disappearingLasers.indexOf(currentPosition) !== -1) {
                                                removeLaser = true;
                                            }
                                        } else {
                                            theThing.style.visibility = "hidden";
                                            deathBoxCollision = true;
                                            var nextLevel = false;
                                            levels.level[id].won = false;
                                            console.log(levels.level[id].won);
                                            explode.play();
                                            setTimeout(function() {
                                                explode.pause();
                                                explode.src = 'explode.mp3';
                                            }, 1500);
                                            delay(nextLevel, id, false, 400);
                                            clearInterval(testCollision);
                                        }
                                    }
                                }
                            }, 2);
                            setTimeout(function() {
                                clearInterval(testCollision);
                                aTank.pause();
                                aTank.src = 'pew.mp3';
                                document.getElementById("score").innerHTML = 'Score: ' + Score.hit;
                                if (removeLaser) {
                                    disappearingLasers.splice(disappearingLasers.indexOf(currentPosition), 1);
                                    $("#" + currentPosition + "").removeClass("laser");
                                    laserCount--;
                                    if (laserCount == 0 && (boxes.length + hit.length - deathBoxCount > 0)) {
                                        var nextLevel = false;
                                        levels.level[id].won = false;
                                        console.log(levels.level[id].won);
                                        explode.play();
                                        setTimeout(function() {
                                            explode.pause();
                                            explode.src = 'explode.mp3';
                                        }, 1500);
                                        delay(nextLevel, id, false, 400);
                                    }
                                }
                                console.log("deathbox count " + deathBoxCount + " lengths " + boxes.length + " " + hit.length + " " + disappearingLasers.length);
                                if ((boxes.length + hit.length - deathBoxCount) <= 0 && !deathBoxCollision) {
                                    var nextLevel = true;
                                    levels.level[id].won = true;
                                    id += 1;
                                    unlocked = parseInt(unlocked);
                                    oldgame = true;
                                    Score.total = Score.hit - Score.hit / Score.shots;
                                    if (id === unlocked) { //make sure player does not unlock a level by playing one they already beat
                                        unlocked += 1;
                                        localStorage.setItem("unlockedLevels", unlocked);
                                        localStorage.setItem("continue", oldGame);
                                    }
                                    ;
                                    winning.play();
                                    a.pause();
                                    setTimeout(function() {
                                        winning.pause();
                                        winning.src = 'winning.mp3';
                                    }, 9000);
                                    delay(nextLevel, id, false, 1000);
                                    clearInterval(testCollision);
                                }
                            }, 1200);

                            //after done shooting, hide the thing
                            //THING ABSTRACTION
                            setTimeout(function() {
                                theThing.style.visibility = "hidden";
                                for (var i = 0; i < hit.length; i++) {
                                    boxes[boxes.length] = hit[i];
                                }
                                shooting = false;
                            }, 1200);
                        }
                    } else {
                        avatarPlaced = false;
                        shooting = true;
                        $("#" + avatar + "").removeClass("avatar").removeClass('tankBottom').removeClass('tankTop').
                                removeClass('tankRight').removeClass('tankLeft').removeClass('tankUpperLeft').
                                removeClass('tankUpperRight').removeClass('tankLowerLeft').removeClass('tankLowerRight');
                        $(this).addClass("avatar");
                        avatar = currentPosition;
                        if ($("#" + avatar + "").hasClass('top')) {
                            $(this).addClass("tankBottom");
                        }
                        if ($("#" + avatar + "").hasClass('bottom')) {
                            $(this).addClass("tankTop");
                        }
                        if ($("#" + avatar + "").hasClass('left')) {
                            $(this).addClass("tankRight");
                        }
                        if ($("#" + avatar + "").hasClass('right')) {
                            $(this).addClass("tankLeft");
                        }
                        if (avatar == '0_0') {
                            $(this).addClass("tankUpperLeft");
                        }
                        if (avatar == '0_9') {
                            $(this).addClass("tankUpperRight");
                        }
                        if (avatar == '13_9') {
                            $(this).addClass("tankLowerRight");
                        }
                        if (avatar == '13_0') {
                            $(this).addClass("tankLowerLeft");
                        }
                        avatarPlaced = true;
                        shooting = false;
                    }
                }
            };
        }
    }

    function setXLocation(obj, position) {
        cellWidth = document.getElementById("5_5").offsetWidth;
        return $(obj).hasClass("left") ?
                position.left + cellWidth :
                ($(obj).hasClass("right") ? position.left : position.left + cellWidth / 2 - $("#thing").width() / 2);
    }

    function setYLocation(obj, position) {
        cellHeight = document.getElementById("5_5").offsetHeight;
        return $(obj).hasClass("top") ?
                position.top + cellHeight :
                ($(obj).hasClass("bottom") ? position.top : position.top + cellHeight / 2 - $("#thing").height() / 2);
    }

    function collides(value, min, max) {
        return (value >= min - 5) && (value <= max + 5);
    }

    function checkLocation(laser) {
        return ($("#" + laser + "").hasClass("left") && $(".avatar").hasClass("left")) ? false :
                ($("#" + laser + "").hasClass("right") && $(".avatar").hasClass("right")) ? false :
                ($("#" + laser + "").hasClass("top") && $(".avatar").hasClass("top")) ? false :
                ($("#" + laser + "").hasClass("bottom") && $(".avatar").hasClass("bottom")) ? false : true;
    }

    $("#menu").click(function() {
        clearInterval(audioLoop);
        menuOverlay(levels.level[level].won, id, true);
    });
}
;

function delay(nextLevel, id, bool, delay) {
    setTimeout(function() {
        menuOverlay(nextLevel, id, bool);
    }, delay);
}
;

//a screen that says Laser Gate and has a big button to begin the game
function startScreen(cont) {
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><div id="firstPage" class="welcomeScreen"><h1>Laser Gate</h1>');
    if (cont) {
        document.write('<a href="#" id="welcomeButton" class="myButton">Continue</a><br>');
    }
    document.write('<a class="myButton" id="clearStorage" align="center">New Game</a></div>');
    init();
    warford.play();
    setTimeout(function() {
        warford.pause();
        a.play();
    }, 2000);
    var audioLoop = setInterval(function() {
        if (a.currentTime > 30) {
            a.pause();
            a.src = 'Intro.mp3'; //resets a.currentTime
            a.play();
        }
    }, 2100);
    $('#welcomeButton').on('click touchstart', function() {
        document.body.innerHTML = '';
        menu();
    });

    $('#clearStorage').on('click touchstart', function() {
        //this deletes the game()
        localStorage.clear();
        document.location.replace('');
        document.location.reload();
        //unlocked = 1;
        menu();
    });
}

function menu() { //this will bring the user back to the level screen so he can pick the next level
    document.write('<link rel="stylesheet" type="text/css" href="laserGate.css"/><div class="menu"><h1><strong>Laser Gate</strong></h1><table id="selector" cellspacing = "15" cellpadding = "10" id="a" align = "center">');
    var numRows = 6;
    var numColmns = 5;
    var blockId = 1;
//    console.log(unlocked);
    for (i = 0; i < numRows; i++) { //the menu table
        document.write('<tr id="row"' + i + '>');

        for (j = 0; j < numColmns; j++) {
            if (blockId <= unlocked) {
                document.write("<td id= '" + blockId.toString() + "' class='unlocked'>" + blockId.toString() + "</td>");
            } else {
                document.write("<td id= '" + blockId.toString() + "' class='locked'>" + blockId.toString() + "</td>");
            }
            blockId++;
        }
        ;
        document.write('</tr>');
    }
    ;
    document.write('</table><button id="returnWelcome">Main Menu</button></div>');
    $('#selector td').click(function() { //when you click on a <td> element it will get the id and use that to correlate with the level desired
        var id = $(this).attr('id');
        console.log('id for this level is: ' + id);
        console.log("id <= unlocked? " + id <= unlocked);

        //checks to see if level has been unlocked then allows you to enter game again
//            console.log("go to level " + id + "");
        if (id <= unlocked) {
            console.log("go to level " + id + "");
            $('.menu').html(''); //remove everything
            $('div').removeClass("menu");
            var compLevel = id - 1; 
            a.pause();
            oldGame = true; //used to add contrubute tag to the startscreen
            game(compLevel); //game(id) will be used with a next level function when there is a variety of levels
        }
        ;
    });

    $('#returnWelcome').click(function() {
        document.location.replace('');
        startScreen(cont);
    });

}

function handHolding() {
    document.write('<div class="helpOverlay"><div class="helpOptions">\n\
            <center><h1>LASER GATE</h1><h2>Instructions:</h2>\n\
            <ol>\n\
                <li>You are the tank. The tank can move anywhere in the outer grid.</li>\n\
                <li>Click on the red targets to shoot across the grid!</li>\n\
                <li>Clear the boxes in the least amount of moves possible. Watch out for dangers on the grid!</li>\n\
            </ol>\n\
            <a id="startLevel">Click to begin</a></center></div></div>');
    warford.src = 'areYouWithMe.mp3';
    warford.play();
    setTimeout(function() {
        warford.pause();
    }, 2000);
    $('#startLevel').click(function() {
        $('.helpOverlay').html('');
        $('div').removeClass('helpOverlay');
    });
}
;

function menuOverlay(won, id, paused) {
    a.pause();
    document.write('<div class="onTop"><div class="menuOverlay"><center><div id="OverlayOptions" align="center"><h1 id="pauseHeader"></h1><img id="stars"><p id="finalScores"></p><div id="buttonRow"><button class="onTop" id="menuClick" align="center">Level Select</button>');
    if (!won && paused) {
        document.getElementById("pauseHeader").style.fontSize = "400%";
        document.getElementById("pauseHeader").innerHTML = 'Paused';
        document.write('<button class="onTop" id="resume" align="center">Resume</button>');
    }
    else if (won && !paused) {
        document.getElementById("pauseHeader").style.fontSize = "300%";
        document.getElementById("pauseHeader").innerHTML = 'Level Complete';
        if (Score.hit > 1000) {  // real logic goes here            
            document.getElementById("stars").src = 'pics/3stars.png';
            document.getElementById("stars").style.visibility = "visible";
        }
        else {
            document.getElementById("stars").src = 'pics/0stars.png';
            document.getElementById("stars").style.visibility = "visible";
        }
        document.getElementById("finalScores").innerHTML = 'Score: ' + Score.hit + '<br>Shots Fired: ' + Score.shots;
        document.write('<button class="onTop" id="nextLevel" align="center">Next Level</button>');
    }
    else if (won && paused) {
        document.getElementById("pauseHeader").style.fontSize = "400%";
        document.getElementById("pauseHeader").innerHTML = 'Paused';
        document.write('<button class="onTop" id="resume" align="center">Resume</button>');
        document.write('<button class="onTop" id="nextLevel" align="center">Next Level</button>');
    }
    else {
        document.getElementById("pauseHeader").style.fontSize = "300%";
        document.getElementById("pauseHeader").innerHTML = 'Game Over';
        document.getElementById("finalScores").innerHTML = 'Score: ' + Score.hit + '<br>Shots Fired: ' + Score.shots;
    }
    document.write('<button class="onTop" id="restart" align="center">Restart</button></div></center></div></div></div>');
    $('#menuClick').click(function() {
        //this deletes the game()
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        console.log('Audio on?' + a.paused);
        if (a.paused) {
            winning.pause();
            a.src = 'Intro.mp3';
            a.play();
        }
        menu();
    });

    $('#nextLevel').click(function() {
        //this deletes the game()
        avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString(); //reset the avatar
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        if (levels.level[id].won) { //fixed bug that if you won a level and went back you couldn't progress to next level until you won again
            id += 1;
        }
        game(id);//will pass in a value that a NEXTLEVEL function will read and change levels with 
    });

    $('#resume').click(function() {
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
    });
    console.log('won: ' + won + ' id: ' + id);
    $('#restart').click(function() {
        //this deletes the game()
        avatar = numRows.toString() + "_" + Math.floor(numCols / 2).toString(); //reset the avatar
        $('.laserGate').html('');
        $('#thing').remove();
        $('div').removeClass('laserGate');
        //this deletes the menuOverlay
        $('.menuOverlay').html('');
        $('div').removeClass('menuOverlay');
        if (won && id !== 0) { //so restart does not go to the next level if you won the current level
            id--;
        }
        ;
        game(id);
    });
}
;


//json for the levels in the game 
var levels = {
    level:
            [
                {
                    //level 1
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 2
                    won: false,
                    box: [{position: "1_4", hitCount: 0}, {position: "6_3", hitCount: 0}, {position: "8_8", hitCount: 0}, {position: "7_8", hitCount: 0}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "1_0"}, {position: "1_9"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 3
                    won: false,
                    box: [{position: "2_4", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "9_7", hitCount: 0}, {position: "10_7", hitCount: 0}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 4
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 5
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 1}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 6
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 7
                    won: false,
                    box: [{position: "2_2", deathBox: true}, {position: "5_7", deathBox: true}, {position: "4_7", hitCount: 1}, {position: "1_4", hitCount: 2}, {position: "6_3", hitCount: 2}, {position: "8_8", hitCount: 0}, {position: "7_8", hitCount: 3}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "0_8"}, {position: "0_2", disappear: true}, {position: "2_0"}, {position: "7_9"}]
                },
                {
                    //level 8
                    won: false,
                    box: [{position: "1_5", hitCount: 1}, {position: "4_3", hitCount: 0}, {position: "5_9", hitCount: 1}, {position: "6_5", hitCount: 2}, {position: "9_2", hitCount: 2}, {position: "9_4", hitCount: 2}, {position: "11_2", hitCount: 2}],
                    laser: [{position: "0_5"}, {position: "6_0"}, {position: "3_9"}, {position: "13_4"}]
                },
                {
                    //level 9
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 10
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 11
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 12
                    won: false,
                    box: [{position: "12_4", hitCount: 0},{position: "11_4", deathBox: true}, {position: "11_3", hitCount: 0}, {position: "4_2", hitCount: 1}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "9_7", hitCount: 0}, {position: "11_7", hitCount: 0}],
                    laser: [{position: "0_0", disappear: true}, {position: "1_9", disappear: false}, {position: "11_9", disappear: false}]
                },
                {
                    //level 13
                    won: false,
                    box: [{position: "3_4", hitCount: 0}, {position: "4_5", hitCount: 1}, {position: "3_7", hitCount: 0}, {position: "7_3", hitCount: 0, deathBox: true}, {position: "5_2", hitCount: 0, deathBox: true}, {position: "6_3", hitCount: 2}, {position: "8_2", hitCount: 0}, {position: "8_4", hitCount: 0} ],
                    laser: [{position: "0_9"}, {position: "0_0"}, {position: "0_3", disappear: true}, {position: "13_6"}, {position: "13_3", disappear: true}]
                },
                {
                    //level 14
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 15
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 16
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 17
                    won: false,
                    box: [{position: "1_2", deathBox: true}, {position: "12_8", deathBox: true}, {position: "11_8", hitCount: 0}, {position: "2_2", hitCount: 0}, {position: "1_3", hitCount: 1}, {position: "1_1", hitCount: 2}, {position: "6_3", hitCount: 0}, {position: "8_8", hitCount: 0}, {position: "7_8", hitCount: 0}, {position: "7_2", hitCount: 0}],
                    laser: [{position: "0_0", disappear: true}, {position: "1_9"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 18
                    won: false,
                    box: [{position: "2_8", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0, deathBox: true}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0", disappear: true}, {position: "6_0", disappear: true}, {position: "3_9", disappear: true}, {position: "13_7", disappear: true}]
                },
                {
                    //level 19
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 20
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 21
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 22
                    won: false,
                    box: [{position: "3_2", deathBox:true}, {position: "4_2", hitCount: 0}, {position: "6_1", hitCount: 0}, {position: "3_7", hitCount: 1}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 1}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4", disappear: true}, {position: "7_0", disappear: true}, {position: "0_9", disappear: true}, {position: "13_7", disappear: true}]
                },
                {
                    //level 23
                    won: false,
                    box: [{position: "2_2", hitCount: 1}, {position: "4_2", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "6_4", hitCount: 0, deathBox: true}, {position: "5_3", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "6_3", hitCount: 0, deathCount: true}, {position: "6_5", hitCount: 2}, {position: "7_7", hitCount: 2}, {position: "8_3", hitCount: 2}, {position: "8_2", hitCount: 0}],
                    laser: [{position: "0_1", disappear: true}, {position: "0_4", disappear: true}, {position: "0_9", disappear: true}, {position: "3_0", disappear: true}, {position: "5_0", disappear: true}, {position: "3_9", disappear: true}, {position: "4_9", disappear: true}, {position: "6_9", disappear: true}, {position: "12_9", disappear: true}, {position: "13_1", disappear: true}, {position: "13_7", disappear: true}]
                },
                {
                    //level 24
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 25
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 26
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0"}, {position: "6_0"}, {position: "3_9"}, {position: "13_7"}]
                },
                {
                    //level 27
                    won: false,
                    box: [{position: "2_4", hitCount: 2}, {deathBox: true, position: "6_6", hitCount: 0}, {deathBox: true, position: "6_2", hitCount: 0}, {position: "8_7", hitCount: 1}, {position: "7_7", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "1_6", hitCount: 1}, {position: "2_6", hitCount: 0}, {position: "3_6", hitCount: 0}, {position: "4_6", hitCount: 0}],
                    laser: [{position: "0_0", disappear: true}, {position: "6_0"}, {position: "3_9", disappear: true}, {position: "13_7"}]
                },
                {
                    //level 28
                    won: false,
                    box: [{position: "1_4", hitCount: 1}, {position: "2_2", hitCount: 2}, {position: "2_7", hitCount: 2}, {position: "3_7", hitCount: 2}, {position: "4_2", hitCount: 0}, {position: "5_4", hitCount: 1, deathBox: true}, {position: "5_6", hitCount: 0}, {position: "6_5", hitCount: 0, deathBox: true}, {position: "7_3", hitCount: 1}, {position: "7_5", hitCount: 1, deathBox: true}, {position: "8_6", hitCount: 2}, {position: "8_5", hitCount: 0, deathBox: true}, {position: "9_2", hitCount: 0}, {position: "9_4", hitCount: 0, deathBox: true}, {position: "11_6", hitCount: 0}, {position: "12_5", hitCount: 0}],
                    laser: [{position: "0_4", disappear: true}, {position: "7_0", disappear: true}, {position: "0_9", disappear: true}, {position: "13_6", disappear: true}, {position: "13_7", disappear: true}, {position: "5_0", disappear: true}, {position: "0_3", disappear: true}, {position: "13_2", disappear: true}]
                },
                {
                    //level 29
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                },
                {
                    //level 30
                    won: false,
                    box: [{position: "4_2", hitCount: 0}, {position: "6_2", hitCount: 0}, {position: "5_2", hitCount: 0}, {position: "7_2", hitCount: 0}, {position: "8_2", hitCount: 0}, {position: "9_2", hitCount: 0}, {position: "6_4", hitCount: 0}, {position: "7_3", hitCount: 0}, {position: "5_3", hitCount: 0}, {position: "4_7", hitCount: 0}, {position: "5_7", hitCount: 0}, {position: "6_7", hitCount: 0}, {position: "7_7", hitCount: 0}, {position: "8_7", hitCount: 0}, {position: "9_7", hitCount: 0}],
                    laser: [{position: "0_4"}, {position: "7_0"}, {position: "0_9"}, {position: "13_7"}]
                }
            ]
};



function touchHandler(event) //needed for iPhone touch events
{
    var touches = event.changedTouches,
            first = touches[0],
            type = "";

    switch (event.type)
    {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init()
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
};
