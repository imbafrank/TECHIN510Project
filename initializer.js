var isLoggedIn = false;
var speakDetected;
var detectAction;
const config = {
  apiKey: "AIzaSyAajqba7RHuLAS99GXR7GSNcXNZ77tBJys",
  authDomain: "lab9-dd235.firebaseapp.com",
  databaseURL: "https://lab9-dd235-default-rtdb.firebaseio.com",
  projectId: "lab9-dd235",
  storageBucket: "lab9-dd235.appspot.com",
  messagingSenderId: "489036585303",
  appId: "1:489036585303:web:2236b14f7c8452ecefc612",
  measurementId: "G-83BXMB0T6B"
};

function handleLoginError(error) {
  console.log("error.code:" + error.code);
  console.log("error.message:" + error.message);
}

function handleAuthSuccess(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    isLoggedIn = true;
    console.log("Now logged in as " + uid);
  }
}

function handleButtonClick() {
  if (isLoggedIn) {
    var dbRef = firebase.database().ref("/userinput");
    var data = {};
    var textBox = document.getElementById("speakText");
    data["say"] = textBox.value;
    dbRef.update(data);
    console.log("Sent data to database: " + data.say);
  } else console.log("You are not logged in.");
}

var detectspeech = 1;
var recognition = new webkitSpeechRecognition();
$(document).ready(function () {
  firebase.initializeApp(config);
  firebase.auth().signInAnonymously().catch(handleLoginError);
  firebase.auth().onAuthStateChanged(handleAuthSuccess);

  var dbRef = firebase.database().ref("/ret/");
  dbRef.on("value", newValueChange);

  function newValueChange(snapshot) {
    ret = snapshot.val();
    if (ret) {
      if (ret.isRule) {
        // $('#input-display2').html
        $("<span />")
          .html(
            "<br><b>If</b> " +
              ret.if +
              ", <b>then</b> " +
              ret.then +
              "<br><b>New Rule</b> -- " +
              "<b>Trigger: </b>" +
              ret.trigger +
              " <b>Action: </b>" +
              ret.action +
              "<br>"
          )
          .appendTo($("#input-display2"));
      } else if (ret.action != "") {
        $("<span />")
          .html(
            "<br><b>Do</b> " +
              ret.then +
              "<br><b>New Command</b> -- " +
              " <b>Action: </b>" +
              ret.action +
              "<br>"
          )
          .appendTo($("#input-display2"));
      } else {
        $("<span />")
          .html("<br><b>Can't recognize</b> -- " + ret.then + "<br>")
          .appendTo($("#input-display2"));
      }

      if (ret.trigger == "DETECTED") {
        console.log("detectvideo");
        $("<div />")
          .attr("id", "cam")
          .html(
            '<canvas id="mainCanvas" height=240 width=320></canvas>   <video id="myVideo"  width="320" height="240" autoplay="true" hidden></video>'
          )
          .appendTo($("#input-display2"));
        startVideo();
      }

      if (ret.action == "ALARM") {
        if (ret.trigger == "DETECTED" && ret.aSenti) {
        console.log("alarm when detected");

          detectAction = "ALARM"
        }
        else if (ret.trigger == "" && ret.aSenti){
          console.log("alarm");
          document.getElementById("alarm").play();
        }
      } 
      
      else if (ret.action == "GREETING") {
        console.log("greetings"); 
        // $('body').css('background-color', '#bdbaba');

      }

      else if (ret.action == "LIGHT" || ret.action == "DARK") {
        console.log("light");
        if (ret.aSenti == (ret.action == "LIGHT")) {
          // light mode
          console.log("L")
          $("#dark-bg").css("visibility", "hidden");
          $('body').css('color', '#fffede');
          // $('#input-display2').css('background-color', '#75907d');
          $('span b').css('color', '#53c757');
        
        } else {
          // dark mode
          console.log("D")
          $("#dark-bg").css("visibility", "visible");
          $('body').css('color', '#ffffff');
          // $('#input-display2').css('background-color', '#091621');
          $('span b').css('color', '#ff8e02');

        }

      }
      
      else if (ret.action == "SPEAK") {
        console.log(ret.specAction);
        if (ret.trigger == ""){

          speak(ret.specAction);
        }
        if (ret.trigger == "DETECTED"){
          if (ret.specAction != "") {
            speakDetected = ret.specAction
          }
          
        }
      }
    }
  }

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en";

  recognition.onresult = function (e) {
    // console.log(e);
    if (detectspeech) {
      $("#input-display").html("");
      for (i = 0; i < e.results.length; i++) {
        for (j = 0; j < e.results[i].length; j++) {
          $("<span />")
            .text(e.results[i][j].transcript)
            .addClass(e.results[i].isFinal ? "sure" : "guess")
            .appendTo($("#input-display"));
        }

        if (e.results[e.results.length - 1].isFinal) {
          // Process only final messages
          message = e.results[e.results.length - 1][0].transcript;
          console.log(message);
          console.log(e.results[e.results.length - 1]);
          if (isLoggedIn) {
            var dbRef = firebase.database().ref("/");
            var data = {};
            // var textBox = document.getElementById("input-display");
            // console.log(textBox);
            data["userinput"] = message;
            dbRef.update(data);
            console.log("Sent data to database: " + data.userinput);
            // $('#input-display').text("")
          } else console.log("You are not logged in.");
        }
      }
      if (e.results[e.results.length - 1].isFinal) {
        recognition.stop();
        detectspeech = 0;
        $("#siri_btn").attr("src", "images/siribtnslow.gif");
        siriWave.stop()

      }
    }
  };

  recognition.onerror = function (e) {
    console.log("error!");
    console.log(e);
    recognition.start();
  };

  recognition.onend = function () {
    console.log("restarting");
  };

  recognition.start();
});







