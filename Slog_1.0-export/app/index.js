// This app records batched sensor readings

// Set the app to run indefinitely
import { me } from "appbit";
me.appTimeoutEnabled = false;


// Set the accelerometer for reading
import { Accelerometer } from "accelerometer";
const accelConfig = { frequency: 10, batch: 10 };
const accel = new Accelerometer(accelConfig);
accel.addEventListener("reading", logAccel);

// Set the heart rate sensor for reading
import { HeartRateSensor } from "heart-rate";
const hrmConfig = { frequency: 1, batch: 1 };
const hrm = new HeartRateSensor(hrmConfig);
hrm.addEventListener("reading", logHeart);

// Set the gyroscope for reading
import { Gyroscope } from "gyroscope";
const gyroConfig = { frequency: 10, batch: 10 };
const gyro = new Gyroscope(gyroConfig);
gyro.addEventListener("reading", logGyro);

// Set the body presence sensor for reading
import { BodyPresenceSensor } from "body-presence";
const bps = new BodyPresenceSensor();
bps.addEventListener("reading", logPresence);


// Name of the file to store the sensor readings
const logFile = "log.bin";

// Delete the log file if it exists
import * as fs from "fs";
if (fs.existsSync(logFile))
  fs.unlinkSync(logFile);

// File descriptor for the log
let logFD;

// Log record header types
// enum LogRecordType {
//   Accel,
//  Gyro,
//  Heart,
//  Presence
// }

const LogRecordTypeAccel = 0
const LogRecordTypeGyro = 1
const LogRecordTypeHeart = 2
const LogRecordTypePresence = 3


// Structure of the log record header
const logRecordHeadSize = 1;
const logRecordHead = new ArrayBuffer(logRecordHeadSize);
const logRecordHeadView = new Uint8Array(logRecordHead, 0, 1);

// Structure of the accelerometer log record
const accelRecordSize = (accelConfig.batch * 16);
const accelRecord = new ArrayBuffer(accelRecordSize);
const accelRecordTimeView = new Uint32Array(accelRecord, 0, accelConfig.batch);
const accelRecordXView = new Float32Array(accelRecord, 4 * accelConfig.batch, accelConfig.batch);
const accelRecordYView = new Float32Array(accelRecord, 8 * accelConfig.batch, accelConfig.batch);
const accelRecordZView = new Float32Array(accelRecord, 12 * accelConfig.batch, accelConfig.batch);

// Structure of the gyroscope log record
const gyroRecordSize = (gyroConfig.batch * 16);
const gyroRecord = new ArrayBuffer(gyroRecordSize);
const gyroRecordTimeView = new Uint32Array(gyroRecord, 0, gyroConfig.batch);
const gyroRecordXView = new Float32Array(gyroRecord, 4 * gyroConfig.batch, gyroConfig.batch);
const gyroRecordYView = new Float32Array(gyroRecord, 8 * gyroConfig.batch, gyroConfig.batch);
const gyroRecordZView = new Float32Array(gyroRecord, 12 * gyroConfig.batch, gyroConfig.batch);

// Structure of the heart rate monitor log record
const hrmRecordSize = (hrmConfig.batch * 8);
const hrmRecord = new ArrayBuffer(hrmRecordSize);
const hrmRecordTimeView = new Uint32Array(hrmRecord, 0, hrmConfig.batch);
const hrmRecordHeartView = new Float32Array(hrmRecord, 4 * hrmConfig.batch, hrmConfig.batch);

// Structure of the body presence sensor log record
const bpsRecordSize = 8;
const bpsRecord = new ArrayBuffer(bpsRecordSize);
const bpsRecordTimeView = new Uint32Array(bpsRecord, 0, 1);
const bpsRecordPresView = new Uint32Array(bpsRecord, 4, 1);


// Get a handle on the recording button
import * as document from "document";
const recBtnEl = document.getElementById('recBtn');

// Keep track of recording status
let isRecording = false;

// Note the timer handle
let recTimer;

// Set a callback for click on recording button
recBtnEl.addEventListener("click", onRecBtn);

// Called upon a click on recording button
function onRecBtn() {
  // If recording stop, otherwise start
  if (isRecording)
    stopRec();
  else
    startRec();

  // Toggle the recording status
  isRecording = !isRecording;
}

// Start recording sensor data
function startRec() {;
  // Note down the start time
  console.log(`Logging Started at ${Date.now()}`);

  // Open the log file
  logFD = fs.openSync(logFile, 'a');

  // Start reading sensors
  accel.start();
  hrm.start();
  gyro.start();
  bps.start();

  // Change the button to stop recording
  recBtnEl.text = 'STOP RECORDING';
}

// Stop reading sensor data
function stopRec() {
  // Stop reading sensors
  accel.stop();
  hrm.stop();
  gyro.stop();
  bps.stop();

  // Close the log file
  fs.closeSync(logFD);

  // Note down the start time
  console.log(`Logging stopped at ${Date.now()}`);

  // Transfer the log file to companion
  transferLogFile();

  // Print the log file
  // printLogFile();

  // All done
  me.exit();
};

