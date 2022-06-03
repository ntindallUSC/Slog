// ================================================================
// This app records batched sensor readings
// Stores sensor readings in multiple files for reliable transfer
// ================================================================


// ================================================================
// Import stuff common between this app and companion
import {
  hrmConfig, accelConfig, gyroConfig,
  accelLogPrefix, gyroLogPrefix, hrmLogFile, bpsLogFile,
  accelRecordSize, accelRecord, accelRecordTimeView,
  accelRecordXView, accelRecordYView, accelRecordZView,
  gyroRecordSize, gyroRecord, gyroRecordTimeView,
  gyroRecordXView, gyroRecordYView, gyroRecordZView,
  hrmRecordSize, hrmRecord, hrmRecordTimeView, hrmRecordHeartView,
  bpsRecordSize, bpsRecord, bpsRecordTimeView, bpsRecordPresView,
  accelLogRecordMax, gyroLogRecordMax
} from '../common/common.js';

// Import file system module
import * as fs from "fs";

// Import outbox from file transfer module
import { outbox } from "file-transfer";

// Set the app to run indefinitely
import { me } from "appbit";
me.appTimeoutEnabled = false;
// ================================================================


// ================================================================
// Number of log files generated
let accelLogCount = 0;
let gyroLogCount = 0;

/// Number of records in the current log file
let accelCurrLogRecordCount = 0;
let gyroCurrLogRecordCount = 0;

// Accel and Gyro log files end with a number, starting with 1
// Once it hits a record limit, start logging in the next file
let accelLogFile = `${accelLogPrefix}1.bin`;
let gyroLogFile = `${gyroLogPrefix}1.bin`;

// File descriptor for the log files
let accelLogFD;
let gyroLogFD;
let hrmLogFD;
let bpsLogFD;
// ================================================================


// ================================================================
// Set the accelerometer for reading
import { Accelerometer } from "accelerometer";
const accel = new Accelerometer(accelConfig);
accel.addEventListener("reading", logAccel);

// Set the heart rate sensor for reading
import { HeartRateSensor } from "heart-rate";
const hrm = new HeartRateSensor(hrmConfig);
hrm.addEventListener("reading", logHeart);

// Set the gyroscope for reading
import { Gyroscope } from "gyroscope";
const gyro = new Gyroscope(gyroConfig);
gyro.addEventListener("reading", logGyro);

// Set the body presence sensor for reading
import { BodyPresenceSensor } from "body-presence";
const bps = new BodyPresenceSensor();
bps.addEventListener("reading", logPresence);
// ================================================================


// ================================================================
// Get hold of all the buttons
import * as document from "document";
const recBtnEl = document.getElementById('recBtn');
const xferBtnEl = document.getElementById('xferBtn');
const resetBtnEl = document.getElementById('resetBtn');

// Keep track of recording status
let isRecording = false;

// Keep track of transferring status
let isXfering = false;
let nextXferLogNum = 1;
let xferInterval = 30000; // 30 seconds

// Initialize the app
initState()
// ================================================================


// ================================================================
// Get a sum of bytes in all the log files
function getLoggedBytes()
{
  let numBytes = 0;
  const listDir = fs.listDirSync("/private/data");
  let dirIter;
  while ((dirIter = listDir.next()) && !dirIter.done) {
    numBytes += fs.statSync(dirIter.value).size;
  }
  return numBytes;
}

// Delete all log files
function clearLogFiles()
{
  const listDir = fs.listDirSync("/private/data");
  let dirIter;
  while ((dirIter = listDir.next()) && !dirIter.done) {
    fs.unlinkSync(dirIter.value);
  }
}
// ================================================================