// siriwave
var siriWave = new SiriWave({
  container: document.getElementById("siri-container"),
  width: 640,
  height: 200,
  amplitude: 1.5,
  style: "ios9"
});


$("#siri_btn").click(function () {
  if (detectspeech == 0) {
    $(this).attr("src", "images/siribtn2.gif");
    siriWave.start()
    // $("#siri-container").css("visibility", "visible");
    recognition.start();
  } else {
    $(this).attr("src", "images/siribtnslow.gif");
    siriWave.stop()

    // $("#siri-container").css("visibility", "hidden");
    recognition.stop();
  }
  detectspeech = 1 - detectspeech;
});











/*Function that handles click on the first button*/

/*Function that makes the browser speak a text in a given language*/
function speak(text) {
  lang = "en-US";
  /*Check that your browser supports text to speech*/
  if ("speechSynthesis" in window) {
    const msg = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log("Your browser supports " + voices.length + " voices");
      console.log(voices);
      msg.voice = voices.filter(function (voice) {
        return voice.lang == lang;
      })[1];
    }
    msg.voiceURI = "native";
    msg.volume = 0.8; // 0 to 1
    msg.rate = 0.6; // 0.1 to 10
    msg.pitch = 0.6; //0 to 2
    msg.text = text;
    msg.lang = lang;
    msg.onend = function (e) {
      console.log("Finished in " + e.elapsedTime + " milliseconds.");
    };
    speechSynthesis.speak(msg);
  }
}

/* Detection:


/* This function checks and sets up the camera */
function startVideo() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(handleUserMediaSuccess)
      .catch(handleUserMediaError);
  }
}

function handleUserMediaError(error) {
  console.log(error);
}

function handleUserMediaSuccess(stream) {
  var video = document.getElementById("myVideo");
  video.srcObject = stream;
  // video.play();
  console.log("success");
  window.setInterval(captureImageFromVideo, 200);
}

// The variable that holds the detected face information, which will be updated through Firebase callbacks
var detection = null;
var last = 0;
// Register a callback for when a detection is updated in the database
var dbRef = firebase.database().ref("/detection/");
dbRef.on("value", newFaceDetected);

function newFaceDetected(snapshot) {
  detection = snapshot.val();
}

function captureImageFromVideo() {
  const canvas = document.getElementById("mainCanvas");
  const context = canvas.getContext("2d");

  const video = document.getElementById("myVideo");
  canvas.setAttribute("width", video.width);
  canvas.setAttribute("height", video.height);
  // Draw video image onto Canvas
  context.drawImage(video, 0, 0, video.width, video.height);

  sendSnapshot();

  //var dataObj = context.getImageData(0, 0, canvas.width, canvas.height);
  // If a face detection has been received from the database, draw a rectangle around it on Canvas

  if (detection) {
    const face = detection[0];
    context.beginPath();
    context.moveTo(face.x, face.y);
    context.lineTo(face.x + face.w, face.y);
    context.lineTo(face.x + face.w, face.y + face.h);
    context.lineTo(face.x, face.y + face.h);
    context.lineTo(face.x, face.y);
    context.lineWidth = 5;
    context.strokeStyle = "#0F0";
    context.fillStyle = "#0F0";
    context.stroke();
    if (last ==0){
      if (speakDetected){
        speak(speakDetected);

      }
      if (detectAction == "ALARM") {
        alarmSound();
      }
    }
    last = 1
  }else{
    last = 0
  }
}

function storeImage(imgContent) {
  // store this at a particular place in our database
  var dbRef = firebase.database().ref("/");
  dbRef.update({ image: imgContent });
}

function sendSnapshot() {
  const canvas = document.getElementById("mainCanvas");
  // Convert the image into a a URL string with built0-in canvas function
  const data = canvas.toDataURL();

  const commaIndex = data.indexOf(",");

  const imgString = data.substring(commaIndex + 1, data.length);
  storeImage(imgString);
}

function alarmSound() {
  document.getElementById("alarm").play();
}