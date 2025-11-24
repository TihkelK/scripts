# SCRIPTS

## Usage:
* most scripts depend on the "/scripts" folder being located at ~/

## Contents:
* MAX-THE-LLM : Locally hosted LLM with built in commands.
* KIOSK : Tmux based TV kiosk showing every day things like time, calendar, spotify etc.

## Requirements
### APT install:
```
nodejs
npm
playerctl
tty-clock
pipx
pipewire-pulse
pulseaudio-utils
espeak-ng
cava

wireplumber
pavucontrol
libxml2-utils
libportaudio2
libportaudiocpp0
portaudio19-dev
```
### PIP install --break-system-packages
```
sounddevice
vosk
```

# mapscii setup
```
git clone https://github.com/rastapasta/mapscii.git
cd mapscii
nmp install
```
Also, for some reason ~/.mapscii/* and ~/.cache/mapscii-nodejs/* must be copied from the previous machine for it to work

# MAX setup:
```
systemctl --user enable --now pipewire pipewire-pulse
```
