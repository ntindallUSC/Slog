// ================================================================
// Definitions that are common to both the app and the companion
// ================================================================


// ================================================================
// Accelerometer settings
export const accelConfig = { frequency: 25, batch: 25 };

// Accelerometer scale factor (+-4g with resolution of 16 bits)
export const accelScaler = 9.80665 * 4 / 32767;

// Heart rate monitor settings
export const hrmConfig = { frequency: 1, batch: 1 };

// Gyroscope settings
export const gyroConfig = { frequency: 25, batch: 25 };

// Gyroscope scale factor (+-radians = +-2000 degrees with resolution of 16 bits)
export const gyroScaler = (Math.PI * 2000 / 180) / 32767;

// File name prefixes for the log files
export let accelLogPrefix = "Accel";
export let gyroLogPrefix = "Gyro";

// File names for the log files
export let hrmLogFile = "Heart.bin";
export let bpsLogFile = "Presence.bin";

// Number of records per log file (~ 2 minutes)
export let accelLogRecordMax = 3000;
export let gyroLogRecordMax = 3000;
// ================================================================


// ================================================================
// Uncompressed record structures (32 bit values)

// Structure of the accelerometer log record
export const accelRecordSize32 = (accelConfig.batch * 16);
export const accelRecord32 = new ArrayBuffer(accelRecordSize32);
export const accelRecordTimeView32 = new Uint32Array(accelRecord32, 0, accelConfig.batch);
export const accelRecordXView32 = new Float32Array(accelRecord32, 4 * accelConfig.batch, accelConfig.batch);
export const accelRecordYView32 = new Float32Array(accelRecord32, 8 * accelConfig.batch, accelConfig.batch);
export const accelRecordZView32 = new Float32Array(accelRecord32, 12 * accelConfig.batch, accelConfig.batch);

// Structure of the gyroscope log record
export const gyroRecordSize32 = (gyroConfig.batch * 16);
export const gyroRecord32 = new ArrayBuffer(gyroRecordSize32);
export const gyroRecordTimeView32 = new Uint32Array(gyroRecord32, 0, gyroConfig.batch);
export const gyroRecordXView32 = new Float32Array(gyroRecord32, 4 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordYView32 = new Float32Array(gyroRecord32, 8 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordZView32 = new Float32Array(gyroRecord32, 12 * gyroConfig.batch, gyroConfig.batch);

// Structure of the heart rate monitor log record
export const hrmRecordSize32 = (hrmConfig.batch * 8);
export const hrmRecord32 = new ArrayBuffer(hrmRecordSize32);
export const hrmRecordTimeView32 = new Uint32Array(hrmRecord32, 0, hrmConfig.batch);
export const hrmRecordHeartView32 = new Float32Array(hrmRecord32, 4 * hrmConfig.batch, hrmConfig.batch);
// ================================================================


// ================================================================
// Compressed record structures (16 bit values)

// Structure of the accelerometer log record
export const accelRecordSize = (accelConfig.batch * 8);
export const accelRecord = new ArrayBuffer(accelRecordSize);
export const accelRecordTimeView = new Uint16Array(accelRecord, 0, accelConfig.batch);
export const accelRecordXView = new Int16Array(accelRecord, 2 * accelConfig.batch, accelConfig.batch);
export const accelRecordYView = new Int16Array(accelRecord, 4 * accelConfig.batch, accelConfig.batch);
export const accelRecordZView = new Int16Array(accelRecord, 6 * accelConfig.batch, accelConfig.batch);

// Structure of the gyroscope log record
export const gyroRecordSize = (gyroConfig.batch * 8);
export const gyroRecord = new ArrayBuffer(gyroRecordSize);
export const gyroRecordTimeView = new Uint16Array(gyroRecord, 0, gyroConfig.batch);
export const gyroRecordXView = new Int16Array(gyroRecord, 2 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordYView = new Int16Array(gyroRecord, 4 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordZView = new Int16Array(gyroRecord, 6 * gyroConfig.batch, gyroConfig.batch);

// Structure of the heart rate monitor log record
export const hrmRecordSize = (hrmConfig.batch * 4);
export const hrmRecord = new ArrayBuffer(hrmRecordSize);
export const hrmRecordTimeView = new Uint16Array(hrmRecord, 0, hrmConfig.batch);
export const hrmRecordHeartView = new Uint16Array(hrmRecord, 2 * hrmConfig.batch, hrmConfig.batch);

// Structure of the body presence sensor log record
export const bpsRecordSize = 8;
export const bpsRecord = new ArrayBuffer(bpsRecordSize);
export const bpsRecordTimeView = new Uint32Array(bpsRecord, 0, 1);
export const bpsRecordPresView = new Uint32Array(bpsRecord, 4, 1);
// ================================================================