// ================================================================
// Restore the state of the app to where it was when last quit
function restoreState()
{
  const listDir = fs.listDirSync("/private/data");
  let dirIter;
  while ((dirIter = listDir.next()) && !dirIter.done) {
    
    console.log(`File: ${dirIter.value} Size: ${fs.statSync(dirIter.value).size}`)

    
    // Check if it is an accel log file
    if (dirIter.value.indexOf(accelLogPrefix) != -1) {
      // Get hold of the file number
      let accelLogNum = parseInt(dirIter.value.slice(accelLogPrefix.length));

      // Check if this is greater than current accel log count
      if (accelLogNum > accelLogCount) {
        accelLogCount = accelLogNum;
      }
    }
    else if (dirIter.value.indexOf(gyroLogPrefix) != -1) {
      // Get hold of the file number
      let gyroLogNum = parseInt(dirIter.value.slice(gyroLogPrefix.length));

      // Check if this is greater than current gyro log count
      if (gyroLogNum > gyroLogCount) {
        gyroLogCount = gyroLogNum;
      }
    }
  }

  // Get the curent log files
  accelLogFile = `${accelLogPrefix}${accelLogCount}.bin`;
  gyroLogFile = `${gyroLogPrefix}${gyroLogCount}.bin`;

  // Get the count of records
  accelCurrLogRecordCount = (fs.statSync(accelLogFile).size / accelRecordSize) * accelConfig.batch;
  gyroCurrLogRecordCount = (fs.statSync(gyroLogFile).size / gyroRecordSize) * gyroConfig.batch;
  console.log(`State: accelLogCount = ${accelLogCount}, gyroLogCount = ${gyroLogCount}`)
  console.log(`State: accelCurrLogRecordCount = ${accelCurrLogRecordCount}, gyroCurrLogRecordCount = ${gyroCurrLogRecordCount}`)
}

// Initialize the state
function initState()
{
  // Initialize the buttons
  recBtnEl.text = 'START RECORDING';
  xferBtnEl.text = 'TRANSFER TO PHONE';
  resetBtnEl.text = 'RESET RECORDING';

  // Set callbacks for clicks on the buttons
  resetBtnEl.addEventListener("click", onResetBtn);
  xferBtnEl.addEventListener("click", onXferBtn);
  recBtnEl.addEventListener("click", onRecBtn);

  // Enable/disable relevant buttons
  let numLogdBytes  = getLoggedBytes()
  if (numLogdBytes > 0) {
    // Activate xfer/reset buttons
    xferBtnEl.disabled = false;
    resetBtnEl.disabled = false;

    xferBtnEl.text = `TRANSFER ${numLogdBytes} B`
    resetBtnEl.text = 'RESET RECORDING';
  } else {
    // Nothing to xfer or reset
    xferBtnEl.disabled = true;
    resetBtnEl.disabled = true;

    xferBtnEl.text = '';
    resetBtnEl.text = '';
  }

  // Restore state if this app was run before
  if (fs.existsSync(accelLogFile)) {
    restoreState()
  }
}
// ================================================================


// ================================================================
// Called upon a click on reset button
function onResetBtn()
{
  // Do nothing if recording/xfering in progress
  if (isRecording || isXfering)
    return;

  // Delete all the existing log files
  clearLogFiles();
  
  // Reset the logging file/record status
  accelLogCount = 0;
  gyroLogCount = 0;
  accelCurrLogRecordCount = 0;
  gyroCurrLogRecordCount = 0;
  accelLogFile = `${accelLogPrefix}1.bin`;
  gyroLogFile = `${gyroLogPrefix}1.bin`;

  // Deactive transfer and reset buttons
  xferBtnEl.disabled = true;
  resetBtnEl.disabled = true;

  xferBtnEl.text = '';
  resetBtnEl.text = '';
}

// Called upon a click on reset button
function onXferBtn() {
  // Do nothing if recording/xfering in progress
  if (isRecording || isXfering)
    return;

  // Transfer the log file to companion
  isXfering = true;
  nextXferLogNum = 1;
  xferLogFiles();

  // Print the log file
  // printLogFiles();
}


// Called upon a click on recording button
function onRecBtn() {
  // Do nothing if xfering in progress
  if (isXfering)
    return;  
  
  // If recording, then stop, otherwise start
  if (isRecording)
    stopRec();
  else
    startRec();

  // Toggle the recording status
  isRecording = !isRecording;
}

