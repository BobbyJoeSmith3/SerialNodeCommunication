

// --------------------------------------------------------------------
// Example NewPing library sketch that does a ping 20 times per second
// --------------------------------------------------------------------
// include the library code
#include <NewPing.h>

#define TRIGGER_PIN 2 // Arduino pin tied to trigger pin on ultrasonic sensor
#define ECHO_PIN 3 // Arduino pin tied to echo pin on ultrasonic sensor
#define MAX_DISTANCE 400 // Max sensor distance rated at 400-500cm
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); // (Pins, Max Dist)
int previous_distance = 20;
void setup() {
  Serial.begin(115200); // Open serial monitor at 115200 baud to see ping results
}

void loop() {
  // Implement handshaking between arduino and serial port
  // If arduino receives a response in the serial monitor, make a sensor reading
  if (Serial.available()) {
    char input = Serial.read(); // clear byte from serial monitor
    unsigned int uS = sonar.ping(); // Send ping, get ping time in microseconds (uS)
    // Convert ping time to distance in cm & print result (0 = outside set distance range)
    int current_distance = uS / US_ROUNDTRIP_CM;
    // Prevent the sending of readings outside of the range
    if (current_distance != 0) {
      printDist(current_distance);
      previous_distance = current_distance;
    } else {
      printDist(previous_distance);
    }
    // Wait 50ms between bings (about 20 pings/sec). 29ms should be shortest delay between pings
    // delay inbetween reads for stability
    delay(100);
  }
}

void printDist(int distance) {
//  Serial.print("Ping: ");
//  Serial.print(distance); 
//  Serial.println("cm");
  Serial.println(distance);
}

