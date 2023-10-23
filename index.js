import {io} from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';
import { Home } from './screens/home.js';
import { Main } from './screens/main.js';
import { DataUser } from './screens/DataUser.js';
import {Scream} from './screens/scream.js'
import { Shake } from './screens/Shake.js';
import { Winner } from './screens/Winner.js';
import { Loser } from './screens/Loser.js';
import {Score} from './screens/Score.js'
import {WaitingPlayers} from './screens/waitingPlayers.js'


const app = p5 => {
  let home;
  let main;
  let dataUser;
  let waitingPlayers;
  let scream;
  let shake;
  let winner;
  let loser;
  let currentScreen;
  let socket; 
  let score; 
  let currentColor;
  let pressedFirst = false;  

  let playerData = {
    name: "",
    birthday: "",
    email: "",
    score: 0
};

  //Timer
  let startingTime = 60;// el timer empezara desde 60 segundos
  let lastUpdateTime = 0;
  let currentDisplayTime = startingTime; // Tiempo que se muestra actualmente 
  let timeStarted = false; //indica si el temporizador ya esta activo
  let timerVisible = false; // Controla la visibilidad del temporizador

  p5.setup = function() {
    p5.createCanvas(414, 896);
    
    socket = io.connect('http://localhost:3000');
    
    socket.on('two-players-connected', () => {
      console.log('Receive Two players connected, send go to main');
      
      if(currentScreen == waitingPlayers){
        currentScreen.hideInput();
        currentScreen = main;
        currentScreen.showInput();
      }
      
    });

    socket.on('color', (color) => {
        console.log("Received color:", color);
        currentColor = color;
    });

    socket.on('first-player-pressed', (user) => {
        console.log('I pressed the button first and earned points!');
        
    });
    
    socket.on('other-player-pressed', (item) => {
        console.log('Other player pressed the button first.');
    }); 
    
    home = new Home(p5);

    dataUser = new DataUser(p5);
    dataUser.setSubmitCallback((userData) => {
      console.log("Datos del usuario recibidos en index.js:", userData);
      playerData = userData

      currentScreen.hideInput();
      currentScreen = waitingPlayers; 
      currentScreen.showInput();
    });

    main = new Main(p5, socket, pressedFirst);

    waitingPlayers = new WaitingPlayers(p5);
    scream = new Scream(p5);
    shake = new Shake(p5);

    winner = new Winner(p5);
    winner.setNextCallback(() => {
      currentScreen.hideInput();
      currentScreen = score;
      currentScreen.showInput();
      console.log("Cambiado a score por clic en see results");
    });

    loser = new Loser(p5);
    loser.setNextCallback(() => {
      currentScreen.hideInput();
      currentScreen = score;
      currentScreen.showInput();
      console.log("Cambiado a score por clic en see results");
    });

    score = new Score(p5, playerData);
    score.setNextCallback(() => {
      currentScreen.hideInput();
      currentScreen = cupon;
      currentScreen.showInput();
      console.log("Cambiado a score por clic en see results");
    });

    currentScreen = main; 
    
    //Timer init
    lastUpdateTime = p5.millis(); // Inicializa el último tiempo de actualización

    if (typeof window.DeviceOrientationEvent !== 'undefined') { //evento de orientación
      window.addEventListener('deviceorientation', shake.handleShake, false);
    }


  
  }
  
  p5.draw = function() {
    p5.background(0);
    currentScreen.show(p5);

    if (currentScreen === main && !timeStarted) {
      // Inicia el temporizador cuando currentScreen sea igual a main y no se haya iniciado antes
      timeStarted = true;
      console.log("Comienza el temporizador");
      }

    // Timer function 
    if (timeStarted) {
      const currentTime = p5.millis();
             //Timer
             p5.fill(255, 230, 16);
             p5.ellipse(210, 65, 90);
             p5.textSize(35);
             p5.textStyle("BOLD");
             p5.stroke(10)
             p5.fill(0);
             const displayTime = p5.int(currentDisplayTime);
             p5.text(displayTime, 191, 77);
       
             //Score
             p5.textSize(28);//shake
             p5.fill(255);//shake
             p5.text(`Score: ${playerData.score}`, 150, 150);//shake

             //Instruction
             p5.textSize(20);
             p5.fill(255);
             p5.text(`Press the ${currentColor} button`, 100, 180);


      if (currentTime - lastUpdateTime >= 1000) {
        // Actualiza el contador de tiempo cada segundo
        if (currentDisplayTime > 0) {
          currentDisplayTime -= 1;
        } else {
          console.log("¡Tiempo agotado!");
          timerVisible = false; // Oculta el temporizador
          timeStarted = false; // Detiene el temporizador
          currentDisplayTime = 0; // Asegura que el tiempo sea 0
          currentScreen = winner;
        }
        lastUpdateTime = currentTime;
      }
    }

    
    if(currentScreen == score){
      //Score
      p5.textSize(45);
      p5.fill(255);
      p5.stroke(10, 250)
      p5.text(`${playerData.score}`, 160, 240);


      p5.textSize(30);
      p5.fill(250);
      p5.text(`${playerData.name}`, 140, 395);
    }

  
  }



  p5.mousePressed = function () {
    currentScreen.mousePressed(playerData, currentColor);
    pressedFirst = main.getPressedFirstStatus();

  }

}

new p5(app);


  

