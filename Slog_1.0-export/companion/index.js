// This is a companion to pull log data from fitbit

// Accelerometer settings
const accelConfig = { frequency: 10, batch: 10 };

// Heart rate monitor settings
const hrmConfig = { frequency: 1, batch: 1 };

// Set the gyroscope for reading
const gyroConfig = { frequency: 10, batch: 10 };


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

// Display the contents of log file
async function printLogFile(file) {
  // Indicate the beginning of log
  console.log(`Logtime ${Date.now()}, file ${file.name}, bytes ${file.length}`)

  // Get the whole file
  const data = await file.arrayBuffer()
  let dataView = new DataView(data);
  let dataSize = data.byteLength

  // Keep reading till no more records
  let readPos = 0
  while (readPos <= dataSize) {
    // Read record type (1 byte)
    let type = dataView.getUint8(readPos)
    readPos += 1;
        
    switch (type) {
      case LogRecordTypeAccel:
        // Read an accelerometer record

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
          console.log(`A, ${accelRecordTimeView[i]}, ${accelRecordXView[i].toFixed(3)}, ${accelRecordYView[i].toFixed(3)}, ${accelRecordZView[i].toFixed(3)}`);
        }
        break;
        
      case LogRecordTypeGyro:
        // Read a gyroscope record

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

        // Read a batch of gyroscope z values (each 4 bytes)
        for (let i = 0; i < gyroConfig.batch; i++) {
          gyroRecordZView[i] = dataView.getFloat32(readPos + i * 4, true)
        }
        readPos += gyroConfig.batch * 4;

        // Print each individual reading
        for (let i = 0; i < gyroConfig.batch; i++) {
          console.log(`G, ${gyroRecordTimeView[i]}, ${gyroRecordXView[i].toFixed(3)}, ${gyroRecordYView[i].toFixed(3)}, ${gyroRecordZView[i].toFixed(3)}`);
        }
        break;
        
      case LogRecordTypeHeart:       
        // Read a heart rate record

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
        break;
        
      case LogRecordTypePresence:
        // Read a body presence record

        // Read a time stamp (4 bytes)
        bpsRecordTimeView[0] = dataView.getUint32(readPos, true)
        readPos += 4;

        // Read a presence value
        bpsRecordPresView[0] = dataView.getUint32(readPos, true)
        readPos += 4;

        // Print the record
        console.log(`P, ${bpsRecordTimeView[0]}, ${bpsRecordPresView[0]}`);
        break;
        
      default:
        console.log('ERROR: Unknown log record type');
    }
  }
}


// Process new files as they are received
import { inbox } from "file-transfer"
inbox.addEventListener("newfile", processAllFiles);

// Process the inbox queue for files
async function processAllFiles() {
  let file
  while ((file = await inbox.pop())) {
    printLogFile(file)
  }
}

// Process files arrived when the companion wasn’t running
processAllFiles()