// Read the contents of log file
function printLogFile() {
  // Note the size of the log file
  let logFileSize = fs.statSync(logFile).size;
  console.log(`Log file size is ${logFileSize}`);

  // Open the log file
  logFD = fs.openSync(logFile, 'r');

  // Keep reading till no more records
  let readPos = 0;
  while (readPos <= logFileSize) {
    // Read record type
    fs.readSync(logFD, logRecordHead, 0, logRecordHeadSize, readPos);
    readPos += logRecordHeadSize;
    switch (logRecordHeadView[0]) {
      case LogRecordTypeAccel:
        // Read accelerometer record
        fs.readSync(logFD, accelRecord, 0, accelRecordSize, readPos);
        readPos += accelRecordSize;

        // Extract individual readings
        for (let i = 0; i < accelConfig.batch; i++) {
          console.log(`A, ${accelRecordTimeView[i]}, ${accelRecordXView[i].toFixed(3)}, ${accelRecordYView[i].toFixed(3)}, ${accelRecordZView[i].toFixed(3)}`);
        }
        break;
      case LogRecordTypeGyro:
        // Read gyroscope record
        fs.readSync(logFD, gyroRecord, 0, gyroRecordSize, readPos);
        readPos += gyroRecordSize;

        // Extract individual readings
        for (let i = 0; i < gyroConfig.batch; i++) {
          console.log(`G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i].toFixed(3)}, ${gyroRecordYView[i].toFixed(3)}, ${gyroRecordZView[i].toFixed(3)}`);
        }
        break;
      case LogRecordTypeHeart:
        // Read heart rate monitor record
        fs.readSync(logFD, hrmRecord, 0, hrmRecordSize, readPos);
        readPos += hrmRecordSize;

        
        // Extract individual readings
        for (let i = 0; i < hrmConfig.batch; i++) {
          console.log(`H, ${hrmRecordTimeView[i]}, ${hrmRecordHeartView[i]}`);
        }
        break;
      case LogRecordTypePresence:
        // Read body presence record
        fs.readSync(logFD, bpsRecord, 0, bpsRecordSize, readPos);
        readPos += bpsRecordSize;

        // Extract individual readings
        for (let i = 0; i < 1; i++) {;
          console.log(`P, ${bpsRecordTimeView[i]}, ${bpsRecordPresView[i]}`);
        }
        break;
      default:
        console.log('ERROR: Unknown log record type');
    }
  }

  // Close the log file
  fs.closeSync(logFD);
};

// Log accelerometer readings
function logAccel() {
  // Write the type as accelerometer record
  logRecordHeadView[0] = LogRecordTypeAccel;
  fs.writeSync(logFD, logRecordHead);

  // Write the batch of timestamps, x, y, z values
  fs.writeSync(logFD, accel.readings.timestamp);
  fs.writeSync(logFD, accel.readings.x);
  fs.writeSync(logFD, accel.readings.y);
  fs.writeSync(logFD, accel.readings.z);

  // Display the readings on console log
  console.log(`Accel : ${logRecordHeadView[0]} : ${Date.now()}`);
  for (let i = 0; i < accel.readings.timestamp.length; i++) {
    console.log(`${accel.readings.timestamp[i]}, ${accel.readings.x[i]}, ${accel.readings.y[i]}, ${accel.readings.z[i]}`);
  }
}

// Log gyroscope readings
function logGyro() {
  // Write the type as gyroscope record
  logRecordHeadView[0] = LogRecordTypeGyro;
  fs.writeSync(logFD, logRecordHead);

  // Write the batch of timestamps, x, y, z values
  fs.writeSync(logFD, gyro.readings.timestamp);
  fs.writeSync(logFD, gyro.readings.x);
  fs.writeSync(logFD, gyro.readings.y);
  fs.writeSync(logFD, gyro.readings.z);

  // Display the readings on console log
  console.log(`Gyro : ${logRecordHeadView[0]} : ${Date.now()}`);
  for (let i = 0; i < gyro.readings.timestamp.length; i++) {
    console.log(`${gyro.readings.timestamp[i]}, ${gyro.readings.x[i]}, ${gyro.readings.y[i]}, ${gyro.readings.z[i]}`);
  }
}

// Log body presence status
function logPresence() {
  // Write the type as body presence record
  logRecordHeadView[0] = LogRecordTypePresence;
  fs.writeSync(logFD, logRecordHead);
  

  // Write the timestamps and presence value
  bpsRecordTimeView[0] = Date.now();
  bpsRecordPresView[0] = bps.present;
  fs.writeSync(logFD, bpsRecord);

  // Display the readings on console log
  console.log(`BPS : ${logRecordHeadView[0]} : ${Date.now()}`);
  console.log(`${bpsRecordTimeView[0]}, ${bpsRecordPresView[0]}`);
}

// Log heart rate readings
function logHeart() {
  // Write the type as heart rate monitor record
  logRecordHeadView[0] = LogRecordTypeHeart;
  fs.writeSync(logFD, logRecordHead);

  // Write the batch of timestamps and heart rate values
  fs.writeSync(logFD, hrm.readings.timestamp);
  fs.writeSync(logFD, hrm.readings.heartRate);

  // Display the readings on console log
  console.log(`HRM : ${logRecordHeadView[0]} : ${Date.now()}`);
  for (let i = 0; i < hrm.readings.timestamp.length; i++) {
    console.log(`${hrm.readings.timestamp[i]}, ${hrm.readings.heartRate[i]}`);
  }
}


// Transfer the log file to companion
import { outbox } from "file-transfer";
function transferLogFile() {
  outbox
  .enqueueFile(logFile)
  .then((ft) => {
    console.log(`Transfer of ${ft.name} successfully queued.`);
  })
  .catch((error) => {
    console.log(`Failed to schedule transfer: ${error}`);
  })
}