#!/bin/zsh
# Abre a demo no Expo Go do simulador sem o aviso "Abrir com" e fotografa a tela.
# Uso: ./sim-open.sh "tema=terracota&estado=preenchido" saida.png [segundos de espera]
# Com o Metro em `npx expo start --port 8090`. REFY_SIM escolhe o simulador (padrão: o ligado).
export DEVELOPER_DIR=${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}
U=${REFY_SIM:-booted}
xcrun simctl terminate $U host.exp.Exponent 2>/dev/null
xcrun simctl spawn $U defaults write host.exp.Exponent EXKernelLaunchUrlDefaultsKey "exp://127.0.0.1:8090/--/?$1"
xcrun simctl launch $U host.exp.Exponent >/dev/null
sleep ${3:-12}
xcrun simctl io $U screenshot "$2" >/dev/null 2>&1 && echo "$2"
