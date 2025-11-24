#!/usr/bin/env node
import { TuyaOpenApiClient } from '@tuya/tuya-connector-nodejs';
import { spawn } from "child_process";
import { readFileSync } from 'fs';

// --- Tuya Config ---
const API_KEY = readFileSync(`${process.env.HOME}/scripts/auth/tuya-api.key`, 'utf8').trim();
const API_SECRET = readFileSync(`${process.env.HOME}/scripts/auth/tuya-api.secret`, 'utf8').trim();
const REGION = 'eu';

// --- Devices ---
const DEVICES = {
  led:     { id: 'bf5d15b4790c0d313aktzn', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
//  bulb1:   { id: 'bf6e935014ed7bc0fbqpjm', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
//  bulb2:   { id: 'bf6b60b62e8c124a3f0zxa', dps: 'switch_led', modeDps: 'work_mode', colorDps: 'colour_data' },
};

const COLORS = {
  magenta: '012d03e80064',
};

const client = new TuyaOpenApiClient({
  accessKey: API_KEY,
  secretKey: API_SECRET,
  baseUrl: REGION === 'eu' ? 'https://openapi.tuyaeu.com' : 'https://openapi.tuyain.com',
});

// --- Helper functions ---
async function sendCommand(device, body) {
  try {
    await client.request({
      path: `/v1.0/iot-03/devices/${device.id}/commands`,
      method: 'POST',
      body,
    });
  } catch (err) {
    console.error(`Tuya error (${device.id}):`, err.message || err);
  }
}

async function setBaseColor(device) {
  await sendCommand(device, {
    commands: [
      { code: device.modeDps, value: 'colour' },
      { code: device.colorDps, value: COLORS.magenta },
    ],
  });
}

async function turnOn(device) {
  await sendCommand(device, { commands: [{ code: device.dps, value: true }] });
}

async function turnOff(device) {
  await sendCommand(device, { commands: [{ code: device.dps, value: false }] });
}

async function all(action) {
  const tasks = Object.values(DEVICES).map(async (device) => {
    if (action === 'on') return turnOn(device);
    if (action === 'off') return turnOff(device);
    if (action === 'setcolor') return setBaseColor(device);
  });
  await Promise.all(tasks);
}

// --- Initialization ---
await all('setcolor');
await all('off');
console.log('💡 All devices set to magenta base color and turned off. Waiting for beats...');

// --- Audio Setup ---
const PULSE_SOURCE = "spotify";
const ffmpeg = spawn("ffmpeg", [
  "-f", "pulse",
  "-i", PULSE_SOURCE,
  "-ac", "2",
  "-f", "f32le",
  "-"
]);

const SKIP = 50;
const THRESHOLD = 0.12;
let lastKick = 0;
const REFRACTORY = 200; // ms
const FLASH_DURATION = 270; // ms

ffmpeg.stdout.on("data", chunk => {
  const floatSamples = new Float32Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 4);
  let bass = 0;
  const N = Math.floor(floatSamples.length / 4);
  for (let i = 0; i < N; i += SKIP) bass += Math.abs(floatSamples[i]);
  bass /= N / SKIP;

  const now = Date.now();
  if (bass > THRESHOLD && now - lastKick > REFRACTORY) {
    lastKick = now;
    console.log(`🎶 Kick detected! Flashing ON`);
    all('on');
    setTimeout(() => all('off'), FLASH_DURATION);
  }
});

ffmpeg.stderr.on("data", () => {});
ffmpeg.on("close", () => console.log("🛑 FFmpeg closed"));
