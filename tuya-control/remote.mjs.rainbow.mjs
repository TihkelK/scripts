#!/usr/bin/env node
import { TuyaOpenApiClient } from '@tuya/tuya-connector-nodejs';
import { spawn } from "child_process";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Tuya config
const API_KEY = readFileSync(`${process.env.HOME}/scripts/auth/tuya-api.key`, 'utf8').trim();
const API_SECRET = readFileSync(`${process.env.HOME}/scripts/auth/tuya-api.secret`, 'utf8').trim();
const REGION = 'eu';
const DEVICE = { id: 'bf5d15b4790c0d313aktzn', colorDps: 'colour_data', modeDps: 'work_mode' }; // your LED

const client = new TuyaOpenApiClient({
  accessKey: API_KEY,
  secretKey: API_SECRET,
  baseUrl: REGION === 'eu' ? 'https://openapi.tuyaeu.com' : 'https://openapi.tuyain.com'
});

const COLORS = {
  red: '000003e8000a',
  blue: '00f003e80064',
  magenta: '012d03e80064',
  orangeled: '000303e801ef',
  whiteled: '0013029703e8',
};

async function setColor(colorName) {
  try {
    await client.request({
      path: `/v1.0/iot-03/devices/${DEVICE.id}/commands`,
      method: 'POST',
      body: {
        commands: [
          { code: DEVICE.modeDps, value: 'colour' },
          { code: DEVICE.colorDps, value: COLORS[colorName] }
        ]
      }
    });
  } catch (err) {
    console.error('Tuya error:', err.message || err);
  }
}

// Audio setup
const PULSE_SOURCE = "spotify";
const COLORS_ORDER = ["red", "blue", "magenta", "orangeled", "whiteled"];
let colorIndex = 0;

const ffmpeg = spawn("ffmpeg", [
  "-f", "pulse",
  "-i", PULSE_SOURCE,
  "-ac", "2",
  "-f", "f32le",
  "-"
]);

const SKIP = 50;
const THRESHOLD = 0.11;
let lastKick = 0;
const REFRACTORY = 200; // ms

ffmpeg.stdout.on("data", chunk => {
  const floatSamples = new Float32Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 4);
  let bass = 0;
  const N = Math.floor(floatSamples.length / 4);
  for (let i = 0; i < N; i += SKIP) bass += Math.abs(floatSamples[i]);
  bass /= N / SKIP;

  const now = Date.now();
  if (bass > THRESHOLD && now - lastKick > REFRACTORY) {
    lastKick = now;
    const color = COLORS_ORDER[colorIndex];
    colorIndex = (colorIndex + 1) % COLORS_ORDER.length;

    console.log(`🎶 Kick detected! Changing LED to ${color}`);
    setColor(color);
  }
});

ffmpeg.stderr.on("data", () => {});
ffmpeg.on("close", () => console.log("🛑 FFmpeg closed"));
