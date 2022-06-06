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
  accelRecordSize32, accelRecord32, accelRecordTimeView32,
  accelRecordXView32, accelRecordYView32, accelRecordZView32,
  gyroRecordSize32, gyroRecord32, gyroRecordTimeView32,
  gyroRecordXView32, gyroRecordYView32, gyroRecordZView32,
  hrmRecordSize32, hrmRecord32, hrmRecordTimeView32, hrmRecordHeartView32,
  accelLogRecordMax, gyroLogRecordMax, accelScaler, gyroScaler
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
  let content = ''
  while (readPos < dataSize) {
    // Read the compressed record
    // Read a batch of time stamps (each 2 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      accelRecordTimeView[i] = dataView.getUint16(readPos + i * 2, true)
    }
    readPos += accelConfig.batch * 2;

    // Read a batch of accelerometer x values (each 2 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      // accelRecordXView[i] = dataView.getFloat32(readPos + i * 4, true)
      accelRecordXView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += accelConfig.batch * 2;

    // Read a batch of accelerometer y values (each 2 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      // accelRecordYView[i] = dataView.getFloat32(readPos + i * 4, true)
      accelRecordYView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += accelConfig.batch * 2;

    // Read the batch of accelerometer z values (each 2 bytes)
    for (let i = 0; i < accelConfig.batch; i++) {
      // accelRecordZView[i] = dataView.getFloat32(readPos + i * 4, true)
      accelRecordZView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += accelConfig.batch * 2;

    // Print each individual reading
    for (let i = 0; i < accelConfig.batch; i++) {
      console.log(`A, ${accelRecordTimeView[i]}, ${accelRecordXView[i]}, ${accelRecordYView[i]}, ${accelRecordZView[i]}`);
      content += `A, ${accelRecordTimeView[i]}, ${accelRecordXView[i]}, ${accelRecordYView[i]}, ${accelRecordZView[i]}\n`;

      // console.log(`A16, ${accelRecordTimeView[i]}, ${(accelRecordXView[i] * accelScaler).toFixed(9)}, ${(accelRecordYView[i] * accelScaler).toFixed(9)}, ${(accelRecordZView[i] * accelScaler).toFixed(9)}`);
      // content += `A16, ${accelRecordTimeView[i]}, ${(accelRecordXView[i] * accelScaler).toFixed(9)}, ${(accelRecordYView[i] * accelScaler).toFixed(9)}, ${(accelRecordZView[i] * accelScaler).toFixed(9)}\n`;

      // console.log(`A32, ${accelRecordTimeView32[i]}, ${accelRecordXView32[i].toFixed(9)}, ${accelRecordYView32[i].toFixed(9)}, ${accelRecordZView32[i].toFixed(9)}`);

      // content += `A32, ${accelRecordTimeView32[i]}, ${accelRecordXView32[i].toFixed(9)}, ${accelRecordYView32[i].toFixed(9)}, ${accelRecordZView32[i].toFixed(9)}\n`;
    }
  }

  // return the content
  return(content);
}

