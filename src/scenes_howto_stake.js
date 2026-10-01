// How-to #4 (new interface): how to open staking. 9:16, 40.5 s, calm track.
// Home -> Stake tab: total + forecast, the amount ($10 – $20,000, +$50 / +$100 / +$500 / Макс),
// 20–40% APY and the one-year line, «Открыть стейкинг», then «Ваши депозиты».
'use strict';

howto({
  duration: 40.5, outT: 34.5, key: 0,
  title: 'КАК ОТКРЫТЬ\nСТЕЙКИНГ', sub: '5 простых шагов в INCPT Wallet', tagline: 'СТЕЙКИНГ USDT · 20–40% ГОДОВЫХ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ СТЕЙКИНГ', desc: [
      [3.0, 'Внизу экрана нажмите на&nbsp;значок <b>Stake</b>&nbsp;— со&nbsp;стрелкой вверх.'],
      [7.2, 'Сверху&nbsp;— сколько у&nbsp;вас в&nbsp;стейкинге и&nbsp;прогноз дохода <b>на&nbsp;сегодня</b>.'],
    ] },
    { t: 9.0, head: 'ВВЕДИТЕ СУММУ', desc: [
      [9.0, 'Сумма&nbsp;— от&nbsp;<b>$10</b> до&nbsp;<b>$20&nbsp;000</b>. Впишите её в&nbsp;поле.'],
      [12.6, 'Или добавляйте кнопками <b>+$50</b>, <b>+$100</b>, <b>+$500</b> и&nbsp;<b>Макс</b>.'],
    ] },
    { t: 16.3, head: 'СМОТРИТЕ ДОХОД', desc: [
      [16.3, 'Liquid Vault приносит <b>20–40%</b> годовых.'],
      [18.8, 'В строке ниже видно, сколько вы получите <b>через год</b>.'],
    ] },
    { t: 22.2, head: 'НАЖМИТЕ «ОТКРЫТЬ СТЕЙКИНГ»', desc: 'Кнопка станет активной, когда вы введёте сумму от&nbsp;$10.' },
    { t: 27.0, head: 'СЛЕДИТЕ ЗА ДЕПОЗИТОМ', desc: [
      [27.0, 'Открытый депозит появится в&nbsp;разделе <b>«Ваши депозиты»</b>.'],
      [31.0, 'В Liquid Vault пополнять и&nbsp;выводить можно в&nbsp;любой момент&nbsp;— в&nbsp;пределах <b>20&nbsp;000&nbsp;USDT</b>.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    stake: { page: 'page_stake', hdr: 'close', bar: 'bar_stake' },
  },
  flow: [[0, 'home'], [6.55, 'stake', 'fade']],
  scroll: { stake: [[0, 0], [27.4, 0], [28.6, 1531]] },
  lifts: [
    { cut: 'st_amount', slot: 'st_amount', group: 'stake', t0: 9.5, t1: 12.4, to: { y: -60, z: 180, s: 1.12 } },
    { cut: 'st_year', slot: 'st_year', group: 'stake', t0: 19.0, t1: 21.8, to: { y: -70, z: 170, s: 1.12 } },
    { cut: 'st_btn', slot: 'st_btn', group: 'stake', t0: 22.6, t1: 26.5, to: { y: -30, z: 200, s: 1.08 } },
    { cut: 'st_deposit', slot: 'st_deposit', group: 'stake', t0: 28.9, t1: 33.6, to: { y: -60, z: 170, s: 1.08 } },
  ],
  spot: [
    [4.7, 'tab_stake'], [6.7, null],
    [7.4, 'st_total'], [8.8, null],
    [12.8, 'st_50'], [13.5, 'st_100'], [14.2, 'st_500'], [14.9, 'st_max'], [16.0, null],
    [16.6, 'st_apy'], [18.6, null],
  ],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_stake', 8, 8, 30, 1.2),
    H.at(7.9, 'st_total', 160, 40, 30, 0.9),
    H.onLift(10.4, 'st_amount', 'st_amount', 150, 40, 1.0),
    H.at(13.0, 'st_50', 20, 10, 30, 0.7),
    H.at(13.7, 'st_100', 20, 10, 30, 0.5),
    H.at(14.4, 'st_500', 20, 10, 30, 0.5),
    H.at(15.1, 'st_max', 20, 10, 30, 0.5),
    H.at(16.9, 'st_apy', 60, 10, 30, 0.8),
    H.onLift(19.8, 'st_year', 'st_year', 250, 10, 0.9),
    H.onLift(23.6, 'st_btn', 'st_btn', 220, 20, 1.0),
    H.onLift(29.8, 'st_deposit', 'st_deposit', 250, 60, 1.0),
  ],
  taps: [6.4],
});