// Start recording sensor data
function startRec() {
  // Note down the start time
  console.log(`Logging Started at ${Date.now()}`);

  // Check if accel log file sequence started
  if (accelLogCount == 0) {
    // Start the sequence of accel log files
    accelLogCount = 1;
  }

  // Check if gyro log file sequence started
  if (gyroLogCount == 0) {
    // Start the sequence of gyro log files
    gyroLogCount = 1;
  }

  // Open the log files for appending
  accelLogFD = fs.openSync(accelLogFile, 'a');
  gyroLogFD = fs.openSync(gyroLogFile, 'a');
  hrmLogFD = fs.openSync(hrmLogFile, 'a');
  bpsLogFD = fs.openSync(bpsLogFile, 'a');

  // Start reading sensors
  accel.start();
  hrm.start();
  gyro.start();
  bps.start();

  // Change the button to stop recording
  recBtnEl.text = 'STOP RECORDING';

  // Deactivate transfer and reset buttons
  xferBtnEl.disabled = true;
  resetBtnEl.disabled = true;

  xferBtnEl.text = '';
  resetBtnEl.text = '';
}

// Stop reading sensor data
function stopRec() {
  // Stop reading sensors
  accel.stop();
  hrm.stop();
  gyro.stop();
  bps.stop();

  // Close all the log files
  fs.closeSync(accelLogFD);
  fs.closeSync(gyroLogFD);
  fs.closeSync(hrmLogFD);
  fs.closeSync(bpsLogFD);

  // Note down the start time
  console.log(`Logging stopped at ${Date.now()}`);

  // Change the button to start recording
  recBtnEl.text = 'START RECORDING';

  // Activate all buttons
  xferBtnEl.disabled = false;
  resetBtnEl.disabled = false;

  let numLogdBytes  = getLoggedBytes();
  xferBtnEl.text = `TRANSFER ${numLogdBytes} B`
  resetBtnEl.text = 'RESET RECORDING'
}
// ================================================================


// ================================================================
// Log accelerometer readings
function logAccel() {
  // Write the batch of timestamps, x, y, z values
  fs.writeSync(accelLogFD, accel.readings.timestamp);
  fs.writeSync(accelLogFD, accel.readings.x);
  fs.writeSync(accelLogFD, accel.readings.y);
  fs.writeSync(accelLogFD, accel.readings.z);

  // Update the number of records
  accelCurrLogRecordCount += accel.readings.timestamp.length;

  // Check if we need to start a new log file
  if (accelCurrLogRecordCount >= accelLogRecordMax) {
    // Record limit reached.
    // Close the current log file
    fs.closeSync(accelLogFD);

    // Start a new log file
    accelLogCount += 1;
    accelLogFile = `${accelLogPrefix}${accelLogCount}.bin`;
    accelLogFD = fs.openSync(accelLogFile, 'a');

    // Reset the record count
    accelCurrLogRecordCount = 0;
  }

  // Return here to skip printing to console
  return;

  // Display the readings on console log
  console.log(`Accel : ${Date.now()}`);
  for (let i = 0; i < accel.readings.timestamp.length; i++) {
    console.log(`${accel.readings.timestamp[i]}, ${accel.readings.x[i]}, ${accel.readings.y[i]}, ${accel.readings.z[i]}`);
  }
}