// Read the contents of gyro log file
function printGyroLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  let content = ''
  while (readPos < dataSize) {
    // Read the compressed record
    // Read a batch of time stamps (each 2 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordTimeView[i] = dataView.getUint16(readPos + i * 2, true)
    }
    readPos += gyroConfig.batch * 2;

    // Read a batch of gyroscope x values (each 2 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordXView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += gyroConfig.batch * 2;

    // Read a batch of gyroscope y values (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordYView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += gyroConfig.batch * 2;

    // Read the batch of gyroscope z values (each 4 bytes)
    for (let i = 0; i < gyroConfig.batch; i++) {
      gyroRecordZView[i] = dataView.getInt16(readPos + i * 2, true)
    }
    readPos += gyroConfig.batch * 2;

    // Print each individual reading
    for (let i = 0; i < gyroConfig.batch; i++) {
      console.log(`G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i]}, ${gyroRecordYView[i]}, ${gyroRecordZView[i]}`);

      content += `G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i]}, ${gyroRecordYView[i]}, ${gyroRecordZView[i]}\n`;

      // console.log(`G16, ${gyroRecordTimeView[i]}, ${(gyroRecordXView[i] * gyroScaler).toFixed(9)}, ${(gyroRecordYView[i] * gyroScaler).toFixed(9)}, ${(gyroRecordZView[i] * gyroScaler).toFixed(9)}`);

      // content += `G16, ${gyroRecordTimeView[i]}, ${(gyroRecordXView[i] * gyroScaler).toFixed(9)}, ${(gyroRecordYView[i] * gyroScaler).toFixed(9)}, ${(gyroRecordZView[i] * gyroScaler).toFixed(9)}\n`;

      // console.log(`G32, ${gyroRecordTimeView32[i]}, ${gyroRecordXView32[i].toFixed(9)}, ${gyroRecordYView32[i].toFixed(9)}, ${gyroRecordZView32[i].toFixed(9)}`);

      // content += `G32, ${gyroRecordTimeView32[i]}, ${gyroRecordXView32[i].toFixed(9)}, ${gyroRecordYView32[i].toFixed(9)}, ${gyroRecordZView32[i].toFixed(9)}\n`;
    }
  }

  // return the content
  return(content);
}

// Read the contents of heart rate log file
function printHRMLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0
  let content = ''
  while (readPos < dataSize) {
    // Read the compressed record
    // Read a batch of time stamps (each 2 bytes)
    for (let i = 0; i < hrmConfig.batch; i++) {
      hrmRecordTimeView[i] = dataView.getUint16(readPos + i * 2, true)
    }
    readPos += hrmConfig.batch * 2;

    // Read a batch of heart rate values (each 2 bytes)
    for (let i = 0; i < hrmConfig.batch; i++) {
      hrmRecordHeartView[i] = dataView.getUint16(readPos + i * 2, true)
    }
    readPos += hrmConfig.batch * 2;

    // Extract individual readings
    for (let i = 0; i < hrmConfig.batch; i++) {
      console.log(`H, ${hrmRecordTimeView[i]}, ${hrmRecordHeartView[i]}`);

      content += `H, ${hrmRecordTimeView[i]}, ${hrmRecordHeartView[i]}\n`;

      // console.log(`H32, ${hrmRecordTimeView32[i]}, ${hrmRecordHeartView32[i]}`);

      // content += `H32, ${hrmRecordTimeView32[i]}, ${hrmRecordHeartView32[i]}\n`;
    }
  }

  // return the content
  return(content);
}

// Read the contents of body presence log file
function printBPSLog(data) {
  // Get the whole file
  let dataView = new DataView(data);
  let dataSize = data.byteLength;

  // Keep reading till no more records
  let readPos = 0;
  let content = '';
  while (readPos < dataSize) {
    // Read a time stamp (4 bytes)
    let time = dataView.getUint32(readPos, true);
    readPos += 4;
    let pres = dataView.getUint32(readPos, true)
    readPos += 4;
    console.log(`P, ${time}, ${pres}`);

    content += `P, ${time}, ${pres}\n`;
  }

  // return the content
  return(content);
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

    // Dump the log file
    let text;
    console.log(`Begin log ${file.name} size ${file.length} B`);
    if (file.name.indexOf(accelLogPrefix) != -1) {
      text = printAccelLog(data)
    }
    else if  (file.name.indexOf(gyroLogPrefix) != -1) {
      text = printGyroLog(data)
    }
    else if  (file.name.indexOf(hrmLogFile) != -1) {
      text = printHRMLog(data)
    }
    else if  (file.name.indexOf(bpsLogFile) != -1) {
      text = printBPSLog(data)
    }
    console.log(`End log ${file.name}`);

    // Send the log to server
    let name = `${file.name.replace("bin", "csv")}`
    sendToServer(name, text)
  }
}

// Process files arrived when the companion wasn’t running
processAllFiles()
// ================================================================
