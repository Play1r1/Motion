// How-to #1 (new interface): how to top up the wallet. 9:16, 44 s, calm track.
// Home -> wallet tab -> «Получить» -> «Пополнение криптовалюты» sheet -> Tether -> network
// (TRC-20 / ERC-20, the address changes with it) -> copy the address; QR, «Поделиться», Telegram ID.
'use strict';

howto({
  duration: 44.0, outT: 38.0, key: 2,
  title: 'КАК ПОПОЛНИТЬ\nКОШЕЛЁК', sub: '5 простых шагов в INCPT Wallet', tagline: 'ПОПОЛНИТЬ КОШЕЛЁК СТАЛО ПРОЩЕ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ КОШЕЛЁК', desc: 'Внизу экрана нажмите на&nbsp;круглую кнопку в&nbsp;центре меню.' },
    { t: 8.0, head: 'НАЖМИТЕ «ПОЛУЧИТЬ»', desc: 'Откроется список монет, которые можно пополнить.' },
    { t: 13.0, head: 'ВЫБЕРИТЕ МОНЕТУ', desc: 'Доступны USDT, USDC, Bitcoin, Ethereum и&nbsp;TRON. Для примера выберем <b>Tether&nbsp;(USDT)</b>.' },
    { t: 19.5, head: 'ВЫБЕРИТЕ СЕТЬ', desc: [
      [19.5, '<b>TRC-20</b> или <b>ERC-20</b>: сеть должна совпадать с&nbsp;той, из&nbsp;которой вы отправляете монеты.'],
      [22.3, 'Адрес меняется вместе с&nbsp;сетью: в&nbsp;TRC-20 он начинается с&nbsp;<b>T</b>, в&nbsp;ERC-20&nbsp;— с&nbsp;<b>0x</b>.'],
      [25.6, 'Отправляйте только USDT в&nbsp;выбранной сети&nbsp;— иначе <b>монеты будут утеряны</b>.'],
    ] },
    { t: 28.5, head: 'СКОПИРУЙТЕ АДРЕС', desc: [
      [28.5, 'Нажмите на&nbsp;значок копирования и&nbsp;вставьте адрес там, откуда отправляете.'],
      [32.6, 'Или покажите <b>QR-код</b>, или нажмите <b>«Поделиться»</b>.'],
      [35.1, 'Другу из&nbsp;INCPT Wallet хватит вашего <b>Telegram&nbsp;ID</b>&nbsp;— без адреса и&nbsp;сети.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    wallet: { img: 'wallet' },
    pick: { sheet: 'sheet_receive', base: { img: 'wallet' } },
    trc: { img: 'receive_trc20' },
    erc: { img: 'receive_erc20' },
  },
  flow: [[0, 'home'], [6.55, 'wallet', 'fade'], [10.75, 'pick', 'sheet'], [18.35, 'trc', 'push'], [21.7, 'erc', 'swap'], [24.5, 'trc', 'swap']],
  lifts: [
    { cut: 'rc_toggle', alt: 'rc_toggle_erc', altKeys: [[21.65, 1], [24.45, 0]], slot: 'rc_toggle', groups: ['trc', 'erc'], t0: 20.0, t1: 25.2, to: { y: -60, z: 230, s: 1.6 } },
    { cut: 'rc_warn', slot: 'rc_warn', group: 'trc', t0: 25.65, t1: 28.15, to: { y: -150, z: 230, s: 1.15 } },
    { cut: 'rc_addr', slot: 'rc_addr', group: 'trc', t0: 29.0, t1: 32.4, to: { x: 20, y: -90, z: 120, s: 1.07 } },
    { cut: 'rc_tgid', slot: 'rc_tgid', group: 'trc', t0: 35.3, t1: 37.6, to: { y: -70, z: 120, s: 1.07 } },
  ],
  spot: [
    [4.7, 'tab_wallet'], [6.7, null],
    [9.0, 'w_recv'], [10.9, null],
    [13.6, 'sheet_usdt'], [14.3, 'sheet_usdc'], [15.0, 'sheet_btc'], [15.7, 'sheet_eth'], [16.4, 'sheet_trx'], [17.2, 'sheet_usdt'], [18.4, null],
    [32.8, 'rc_qr'], [33.9, 'rc_share'], [35.0, null],
  ],
  notes: [{ t0: 30.75, t1: 32.3, text: 'Адрес скопирован ✓', rect: 'rc_addr', dy: -340, z: 300 }],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_wallet', 10, 10, 30, 1.2),
    H.at(9.7, 'w_recv', 40, 10, 30, 1.1),
    H.at(14.0, 'sheet_usdt', 250, 0, 30, 0.9),
    H.at(14.7, 'sheet_usdc', 250, 0, 30, 0.5),
    H.at(15.4, 'sheet_btc', 250, 0, 30, 0.5),
    H.at(16.1, 'sheet_eth', 250, 0, 30, 0.5),
    H.at(16.8, 'sheet_trx', 250, 0, 30, 0.5),
    H.at(17.7, 'sheet_usdt', 250, 0, 30, 0.8),
    H.onLift(21.3, 'rc_toggle', 'rc_erc', 10, 10, 1.0),
    H.onLift(24.1, 'rc_toggle', 'rc_trc', 10, 10, 0.8),
    H.onLift(26.6, 'rc_warn', 'rc_warn', 300, 40, 0.9),
    H.onLift(30.2, 'rc_addr', 'rc_copy', 6, 6, 1.0),
    H.at(33.3, 'rc_qr', 150, 160, 30, 0.9),
    H.at(34.4, 'rc_share', 180, 0, 30, 0.8),
    H.onLift(36.1, 'rc_tgid', 'rc_tgid', 250, 10, 0.9),
  ],
  taps: [6.4, 10.6, 18.2, 21.6, 24.4, 30.6],
});
