#!/usr/bin/env node
const { TuyaOpenApiClient } = require('@tuya/tuya-connector-nodejs');
const { execSync } = require('child_process');

const API_KEY = execSync(`cat ${process.env.HOME}/scripts/auth/tuya-api.key`, { encoding: 'utf8' }).trim();
const API_SECRET = execSync(`cat ${process.env.HOME}/scripts/auth/tuya-api.secret`, { encoding: 'utf8' }).trim();
const REGION = 'eu';

const DEVICES = {
  'bulb-1': { id: 'bf6e935014ed7bc0fbqpjm', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
  'bulb-2': { id: 'bf6b60b62e8c124a3f0zxa', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
  'led': { id: 'bf5d15b4790c0d313aktzn', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
  'pluh-1': { id: 'bf432551fd7c1c8a7293kp', dps: 'switch_1' },
  'pluh-2': { id: 'bf0d243cd14f3e3917jygi', dps: 'switch_1' },
};

const COLORS = {
  red: '000003e8000a',
  blue: '00f003e80064',
  magenta: '012d03e80064',
  orangeled: '000303e801ef',
  orangebulb: '000f03e80334',
  blueled: '00b403e80093',
  bluebulb: '00f103e801f4',
  whiteled: '0013029703e8',
};

const SCENES = {
  purpleled: 'c91c1c02016503e803e8000000001c1c02013103e803e800000000',
  purplebulb: '00303002014703e803e80000000030300200fa03e803e800000000',
  disco: '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  hardcore: 'cc646401000003e803e800000000646401005803e803e800000000646401011e03e803e80000000064640100ed03e803e80000000064640100bc03e803e800000000646401001d03e803e800000000646401010e03e803e800000000646401003c02a003e800000000',
};

const client = new TuyaOpenApiClient({
  accessKey: API_KEY,
  secretKey: API_SECRET,
  baseUrl: REGION === 'eu' ? 'https://openapi.tuyaeu.com' : 'https://openapi.tuyain.com'
});

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node remote.js <device> <on|off|status|mode> [white|scene|color]');
  process.exit(1);
}

const [deviceName, action, param, colorName] = args;
const device = DEVICES[deviceName];
if (!device) {
  console.log('Unknown device. Choose "bulb-1", "bulb-2", "led", or "plug".');
  process.exit(1);
}

async function sendCommand(code, value) {
  await client.request({
    path: `/v1.0/iot-03/devices/${device.id}/commands`,
    method: 'POST',
    body: { commands: [{ code, value }] }
  });
}

async function getStatus() {
  const res = await client.request({
    path: `/v1.0/iot-03/devices/${device.id}/status`,
    method: 'GET'
  });
  console.log('Full device status:', JSON.stringify(res.data.result, null, 2));
}

(async () => {
  try {
    if (action === 'on') {
      await sendCommand(device.dps, true);
      console.log(`✅ ${deviceName} turned ON!`);
    } else if (action === 'off') {
      await sendCommand(device.dps, false);
      console.log(`✅ ${deviceName} turned OFF!`);
    } else if (action === 'status') {
      await getStatus();
    } else if (action === 'mode') {
  if (!device.modeDps) {
    console.log('⚠️ This device does not support mode changes.');
    return;
  }
  if (!param || !['white','scene','color'].includes(param)) {
    console.log('Specify mode: white, scene, or color');
    return;
  }

  if (param.toLowerCase() === 'color') {
    await sendCommand(device.modeDps, 'colour');
    if (colorName && COLORS[colorName.toLowerCase()]) {
      await sendCommand(device.colorDps, COLORS[colorName.toLowerCase()]);
      console.log(`✅ ${deviceName} set to color mode: ${colorName}!`);
    } else {
      console.log(`✅ ${deviceName} set to color mode!`);
    }
  } else if (param.toLowerCase() === 'scene') {
    await sendCommand(device.modeDps, 'scene');
    if (colorName && SCENES[colorName.toLowerCase()]) {
      await sendCommand('scene_data', SCENES[colorName.toLowerCase()]);
      console.log(`✅ ${deviceName} set to scene: ${colorName}!`);
    } else {
      console.log(`✅ ${deviceName} set to scene mode!`);
    }
  } else {
    await sendCommand(device.modeDps, param.toLowerCase());
    console.log(`✅ ${deviceName} set to ${param} mode!`);
  }




    } else {
      console.log('Unknown action. Use on/off/status/mode.');
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  }
})();
