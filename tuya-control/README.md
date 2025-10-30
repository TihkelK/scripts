# TUYA-REMOTE

## Usage:
* ran with:
```
node ~/scripts/tuya-control/remote.js <device> <on|off|status|mode> [white|scene|color]
```
* color codes must be set manually by:
    1. turning on the device
    2. switch to the color desired from the smartlife app
    3. run the "status" command for that device
    4. copy the current color code
    5. add to the "remote.js" file (check how others are set)
