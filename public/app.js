// shim
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// connect
var socket = io.connect();
var dirty = false;
var data = {players: {}};

var getScreenshot = function (callback, numFrames, interval, progressCallback) {
  if (videoShooter) {                                                         
    videoShooter.getShot(callback, numFrames, interval, progressCallback);    
  } else {                                                                    
    callback('');                                                             
  }                                                                           
}; 

var gumHelper = GumHelper;
gumHelper.startVideoStreaming(function callback(err, stream, videoElement) {
  if (err) {
    throw err
  } else {
    videoElement.width = 135;
    videoElement.height = 101;
    document.body.appendChild(videoElement);
    videoElement.play();
    videoShooter = new VideoShooter(videoElement);
  }
});

window.socket = socket;

var context = a.getContext('2d');
context.fillStyle = '#333';

socket.on('message', function (newData) {
  dirty = true;
  newData.forEach(function (datum) {
    setPath(datum.key, datum.value, data);
  });
});

function setPath (path, value, obj) {
  path = path.split('.');
  var segment;
  while (path.length > 1 && (segment = path.shift())) {
    obj = obj[segment] || (obj[segment] = {});
  }
  obj[path[0]] = value;
}

function render () {
  if (dirty) {
    dirty = false;
    a.width = a.width;
    var players = Object.keys(data.players).forEach(function (id) {
      var player = data.players[id];
      context.fillRect(player.x, player.y, 50, 50);
    });
  }
  requestAnimationFrame(render);
}

render();
