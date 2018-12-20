/*
 * Copyright (c) 2018 Shaven Primates
 *
 * Ribbon potentiometer Bluetooth handler
 */

#include <SimbleeBLE.h>

// flag used to start sending
int flag = false;
int led = 13;
int pot1 = 3;
int pot1Val = -1;
int pot2 = 5;
int pot2Val = -1;

void setup() {
  pinMode(led, OUTPUT);
//  pinMode(pot1, INPUT);
  SimbleeBLE.deviceName = "marktest";
  SimbleeBLE.advertisementData = "-data";
  
  // change the advertisement interval
  SimbleeBLE.advertisementInterval = 50;
  Serial.begin(9600);
  Serial.println("Welcome to Simblee!");
  SimbleeBLE.begin();
}

void SimbleeBLE_onConnect() {
  flag = true;
  Serial.println("Connecting...");
  // first send is not possible until the iPhone completes service/characteristic discovery
}

void SimbleeBLE_onDisconnect() {
  flag = false;
}

void loop() {
  // switch to lower power mode
//  Simblee_ULPDelay(INFINITE);
  while (SimbleeBLE.radioActive)
    ;
  if (!flag) return;
  
  int newPot1Val = analogRead(pot1);
  if (newPot1Val > 10 && newPot1Val != pot1Val) {
    Serial.println("pot1");
    Serial.println(newPot1Val);
    SimbleeBLE.sendInt(newPot1Val);
    pot1Val = newPot1Val;
  }
  int newPot2Val = analogRead(pot2);
  if (newPot2Val > 10 && newPot2Val != pot2Val) {
    Serial.println("pot2");
    Serial.println(newPot2Val);
    SimbleeBLE.sendInt(1024 + newPot2Val); // if > 1024 then it's the right hand side controller
    pot2Val = newPot2Val;
  }
  delay(40);
}

void SimbleeBLE_onAdvertisement(bool start) {
  // turn the green led on if we start advertisement, and turn it
  // off if we stop advertisement
  
  if (start)
    digitalWrite(led, HIGH);
  else
    digitalWrite(led, LOW);
}
