# SCRIPTS
### Info:
* most scripts depend on the "/scripts" folder being located at ~/

### Contents:
* MAX i.e. MAX-THE-LLM : Locally hosted LLM with built in commands.
* KSK i.e. KIOSK : Tmux based TV kiosk showing every day things like time, calendar, spotify etc.
* HTML i.e. curl|bash : Useful curl|bash type scripts.

<br>

## SETUP/INSTALL
- ## curl|bash
```
sudo rm -rf /var/www/html
sudo ln -s ~/scripts/html /var/www/html
```

- ## MAX and KSK
### Requirements:
- ### apt install [package]
```
nodejs npm playerctl tty-clock pipx pipewire-pulse pulseaudio-utils espeak-ng cava tmux

wireplumber pavucontrol libxml2-utils libportaudio2 libportaudiocpp0 portaudio19-dev
```
- ### pip install [package] --break-system-packages
```
sounddevice vosk
```

- ### mapscii setup
```
git clone https://github.com/rastapasta/mapscii.git
cd mapscii
npm install
```
Also, for some reason ~/.mapscii/* and ~/.cache/mapscii-nodejs/* must be copied from the previous machine for it to work

- ### pipewire setup
```
systemctl --user enable --now pipewire pipewire-pulse
```

- ### journalctl permission setup:
```
sudo usermod -aG systemd-journal $USER
```
relogin to force changes
