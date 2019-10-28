const tessel = require('tessel');
const I2C_ADDRESS = 0x39;

const REPEATED_BYTE = 0x80;
const AUTO_INCREMENT = 0xA0;
const SPECIAL_FN = 0xE0;

const ID_1 = 0x12;
const ID_2 = 0x39;

const FIFO_PAUSE_TIME = 30;

const APDS9930_ENABLE = 0x00;
const APDS9930_ATIME = 0x01;
const APDS9930_PTIME = 0x02;
const APDS9930_WTIME = 0x03;
const APDS9930_AILTL = 0x04;
const APDS9930_AILTH = 0x05;
const APDS9930_AIHTL = 0x06;
const APDS9930_AIHTH = 0x07;
const APDS9930_PILTL = 0x08;
const APDS9930_PILTH = 0x09;
const APDS9930_PIHTL = 0x0A;
const APDS9930_PIHTH = 0x0B;
const APDS9930_PERS = 0x0C;
const APDS9930_CONFIG = 0x0D;
const APDS9930_PPULSE = 0x0E;
const APDS9930_CONTROL = 0x0F;
const APDS9930_ID = 0x12;
const APDS9930_STATUS = 0x13;
const APDS9930_Ch0DATAL = 0x14;
const APDS9930_Ch0DATAH = 0x15;
const APDS9930_Ch1DATAL = 0x16;
const APDS9930_Ch1DATAH = 0x17;
const APDS9930_PDATAL = 0x18;
const APDS9930_PDATAH = 0x19;
const APDS9930_POFFSET = 0x1E;

const ON = 1;
const OFF = 0;

const POWER = 0;
const AMBIENT_LIGHT = 1;
const PROXIMITY = 2;
const WAIT = 3;
const ALL = 7;

const ERROR = 0xFF;

const ambient = tessel.port.B.I2C(I2C_ADDRESS);

const transfer = (buffer, numBytesToRead) => new Promise((resolve, reject) => {
  ambient.transfer(buffer, numBytesToRead, (error, data) => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
});

const send = (buffer) => new Promise((resolve, reject) => {
  ambient.send(buffer, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

const read = (numBytesToRead) => new Promise((resolve, reject) => {
  ambient.read(numBytesToRead, (error, data) => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const write = (register, value) => send(Buffer.from([REPEATED_BYTE | register, value]));

console.log('Starting setup');
write(APDS9930_ENABLE, 0)
.then(() => write(APDS9930_ATIME, 0xff))
.then(() => write(APDS9930_PTIME, 0xff))
.then(() => write(APDS9930_WTIME, 0xff))
.then(() => write(APDS9930_PPULSE, 1))
.then(() => write(0xf, 0 | 0x20 | 0 | 0))
.then(() => write(APDS9930_ENABLE, 8 | 4 | 2 | 1))
.then((data) => {
  console.log('Sleep');
  return sleep(12);
})
.then(() => read(1))
.then((data) => {
  console.log(data[0].toString(2));
  return sleep(12);
})
.then(() => {
  console.log('Reading data from CH0');
  return send(Buffer.from([AUTO_INCREMENT | APDS9930_Ch0DATAL]))
    .then((data) => {
      console.log('Reading', data);
      return read(1)
    })
    .catch(console.error)
})
.then((data) => {
  console.log('CH0: ', data[0].toString(), data[1].toString());
  // const ch0Value = data[0] + 256 * data[1];
  // console.log('CH0: ', ch0Value);

  return send(Buffer.from([AUTO_INCREMENT | APDS9930_Ch1DATAL])).then(() => read(1));
})
.then((data) => {
  console.log('CH1: ', data[0].toString(), data[1].toString());
  // const ch1Value = data[0] + 256 * data[1];
  // console.log('CH1: ', ch0Value);

  return send(Buffer.from([AUTO_INCREMENT | APDS9930_PDATAL])).then(() => read(1));
})
.then((data) => {
  console.log('Proximity: ', data[0].toString(), data[1].toString());
  // const proxValue = data[0] + 256 * data[1];
  // console.log('Proximity: ', ch0Value);

  console.log('Done');
})
.catch(console.error);
// transfer(new Buffer([APDS9930_ID]), 1)
/*
send(new Buffer([APDS9930_ID])).then(() => read(1))
  .then(data => {
    console.log('ID of sensor', data[0].toString(16), data[0].toString(2));

    return send(new Buffer([APDS9930_ENABLE | AUTO_INCREMENT])).then(() => read(1));
  })
  .then(data => {
    console.log('enable register value', data[0].toString(2));

    const register_value = 0x00;

    console.log('enabling value', register_value.toString(2));
    return send(new Buffer([APDS9930_ENABLE | AUTO_INCREMENT, register_value]));
  })
  .then(data => {
    // console.log('power on response', data[0]);

    // const register_value = 0x00 |= (1 << AMBIENT_LIGHT);
    // const enable = ON & 0x01;

    return send(new Buffer([APDS9930_STATUS | AUTO_INCREMENT])).then(() => read(1));
  })
  .then(data => {
    console.log('sensor status', data[0].toString(2));

    return send(new Buffer([APDS9930_ENABLE | AUTO_INCREMENT])).then(() => read(1));
  })
  .then(data => {
    console.log('enabled modes', data[0].toString(2));
  })
  .catch(console.error);
*/
/*
  .then(data => {
    console.log('mode enabled', data[0], AMBIENT_LIGHT);

    const value = data[0] |= (1 << AMBIENT_LIGHT);
    const enable = ON & 0x01;

    return send(new Buffer([APDS9930_ENABLE, value]));
  })
  .then(() => {
    return Promise.all([
      transfer(new Buffer([APDS9930_Ch0DATAL]), 1),
      transfer(new Buffer([APDS9930_Ch0DATAH]), 1),
    ]);
  })
  .then(data => {
    const [L, H] = data;
    console.log('Ch0 data', L[0], H[0]);
  })
*/