// Log gyroscope readings
function logGyro()
{
  // Write the batch of timestamps, x, y, z values
  fs.writeSync(gyroLogFD, gyro.readings.timestamp);
  fs.writeSync(gyroLogFD, gyro.readings.x);
  fs.writeSync(gyroLogFD, gyro.readings.y);
  fs.writeSync(gyroLogFD, gyro.readings.z);

  // Update the number of records
  gyroCurrLogRecordCount += gyro.readings.timestamp.length;

  // Check if we need to start a new log file
  if (gyroCurrLogRecordCount >= gyroLogRecordMax) {
    // Record limit reached.
    // Close the current log file
    fs.closeSync(gyroLogFD);

    // Start a new log file
    gyroLogCount += 1;
    gyroLogFile = `${gyroLogPrefix}${gyroLogCount}.bin`;
    gyroLogFD = fs.openSync(gyroLogFile, 'a');

    // Reset the record count
    gyroCurrLogRecordCount = 0;
  }

  // Return here to skip printing to console
  return;

  // Display the readings on console log
  console.log(`Gyro : ${Date.now()}`);
  for (let i = 0; i < gyro.readings.timestamp.length; i++) {
    console.log(`${gyro.readings.timestamp[i]}, ${gyro.readings.x[i]}, ${gyro.readings.y[i]}, ${gyro.readings.z[i]}`);
  }
}

// Log heart rate readings
function logHeart() {
  // Write the batch of timestamps and heart rate values
  fs.writeSync(hrmLogFD, hrm.readings.timestamp);
  fs.writeSync(hrmLogFD, hrm.readings.heartRate);

  // Return here to skip printing to console
  return;

  // Display the readings on console log
  console.log(`HRM : ${Date.now()}`);
  for (let i = 0; i < hrm.readings.timestamp.length; i++) {
    console.log(`${hrm.readings.timestamp[i]}, ${hrm.readings.heartRate[i]}`);
  }
}

// Log body presence status
function logPresence() {
  // Write the timestamps and presence value
  bpsRecordTimeView[0] = Date.now();
  bpsRecordPresView[0] = bps.present;
  fs.writeSync(bpsLogFD, bpsRecord);

  // Return here to skip printing to console
  return;

  // Display the readings on console log
  console.log(`BPS : ${Date.now()}`);
  console.log(`${bpsRecordTimeView[0]}, ${bpsRecordPresView[0]}`);
}
// ================================================================


// ================================================================
// Read the contents of accel log file
function printAccelLog(logFile) {
  // Note the size of the log file
  let logFileSize = fs.statSync(logFile).size;
  console.log(`Begin log ${logFile} size ${logFileSize}`);

  // Open the log file
  let logFD = fs.openSync(logFile, 'r');

  // Keep reading till no more records
  let readPos = 0;
  while (readPos < logFileSize) {
    fs.readSync(logFD, accelRecord, 0, accelRecordSize, readPos);
    readPos += accelRecordSize;

    // Extract individual readings
    for (let i = 0; i < accelConfig.batch; i++) {
      console.log(`A, ${accelRecordTimeView[i]}, ${accelRecordXView[i].toFixed(9)}, ${accelRecordYView[i].toFixed(9)}, ${accelRecordZView[i].toFixed(9)}`);
    }
  }

  // Reached end of file
  console.log(`End log ${logFile}`);

  // Close the log file
  fs.closeSync(logFD);
}

// Read the contents of Gyro log file
function printGyroLog(logFile) {
  // Note the size of the log file
  let logFileSize = fs.statSync(logFile).size;
  console.log(`Begin log ${logFile} size ${logFileSize}`);

  // Open the log file
  let logFD = fs.openSync(logFile, 'r');

  // Keep reading till no more records
  let readPos = 0;
  while (readPos < logFileSize) {
    fs.readSync(logFD, gyroRecord, 0, gyroRecordSize, readPos);
    readPos += gyroRecordSize;

    // Extract individual readings
    for (let i = 0; i < gyroConfig.batch; i++) {
      console.log(`G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i].toFixed(9)}, ${gyroRecordYView[i].toFixed(9)}, ${gyroRecordZView[i].toFixed(9)}`);
    }
  }

  // Reached end of file
  console.log(`End log ${logFile}`);

  // Close the log file
  fs.closeSync(logFD);
}

