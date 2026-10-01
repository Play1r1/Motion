// How-to #3 (new interface): how to send crypto. 9:16, 40.5 s, calm track.
// Home -> wallet tab -> «Отправить» -> «Выберите монету» sheet -> Tether -> the send screen:
// network, recipient (address or Telegram ID, or scan), amount (keypad or MAX), «Отправить».
'use strict';

howto({
  duration: 40.5, outT: 34.5, key: 7,
  title: 'КАК ОТПРАВИТЬ\nКРИПТОВАЛЮТУ', sub: '5 простых шагов в INCPT Wallet', tagline: 'ПЕРЕВОДЫ КРИПТЫ ЗА МИНУТУ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ КОШЕЛЁК', desc: 'Внизу экрана нажмите на&nbsp;круглую кнопку в&nbsp;центре меню.' },
    { t: 8.0, head: 'НАЖМИТЕ «ОТПРАВИТЬ»', desc: 'Кнопка справа, под балансом кошелька.' },
    { t: 13.0, head: 'ВЫБЕРИТЕ МОНЕТУ', desc: 'Выберите, что хотите отправить. Для примера&nbsp;— <b>Tether&nbsp;(USDT)</b>.' },
    { t: 19.5, head: 'УКАЖИТЕ ПОЛУЧАТЕЛЯ', desc: [
      [19.5, 'Выберите сеть&nbsp;— <b>такую&nbsp;же</b>, как у&nbsp;адреса получателя: TRC-20 или ERC-20.'],
      [22.8, 'Вставьте <b>адрес</b> получателя или его <b>Telegram&nbsp;ID</b>, если он в&nbsp;INCPT&nbsp;Wallet.'],
      [26.4, 'Или нажмите на&nbsp;значок справа и&nbsp;<b>отсканируйте QR-код</b>.'],
    ] },
    { t: 28.5, head: 'ВВЕДИТЕ СУММУ', desc: [
      [28.5, 'Наберите сумму на&nbsp;клавиатуре или нажмите <b>MAX</b>, чтобы отправить всё доступное.'],
      [31.6, 'Проверьте данные и&nbsp;нажмите <b>«Отправить»</b>.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    wallet: { img: 'wallet' },
    pick: { sheet: 'sheet_send', base: { img: 'wallet' } },
    send: { img: 'send' },
  },
  flow: [[0, 'home'], [6.55, 'wallet', 'fade'], [10.75, 'pick', 'sheet'], [18.35, 'send', 'push']],
  lifts: [
    { cut: 'sd_toggle', slot: 'sd_toggle', group: 'send', t0: 20.0, t1: 22.6, to: { x: 60, y: -60, z: 230, s: 1.5 } },
    { cut: 'sd_addr', slot: 'sd_addr', group: 'send', t0: 23.0, t1: 26.3, to: { y: -60, z: 150, s: 1.06 } },
  ],
  spot: [
    [4.7, 'tab_wallet'], [6.7, null],
    [9.0, 'w_send'], [10.9, null],
    [13.6, 'sheet_usdt'], [14.3, 'sheet_usdc'], [15.0, 'sheet_btc'], [15.7, 'sheet_eth'], [16.4, 'sheet_trx'], [17.2, 'sheet_usdt'], [18.4, null],
    [26.6, 'sd_scan'], [29.0, 'sd_keypad'], [30.4, 'sd_max'], [31.8, 'sd_button'], [34.0, null],
  ],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_wallet', 10, 10, 30, 1.2),
    H.at(9.8, 'w_send', 40, 10, 30, 1.1),
    H.at(14.0, 'sheet_usdt', 250, 0, 30, 0.9),
    H.at(14.7, 'sheet_usdc', 250, 0, 30, 0.5),
    H.at(15.4, 'sheet_btc', 250, 0, 30, 0.5),
    H.at(16.1, 'sheet_eth', 250, 0, 30, 0.5),
    H.at(16.8, 'sheet_trx', 250, 0, 30, 0.5),
    H.at(17.7, 'sheet_usdt', 250, 0, 30, 0.8),
    H.onLift(21.0, 'sd_toggle', 'sd_toggle', 60, 10, 1.0),
    H.onLift(24.0, 'sd_addr', 'sd_addr', 100, 10, 1.0),
    H.at(27.0, 'sd_scan', 8, 8, 30, 0.8),
    H.at(29.6, 'sd_keypad', 150, 100, 30, 0.9),
    H.at(30.8, 'sd_max', 20, 10, 30, 0.8),
    H.at(32.3, 'sd_button', 150, 10, 30, 0.9),
  ],
  taps: [6.4, 10.6, 18.2],
});
