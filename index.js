// guide: https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-communication-with-node-js/

/*
NOTE: The process of using a serialport library will be the same every time:
- initialize the serialport library
- open the serial port
- set up the callback functions and lthe them do the rest
*/

/*
NOTE: To open a serial port in node, ou include the library at the beginning of your script, and make a local instance fo the library in a variable.
*/

var SerialPort = require('serialport'); // include the library
var WebSocketServer = require('ws').Server; // include websocket library
var portName = process.argv[2]; // get port name from the command line

// open up port using new()
var myPort = new SerialPort(portName, {
  baudRate: 115200,
  options: false
});


var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
var parser = new Readline("\r\n"); // make a new parser object to read ASCII lines
myPort.pipe(parser); // pipe the serial stream to the parser

/*
NOTE: The serial port library is event-based. When the program is running, the operating system and the user's actions will generate events and the program will provide functions to deal with those events called callback functions.

The main events that the serial library will deal with are when a serial port opens, when it closes, when new data arrives, and when there’s an error. The data event performs the same function as Processing's serialEvent() function. ONce you've made an instance of the serialport library using the new() function, you define what functions will get called when each event occurs by using serialport.on(). If the event generates any parameters (for example a new data event will ahve the data as a parameter), those parameters will get passed to the callback function.
*/
myPort.on('open', showPortOpen);
myPort.on('close', showPortClosed);
myPort.on('error', showError);
parser.on('data', readSerialData); // using parser object instead of serialport object

/*
NOTE: Listening for the data event using a function from the parser object (parser.on(‘data’,readSerialData);) because while you can listen for data events with the serialport object (myPort.on(‘data’,readSerialData);), the serialport object listener function generates a data event once every byte, whereas the parser object lets you generate a data event once every newline.
*/

// Callback functions
function showPortOpen() {
  console.log('Port open. Data rate: ' + myPort.baudRate);
}
function showPortClosed() {
  console.log('port closed.');
}
function showError() {
  console.log('Serial port error: ' + error);
}
function readSerialData(data) {
  console.log(data);
  // Send the latest data to all available webSocket clients
  if (connections.length > 0) { // if there are webSocket connections
    broadcast(data); // send the serial data to all of them
  }
}

/*
NOTE: To send serial output from node.js to the Arduino, use the serialport write() function like so:
myPort.write("Hello");
*/
// Need to modify serialport data event listener to send data to the webSocket, and vice versa.
// Function to send webSocket data to the serialport:
function sendToSerial(data) {
  console.log("Sending to serial: " + data);
  myPort.write(data);
}


/*
NOTE: Server will operate on port 8081. Client side JavaScript programs will connect to that port number. The browser will be a client of the node.js script, and the script will be running as a server. Just as there are serialport event listener functions, there will be webSocket event listener functions too. Listen for a webSocket connection event. Once connected, listen for incoming messages and for webSocket to close.
*/

/*
NOTE: To get multiple data inputs from multiple sensors, need to send data via serial as ASCII-encoded text. To read serial data as ASCII-encoded text, need to create a parser to tell the serial library how to interpret data, and generate a new data event when it sees a new line ("\n"). The parser is operating the same way as Processing's Serial.bufferUntil() function.

There can be multiple webSocket clients at one time, so the server maintains an array to keep track of all the clients. That array is called "connections," and every time a new client connects, the client is added to the array using the .push() function. When a client closes, it's removed from the array using the .slice() function.
*/

// create instance of WebSocketServer
var SERVER_PORT = 8081; // port number for the webSocket Server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket Server
var connections = new Array; // list of connections to the server

// webSocket event listeners
wss.on('connection', handleConnection);

function handleConnection(client) {
  console.log("New Connection"); // you have a new client
  connections.push(client); // add this client to the connections array

  client.on('message', sendToSerial); // when a client sends a message
  client.on('close', function() { // when a client closes its connection
    console.log("Connection Closed"); // print it out
    var position = connections.indexOf(client); // get the client's position in Array
    connections.splice(position, 1); // and delete it from array
  });
}

// Function to send serial data to the webSocket clients:
function broadcast(data) {
  for (myConnection in connections) { // iterate over the array of connections
    connections[myConnection].send(data); // send data to each connection
  }
}
