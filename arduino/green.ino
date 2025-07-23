#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <DHT.h>
#include <ESP32Servo.h> 
#include <ArduinoJson.h> // For JSON parsing and creation

// WiFi Credentials
const char* ssid = "OPPO A17";       // REPLACE WITH YOUR WIFI SSID
const char* password = "1234qwer"; // REPLACE WITH YOUR WIFI PASSWORD

// Backend Server IP and Port
const char* backendHost = "196.96.168.5"; 
const int backendPort = 5000;
const char* controlEndpoint = "/control"; // For sending actuator commands to Node.js
const char* dataEndpoint = "/data";       // A dummy endpoint if you want to push data via HTTP POST


// Sensor Pin Definitions 
#define DHTPIN 5        
#define DHTTYPE DHT11    
#define LDRPIN 23        // Analog pin for LDR
#define SOILMOISTURE_DIGITAL_PIN 2 // GPIO13 (Digital Soil Moisture Sensor Output - HIGH/LOW)
#define ULTRASONIC_TRIG_PIN 33 // GPIO0 for Ultrasonic Trig
#define ULTRASONIC_ECHO_PIN 32 // GPIO2 for Ultrasonic Echo (Requires voltage divider if 5V)

// Actuator Pin Definitions (connected to Relay IN pins, GPIO numbers)
#define FAN_PIN 4       // GPIO14 for Fan Relay
#define BULB_PIN 22      // GPIO12 for Bulb Relay
#define PUMP_PIN 18      // GPIO15 for Pump Relay
#define SERVO_PIN 13     // GPIO5 for Servo Motor

// Thresholds 
#define TEMPERATURE_THRESHOLD 28.0 // Celsius. Fan turns on if temperature > this
#define LDR_THRESHOLD 500      // Lower value means more light. Bulb turns on if LDR reading < this (meaning it's dark)
#define SOIL_MOISTURE_DRY_THRESHOLD HIGH // Digital sensor. Pump turns on if soil moisture is HIGH (dry)
#define WATER_LEVEL_HIGH_THRESHOLD 10 // cm. Servo opens tap if water level <= this (meaning water level is high)

// Create sensor and actuator objects
DHT dht(DHTPIN, DHTTYPE);
Servo myservo;

// Variables to store sensor readings
float temperature = 0.0;
float humidity = 0.0;
int ldrValue = 0;
bool soilMoistureDigitalState = false; // true if dry (HIGH), false if wet (LOW)
long waterLevelDistance = 0;

// Variables to store actuator states (for manual control, initialized based on automatic)
bool fanState = false;
bool bulbState = false;
bool pumpState = false;
bool servoState = false; // true for open (90 deg), false for closed (0 deg)

// Timers for non-blocking operations
unsigned long lastSensorRead = 0;
const long sensorReadInterval = 5000; // Read sensors and send data every 5 seconds

unsigned long lastActuatorCommandCheck = 0;
const long actuatorCommandCheckInterval = 1000; // Check for pending commands from backend (not strictly needed with push, but good for heartbeat)

void setup() {
  Serial.begin(115200); // Higher baud rate for ESP8266 debugging
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  dht.begin();
  myservo.attach(SERVO_PIN);
  myservo.write(0); // Ensure servo starts in closed position

  // Initialize actuator pins as OUTPUT and turn them off
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW); // LOW typically activates NO relay
  pinMode(BULB_PIN, OUTPUT);
  digitalWrite(BULB_PIN, LOW);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);

  // Initialize digital soil moisture pin
  pinMode(SOILMOISTURE_DIGITAL_PIN, INPUT); // Or INPUT_PULLUP if needed

  // Initialize Ultrasonic Sensor pins
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);

  Serial.println("ESP8266 Smart Farm Ready");
}

void loop() {
  unsigned long currentMillis = millis();

  // -------------------- 1. Read Sensors Periodically and Send Data --------------------
  if (currentMillis - lastSensorRead >= sensorReadInterval) {
    lastSensorRead = currentMillis;
    readSensors();
    sendSensorDataToBackend(); // Send data via HTTP POST
  }

  // -------------------- 2. Automatic Control Logic (if not manually overridden) --------------------
  // Temperature and Fan
  if (!fanState) { // Only automatic control if not manually turned ON
    if (temperature > TEMPERATURE_THRESHOLD) {
      digitalWrite(FAN_PIN, HIGH); // Turn fan ON (assuming HIGH activates relay)
    } else {
      digitalWrite(FAN_PIN, LOW); // Turn fan OFF
    }
  }

  // Light and Bulb
  if (!bulbState) { // Only automatic control if not manually turned ON
    if (ldrValue < LDR_THRESHOLD) { // If it's dark
      digitalWrite(BULB_PIN, HIGH); // Turn bulb ON
    } else {
      digitalWrite(BULB_PIN, LOW); // Turn bulb OFF
    }
  }

  // Soil Moisture and Pump
  if (!pumpState) { // Only automatic control if not manually turned ON
    if (soilMoistureDigitalState == SOIL_MOISTURE_DRY_THRESHOLD) { // If soil is dry (digital sensor output HIGH)
      digitalWrite(PUMP_PIN, HIGH); // Turn pump ON
    } else {
      digitalWrite(PUMP_PIN, LOW); // Turn pump OFF
    }
  }

  // Water Level and Servo
  if (!servoState) { // Only automatic control if not manually opened
    // Note: Ultrasonic sensor measures distance. A low distance means high water level.
    if (waterLevelDistance <= WATER_LEVEL_HIGH_THRESHOLD && waterLevelDistance > 0) { // If water level is high (and valid reading)
      myservo.write(90); // Open tap
    } else {
      myservo.write(0); // Close tap
    }
  }

  if (currentMillis - lastActuatorCommandCheck >= actuatorCommandCheckInterval) {
    lastActuatorCommandCheck = currentMillis;
    fetchActuatorCommandsFromBackend();
  }
} //end loop

