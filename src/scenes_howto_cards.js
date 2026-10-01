// How-to #5 (new interface): your cards. 9:16, 31.5 s, calm track.
// Home -> cards tab: the cards' balance and today's movement, the card itself, then scroll to
// «Добавить карту» (virtual or metal).
'use strict';

howto({
  duration: 31.5, outT: 25.5, key: 3,
  title: 'ВАШИ КАРТЫ\nINCPT', sub: 'Баланс, карта и новая карта за 4 шага', tagline: 'AI-КРИПТОКОШЕЛЁК И КАРТЫ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ КАРТЫ', desc: 'Внизу экрана нажмите на&nbsp;значок карты&nbsp;— второй слева.' },
    { t: 8.5, head: 'БАЛАНС КАРТ', desc: [
      [8.5, 'Сверху&nbsp;— общий баланс всех ваших карт.'],
      [10.7, 'Ниже&nbsp;— движение за&nbsp;сегодня: <b>пополнения</b> и&nbsp;<b>траты</b>.'],
    ] },
    { t: 13.0, head: 'ВАША КАРТА', desc: 'Карта INCPT: её баланс и&nbsp;последние цифры номера.' },
    { t: 18.0, head: 'ДОБАВЬТЕ КАРТУ', desc: [
      [18.0, 'Пролистайте ниже и&nbsp;нажмите <b>«Добавить карту»</b>.'],
      [21.6, 'Можно выпустить <b>виртуальную</b> или <b>металлическую</b> карту.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    cards: { page: 'page_cards', hdr: 'close', bar: 'bar_cards' },
  },
  flow: [[0, 'home'], [6.55, 'cards', 'fade']],
  scroll: { cards: [[0, 0], [19.4, 0], [20.4, 450]] },
  lifts: [
    { cut: 'cd_card', slot: 'cd_card', group: 'cards', t0: 13.4, t1: 17.0, to: { y: -80, z: 200, s: 1.05 } },
  ],
  spot: [
    [4.7, 'tab_cards'], [6.7, null],
    [8.9, 'cd_balance'], [10.9, 'cd_today'], [12.8, null],
    [20.6, 'cd_add'], [25.0, null],
  ],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_cards', 8, 8, 30, 1.2),
    H.at(9.3, 'cd_balance', 120, 30, 30, 0.9),
    H.at(11.3, 'cd_today', 120, 10, 30, 0.8),
    H.at(13.3, 'cd_today', 330, -70, 30, 0.6),
    H.onLift(14.6, 'cd_card', 'cd_card', 200, 100, 1.0),
    H.at(21.0, 'cd_add', 60, 20, 30, 0.9),
  ],
  taps: [6.4],
});
