var c = 0;
var aiPos = 0;

var walls = 0;
var avoided = 0;
var crash = 0;

var tickInterval;

var lastWallCount = 0;
var lastAvoided = 0;
var lastCrash = 0;
var tryzone = 0;

var cars = ['blue-car.png', 'gray-car.png', 'lightgreen-car.png', 'pink-car.png', 'race-car.png', 'red-car.png'];

$(function () {
  var ran = Math.floor(Math.random() * cars.length);
  var carHolder = $('#ai');
  var img = "images/" + cars[ran];
  if (img == 'images/blue-car.png' || img == 'images/gray-car.png') {
    carHolder.css('background-position-y', '-10px');
  }
  carHolder.css('background-image', 'url(' + img + ')')
})

function tick() {
  c++;
  //getByID('stepsDone').value = c;
  moveWall(); //move wall to the left
  checkCollision();
  experience();
}

function runSim(state) {
  if (state == 1) //run simulation
  {
    if (c > 100) {
      runSim('0'); //force stop
    } else {
      tickInterval = setInterval("tick();", 20);
    }

  } else {
    //stop simulation
    clearInterval(tickInterval);
    c = 0;
    //getByID('stepsDone').value = c;
    getByID('wall').style.left = null;
    getByID('wall').style.right = '0px';
    getByID('ai').style.marginTop = "50px";
    aiPos = 0;
    walls = 0;
    crash = 0;
    avoided = 0;
  }
}

function moveWall() {
  var getWallX = getByID('wall').offsetLeft;
  var getWallY = getByID('wall').offsetTop;

  var getAIX = getByID('sensor_2').offsetLeft + 500;
  var getAIY = getByID('ai').offsetTop;

  var successRate = (avoided / (avoided + crash) * 100);

  getByID('avoided').innerHTML = parseInt(avoided);
  getByID('crash').innerHTML = parseInt(crash);
  getByID('successRate').innerHTML = successRate;

  if (getWallX <= 0) {
    walls++;
  } else {
    getWallX = getWallX - 40;
    getByID('wall').style.left = getWallX + 'px';
  }

}

function moveCar(direction) {
  //auto correct
  if (aiPos < 50) {
    aiPos = 50;
  }
  if (aiPos > 200) {
    aiPos = 200;
  }

  if (direction == 'down') {
    aiPos = aiPos + 10;
  } else {
    aiPos = aiPos - 10;
  }

  getByID('ai').style.marginTop = aiPos + "px";
}

function checkCollision() {
  var getWallX = getByID('wall').offsetLeft;
  var getAIX = getByID('sensor_2').offsetLeft + 500;

  var getWallY = getByID('wall').offsetTop + 100;
  var getAIY = getByID('ai').offsetTop;

  if (getWallX < getAIX && getAIY >= getWallY - 100 && getAIY < getWallY || getWallX < getAIX && getWallY - 100 > getAIY && getWallY - 100 < getAIY + 50) {
    //moveCar('down');        	 
    //getByID('sensor_2').style.backgroundColor = 'red';
    //decide if the car was hit
    if (getWallX < 100) {
      crash = crash + .25;
    }
  } else {
    //getByID('sensor_2').style.backgroundColor = 'white';
    if (getWallX < 100) {
      avoided = avoided + .25;
    }
  }
}

function experience() {
  var aizone;
  var wallzone;

  //get wall and ai zone
  var getWallY = getByID('wall').offsetTop;
  var getAIY = getByID('ai').offsetTop;

  var getWallCenter = (getWallY - 100) + 50;

  if (getWallCenter <= 150) {
    //zone 0
    getByID('t_wall_zone').innerHTML = "0";
    wallzone = "0";
  } else {
    //zone 1
    getByID('t_wall_zone').innerHTML = "1";
    wallzone = "1";
  }

  var getAICenter = (getAIY - 100) + 25;

  if (getAICenter <= 150) {
    //zone 0
    getByID('t_ai_zone').innerHTML = "0";
    aizone = "0";
  } else {
    //zone 1
    getByID('t_ai_zone').innerHTML = "1";
    aizone = "1";
  }

  //trying
  //getByID('t_trying').innerHTML = tryzone;

  //read from experience 'database'
  var buildvar = aizone + wallzone + tryzone;
  var experienceDB = getByID('succ_' + buildvar).innerHTML;

  //read from 'DB' and decide
  if (tryzone == 0) {
    buildvarOther = aizone + wallzone + 1;
    experienceDBOther = getByID('succ_' + buildvarOther).innerHTML;
    if (parseInt(experienceDBOther) > parseInt(experienceDB) + parseInt(10)) {
      buildvar = buildvarOther;
      experienceDB = getByID('succ_' + buildvar).innerHTML;
      tryzone = 1;
    }
  }

  if (tryzone == 1) {
    buildvarOther = aizone + wallzone + 0;
    experienceDBOther = getByID('succ_' + buildvarOther).innerHTML;
    if (parseInt(experienceDBOther) > parseInt(experienceDB) + parseInt(10)) {
      buildvar = buildvarOther;
      experienceDB = getByID('succ_' + buildvar).innerHTML;
      tryzone = 0;
    }
  }

  //move AI
  tryzone == 0 ? moveCar('up') : moveCar('down');

  //update DB only when wall is leftmost
  if (lastWallCount != walls) {
    //do update
    if (lastAvoided != avoided) {
      experienceDB = parseInt(experienceDB) + parseInt(1);
      getByID('succ_' + buildvar).innerHTML = experienceDB;
      lastAvoided = avoided;
    }

    if (lastCrash != crash) {
      experienceDB = parseInt(experienceDB) - parseInt(1);
      getByID('succ_' + buildvar).innerHTML = experienceDB;
      lastCrash = crash;
    }

    lastWallCount = walls;
    tryzone = Math.floor(Math.random() * 2); //random between 0 and 1

    //randomize wall position
    var randomWallYPos = Math.floor(Math.random() * (200 + 1) + 0);
    getByID('wall').style.marginTop = randomWallYPos + "px";
    getByID('wall').style.left = null;
    getByID('wall').style.right = '0px';
  }
}

function getByID(id) {
  return document.getElementById(id);
}