// Read the contents of HRM log file
function printHRMLog(logFile) {
  // Note the size of the log file
  let logFileSize = fs.statSync(logFile).size;
  console.log(`Begin log ${logFile} size ${logFileSize}`);

  // Open the log file
  let logFD = fs.openSync(logFile, 'r');

  // Keep reading till no more records
  let readPos = 0;
  while (readPos < logFileSize) {
    fs.readSync(logFD, hrmRecord, 0, hrmRecordSize, readPos);
    readPos += hrmRecordSize;

    // Extract individual readings
    for (let i = 0; i < hrmConfig.batch; i++) {
      console.log(`H, ${hrmRecordTimeView[i]}, ${hrmRecordHeartView[i]}`);
    }
  }

  // Reached end of file
  console.log(`End log ${logFile}`);

  // Close the log file
  fs.closeSync(logFD);
}


// Read the contents of BPS log file
function printBPSLog(logFile) {
  // Note the size of the log file
  let logFileSize = fs.statSync(logFile).size;
  console.log(`Begin log ${logFile} size ${logFileSize}`);

  // Open the log file
  let logFD = fs.openSync(logFile, 'r');

  // Keep reading till no more records
  let readPos = 0;
  while (readPos < logFileSize) {
    fs.readSync(logFD, bpsRecord, 0, bpsRecordSize, readPos);
    readPos += bpsRecordSize;

    // Extract individual readings
    for (let i = 0; i < 1; i++) {
      console.log(`P, ${bpsRecordTimeView[i]}, ${bpsRecordPresView[i]}`);
    }
  }

  // Reached end of file
  console.log(`End log ${logFile}`);

  // Close the log file
  fs.closeSync(logFD);
}

// Prints all the log files on the watch
function printLogFiles()
{
  // Print body presence log
  printBPSLog(bpsLogFile)

  // Print heart rate log
  printHRMLog(hrmLogFile)

  // Go through the directory and print accel and gyro logs
  const listDir = fs.listDirSync("/private/data");
  let dirIter;
  while ((dirIter = listDir.next()) && !dirIter.done) {
    // Check if it is an accel log file
    if (dirIter.value.indexOf(accelLogPrefix) != -1) {
      printAccelLog(dirIter.value)
    }
    // Check if it is a gyro log file
    else if (dirIter.value.indexOf(gyroLogPrefix) != -1) {
      printGyroLog(dirIter.value)
    }
  }
}
// ================================================================


// ================================================================
// Transfer the log files to companion
function transferLogFiles() {
  const listDir = fs.listDirSync("/private/data");
  let dirIter;
  while ((dirIter = listDir.next()) && !dirIter.done) {
    outbox
    .enqueueFile(dirIter.value)
    .then((ft) => {
      console.log(`Transfer of ${ft.name} successfully queued.`);
    })
    .catch((error) => {
      console.log(`Failed to schedule transfer: ${error}`);
    })
  }
}

// Transfer a file
function xferFile(file) {
  outbox
  .enqueueFile(file)
  .then((ft) => {
    console.log(`Transfer of ${ft.name} successfully queued.`);
  })
  .catch((error) => {
    console.log(`Failed to schedule transfer: ${error}`);
  })
}

// Transfer the log files to companion
function xferLogFiles() {
  // Display xfer status
  console.log(`Xfer status: time = ${Date.now()}, ${nextXferLogNum} of ${accelLogCount}`);

  // First transfer heart and presence too
  if (nextXferLogNum == 1) {
    xferFile(bpsLogFile)
    xferFile(hrmLogFile)
  }
  
  // Transfer a pair of accel and gyro logs
  xferFile(`${accelLogPrefix}${nextXferLogNum}.bin`)
  xferFile(`${gyroLogPrefix}${nextXferLogNum}.bin`)

  // Move on to the next one
  nextXferLogNum += 1
  
  // Check if the transfer is done
  if (nextXferLogNum > accelLogCount) {
    // We are done
    isXfering = false;
  } else {
    // Set a timer to transfer the next pair
    setTimeout(xferLogFiles, xferInterval)
  }
}
// ================================================================