void readSensors() {
  // Read Temperature and Humidity
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    temperature = 0.0; // Reset to avoid sending invalid data
    humidity = 0.0;
  }

  // Read LDR
  ldrValue = analogRead(LDRPIN); // ESP8266 A0 is 0-1023 (or 0-4095 for ESP32)

  // Read Digital Soil Moisture
  soilMoistureDigitalState = digitalRead(SOILMOISTURE_DIGITAL_PIN); // HIGH (dry) or LOW (wet)

  // Read Ultrasonic Sensor (Water Level)
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000); // 30ms timeout for better robustness
  if (duration == 0) { // Timeout occurred, no echo
    waterLevelDistance = -1; // Indicate invalid reading
    Serial.println("Ultrasonic timeout / no object detected");
  } else {
    waterLevelDistance = duration * 0.034 / 2; // Convert to cm
  }
}

void sendSensorDataToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot send data.");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  // Build the URL for the POST request
  String serverPath = "http://" + String(backendHost) + ":" + String(backendPort) + dataEndpoint;

  Serial.print("Sending data to: ");
  Serial.println(serverPath);

  // Create JSON document
  StaticJsonDocument<256> doc; // Adjust size as needed

  doc["temp"] = temperature;
  doc["hum"] = humidity;
  doc["ldr"] = ldrValue;
  doc["soil"] = soilMoistureDigitalState ? 1 : 0; // 1 for dry, 0 for wet
  doc["water"] = waterLevelDistance;
  doc["fan"] = digitalRead(FAN_PIN) == HIGH ? 1 : 0;
  doc["bulb"] = digitalRead(BULB_PIN) == HIGH ? 1 : 0;
  doc["pump"] = digitalRead(PUMP_PIN) == HIGH ? 1 : 0;
  doc["servo"] = myservo.read() == 90 ? 1 : 0; // 1 if open (90), 0 if closed (0)

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.print("Request Body: ");
  Serial.println(requestBody);

  http.begin(client, serverPath);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] POST... code: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}


// Function to fetch actuator commands from Node.js backend
// Node.js backend will need an endpoint like /get-commands that returns a JSON object
// indicating the desired state for each actuator.
// This is a simplified polling approach. MQTT is much better for real-time.
void fetchActuatorCommandsFromBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot fetch commands.");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  String serverPath = "http://" + String(backendHost) + ":" + String(backendPort) + "/commands"; // Node.js needs to implement this endpoint

  Serial.print("Fetching commands from: ");
  Serial.println(serverPath);

  http.begin(client, serverPath);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] GET... code: %d\n", httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);

    // Parse JSON response for commands
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      return;
    }

    // Update actuator states based on received commands
    if (doc.containsKey("fan")) {
      bool newState = doc["fan"];
      if (newState) {
        digitalWrite(FAN_PIN, HIGH);
        fanState = true;
      } else {
        digitalWrite(FAN_PIN, LOW);
        fanState = false;
      }
      Serial.printf("Fan updated to: %s (manual override: %s)\n", newState ? "ON" : "OFF", fanState ? "TRUE" : "FALSE");
    }
    if (doc.containsKey("bulb")) {
      bool newState = doc["bulb"];
      if (newState) {
        digitalWrite(BULB_PIN, HIGH);
        bulbState = true;
      } else {
        digitalWrite(BULB_PIN, LOW);
        bulbState = false;
      }
      Serial.printf("Bulb updated to: %s (manual override: %s)\n", newState ? "ON" : "OFF", bulbState ? "TRUE" : "FALSE");
    }
    if (doc.containsKey("pump")) {
      bool newState = doc["pump"];
      if (newState) {
        digitalWrite(PUMP_PIN, HIGH);
        pumpState = true;
      } else {
        digitalWrite(PUMP_PIN, LOW);
        pumpState = false;
      }
      Serial.printf("Pump updated to: %s (manual override: %s)\n", newState ? "ON" : "OFF", pumpState ? "TRUE" : "FALSE");
    }
    if (doc.containsKey("tap")) {
      bool newState = doc["tap"];
      if (newState) {
        myservo.write(90);
        servoState = true;
      } else {
        myservo.write(0);
        servoState = false;
      }
   Serial.printf("Tap updated to: %s (manual override: %s)\n", newState ? "OPEN" : "CLOSED", servoState ? "TRUE" : "FALSE");
    }

  } else {
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

http.end();
}