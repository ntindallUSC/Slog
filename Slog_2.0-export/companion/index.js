// ================================================================
// This is a companion to pull log data from fitbit
// ================================================================


// ================================================================
// Import stuff common between this companion and the app
import {
  hrmConfig, accelConfig, gyroConfig,
  accelLogPrefix, gyroLogPrefix, hrmLogFile, bpsLogFile,
  accelRecordSize, accelRecord, accelRecordTimeView,
  accelRecordXView, accelRecordYView, accelRecordZView,
  gyroRecordSize, gyroRecord, gyroRecordTimeView,
  gyroRecordXView, gyroRecordYView, gyroRecordZView,
  hrmRecordSize, hrmRecord, hrmRecordTimeView, hrmRecordHeartView,
  bpsRecordSize, bpsRecord, bpsRecordTimeView, bpsRecordHeartView,
  accelLogRecordMax, gyroLogRecordMax
} from '../common/common.js';

// Import inbox from file transfer module
import { inbox } from "file-transfer";
// ================================================================


// ================================================================
// Read the contents of accel log file
function printAccelLog(data) {  
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  while (readPos < dataSize) {    
    // Read a batch of time stamps (each 4 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      accelRecordTimeView[i] = dataView.getUint32(readPos + i * 4, true)
    }
    readPos += accelConfig.batch * 4;
    
    // Read a batch of accelerometer x values (each 4 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      accelRecordXView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += accelConfig.batch * 4;

    // Read a batch of accelerometer y values (each 4 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      accelRecordYView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += accelConfig.batch * 4;
    
    // Read the batch of accelerometer z values (each 4 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      accelRecordZView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += accelConfig.batch * 4;

    // Print each individual reading
    for (let i = 0; i < accelConfig.batch; i++) {
      console.log(`A, ${accelRecordTimeView[i]}, ${accelRecordXView[i].toFixed(9)}, ${accelRecordYView[i].toFixed(9)}, ${accelRecordZView[i].toFixed(9)}`);
    }
  }
}

// Read the contents of gyro log file
function printGyroLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  while (readPos < dataSize) {
    // Read a batch of time stamps (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordTimeView[i] = dataView.getUint32(readPos + i * 4, true)
    }
    readPos += gyroConfig.batch * 4;

    // Read a batch of gyroscope x values (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordXView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += gyroConfig.batch * 4;

    // Read a batch of gyroscope y values (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordYView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += gyroConfig.batch * 4;

    // Read the batch of gyroscope z values (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordZView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += gyroConfig.batch * 4;

    // Print each individual reading
    for (let i = 0; i < gyroConfig.batch; i++) {
      console.log(`G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i].toFixed(9)}, ${gyroRecordYView[i].toFixed(9)}, ${gyroRecordZView[i].toFixed(9)}`);
    }
  }
}

// Read the contents of heart rate log file
function printHRMLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  while (readPos < dataSize) {
    // Read a batch of time stamps (each 4 bytes)
    for (let i = 0; i < hrmConfig.batch; i++) {
      hrmRecordTimeView[i] = dataView.getUint32(readPos + i * 4, true)
    }
    readPos += hrmConfig.batch * 4;

    // Read a batch of heart rate values (each 4 bytes)
    for (let i = 0; i < hrmConfig.batch; i++) {
      hrmRecordHeartView[i] = dataView.getFloat32(readPos + i * 4, true)
    }
    readPos += hrmConfig.batch * 4;

    // Extract individual readings
    for (let i = 0; i < hrmConfig.batch; i++) {
      console.log(`H, ${hrmRecordTimeView[i]}, ${hrmRecordHeartView[i]}`);
    }
  }
}

// Read the contents of body presence log file
function printBPSLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  while (readPos < dataSize) {
    // Read a time stamp (4 bytes)
    let time = dataView.getUint32(readPos, true);
    readPos += 4;
    let pres = dataView.getUint32(readPos, true)
    readPos += 4;
    console.log(`P, ${time}, ${pres}`);
  }
}
// ================================================================


// ================================================================
const httpURL = 'http://192.168.1.13:50000/htbin/hello.py'

function sendToServer(name, data) {
  // console.log(`sendToServer(): content = ${data}`)
  console.log(`Sending ${name} to server ...`)
  // const headers = { 'Content-type': 'application/text', 'QUERY_STRING': name, 'HTTP_COOKIE': name }
  const headers = { 'Content-type': name }
  let fetchInit = { method: 'POST', headers: headers, body: data }
  // let fetchInit = {method: 'POST', headers: {"Content-type": "application/octet-stream"}, body: data}
  fetch(httpURL, fetchInit)
  console.log(`Done sending ${name} to server`)
}
// ================================================================


// ================================================================
// Process new files as they are received
inbox.addEventListener("newfile", processAllFiles);

// Process the inbox queue for files
async function processAllFiles() {
  let file
  while ((file = await inbox.pop())) {
    // Get data from the file
    let data = await file.arrayBuffer();

    // Send the log to server
    // sendToServer(file.name, data)
    
    // Dump the log file
    console.log(`Begin log ${file.name} size ${file.length} B`);
    if (file.name.indexOf(accelLogPrefix) != -1) {
      printAccelLog(data)
    }
    else if  (file.name.indexOf(gyroLogPrefix) != -1) {
      printGyroLog(data)
    }
    else if  (file.name.indexOf(hrmLogFile) != -1) {
      printHRMLog(data)
    }
    else if  (file.name.indexOf(bpsLogFile) != -1) {
      printBPSLog(data)
    }
    console.log(`End log ${file.name}`);
  }
}

// Process files arrived when the companion wasn’t running
processAllFiles()
// ================================================================
