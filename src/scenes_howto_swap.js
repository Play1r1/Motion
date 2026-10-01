// How-to #2 (new interface): how to swap crypto. 9:16, 40.5 s, calm track.
// Home -> wallet tab -> «Обменять» -> the swap screen: what you give / get, the ⇅ button, the amount
// (or 25 / 50 / 75 % / Макс), then the page scrolls to the rate and fees and the «Обменять» button.
'use strict';

howto({
  duration: 40.5, outT: 34.5, key: 5,
  title: 'КАК ОБМЕНЯТЬ\nКРИПТОВАЛЮТУ', sub: '5 простых шагов в INCPT Wallet', tagline: 'ОБМЕН КРИПТЫ В ПАРУ ТАПОВ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ КОШЕЛЁК', desc: 'Внизу экрана нажмите на&nbsp;круглую кнопку в&nbsp;центре меню.' },
    { t: 8.0, head: 'НАЖМИТЕ «ОБМЕНЯТЬ»', desc: 'Кнопка находится между «Получить» и&nbsp;«Отправить».' },
    { t: 13.0, head: 'ВЫБЕРИТЕ МОНЕТЫ', desc: [
      [13.0, 'Сверху&nbsp;— монета, которую вы <b>отдаёте</b>, снизу&nbsp;— которую <b>получаете</b>.'],
      [16.4, 'Нажмите на&nbsp;монету, чтобы выбрать другую. Кнопка <b>⇅</b> меняет их местами.'],
    ] },
    { t: 18.5, head: 'ВВЕДИТЕ СУММУ', desc: [
      [18.5, 'Впишите, сколько хотите обменять. Сверху видно, сколько <b>доступно</b>.'],
      [21.6, 'Или выберите долю баланса: <b>25%</b>, <b>50%</b>, <b>75%</b> или <b>Макс</b>.'],
    ] },
    { t: 25.5, head: 'ПРОВЕРЬТЕ И ОБМЕНЯЙТЕ', desc: [
      [25.5, 'Проверьте <b>курс</b>, <b>комиссию сети</b> и&nbsp;сумму в&nbsp;строке <b>«Вы получите»</b>.'],
      [30.8, 'Нажмите <b>«Обменять»</b>&nbsp;— кнопка станет активной, как только вы введёте сумму.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    wallet: { img: 'wallet' },
    swap: { page: 'page_swap', hdr: 'back' },
  },
  flow: [[0, 'home'], [6.55, 'wallet', 'fade'], [11.4, 'swap', 'push']],
  scroll: { swap: [[0, 0], [26.1, 0], [27.0, 298]] },
  lifts: [
    { cut: 'sw_table', slot: 'sw_table', group: 'swap', t0: 27.2, t1: 30.6, to: { y: -40, z: 150, s: 1.06 } },
  ],
  spot: [
    [4.7, 'tab_wallet'], [6.7, null],
    [9.0, 'w_swap'], [11.3, null],
    [13.6, 'sw_give_coin'], [15.0, 'sw_get_coin'], [16.6, 'sw_flip'], [18.3, null],
    [19.2, 'sw_amount'], [21.8, 'sw_25'], [22.5, 'sw_50'], [23.2, 'sw_75'], [23.9, 'sw_max'], [25.0, null],
    [31.0, 'sw_button'], [33.8, null],
  ],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_wallet', 10, 10, 30, 1.2),
    H.at(9.8, 'w_swap', 40, 10, 30, 1.1),
    H.at(13.9, 'sw_give_coin', 70, 10, 30, 1.0),
    H.at(15.3, 'sw_get_coin', 70, 10, 30, 0.8),
    H.at(16.9, 'sw_flip', 10, 14, 30, 0.8),
    H.at(19.6, 'sw_amount', 70, 0, 30, 0.9),
    H.at(22.0, 'sw_25', 30, 10, 30, 0.6),
    H.at(22.7, 'sw_50', 30, 10, 30, 0.5),
    H.at(23.4, 'sw_75', 30, 10, 30, 0.5),
    H.at(24.1, 'sw_max', 30, 10, 30, 0.5),
    H.onLift(28.2, 'sw_table', 'sw_table', 330, 150, 1.0),
    H.at(31.6, 'sw_button', 200, 10, 30, 1.0),
  ],
  taps: [6.4, 11.2],
});
