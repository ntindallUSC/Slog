// ================================================================
// Definitions that are common to both the app and the companion
// ================================================================


// ================================================================
// Accelerometer settings
export const accelConfig = { frequency: 25, batch: 25 };

// Heart rate monitor settings
export const hrmConfig = { frequency: 1, batch: 1 };

// Gyroscope settings
export const gyroConfig = { frequency: 25, batch: 25 };

// File name prefixes for the log files
export let accelLogPrefix = "Accel";
export let gyroLogPrefix = "Gyro";

// File names for the log files
export let hrmLogFile = "Heart.bin";
export let bpsLogFile = "Presence.bin";

// Number of records per log file (~ 1 minute)
export let accelLogRecordMax = 1500;
export let gyroLogRecordMax = 1500;
// ================================================================


// ================================================================
// Structure of the accelerometer log record
export const accelRecordSize = (accelConfig.batch * 16);
export const accelRecord = new ArrayBuffer(accelRecordSize);
export const accelRecordTimeView = new Uint32Array(accelRecord, 0, accelConfig.batch);
export const accelRecordXView = new Float32Array(accelRecord, 4 * accelConfig.batch, accelConfig.batch);
export const accelRecordYView = new Float32Array(accelRecord, 8 * accelConfig.batch, accelConfig.batch);
export const accelRecordZView = new Float32Array(accelRecord, 12 * accelConfig.batch, accelConfig.batch);

// Structure of the gyroscope log record
export const gyroRecordSize = (gyroConfig.batch * 16);
export const gyroRecord = new ArrayBuffer(gyroRecordSize);
export const gyroRecordTimeView = new Uint32Array(gyroRecord, 0, gyroConfig.batch);
export const gyroRecordXView = new Float32Array(gyroRecord, 4 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordYView = new Float32Array(gyroRecord, 8 * gyroConfig.batch, gyroConfig.batch);
export const gyroRecordZView = new Float32Array(gyroRecord, 12 * gyroConfig.batch, gyroConfig.batch);

// Structure of the heart rate monitor log record
export const hrmRecordSize = (hrmConfig.batch * 8);
export const hrmRecord = new ArrayBuffer(hrmRecordSize);
export const hrmRecordTimeView = new Uint32Array(hrmRecord, 0, hrmConfig.batch);
export const hrmRecordHeartView = new Float32Array(hrmRecord, 4 * hrmConfig.batch, hrmConfig.batch);

// Structure of the body presence sensor log record
export const bpsRecordSize = 8;
export const bpsRecord = new ArrayBuffer(bpsRecordSize);
export const bpsRecordTimeView = new Uint32Array(bpsRecord, 0, 1);
export const bpsRecordPresView = new Uint32Array(bpsRecord, 4, 1);
// ================================================================