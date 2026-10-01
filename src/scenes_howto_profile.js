// How-to #6 (new interface): profile and security. 9:16, 27.5 s, calm track.
// Home -> profile tab: Telegram ID and Email, then PIN, biometrics and the seed phrase.
'use strict';

howto({
  duration: 27.5, outT: 21.5, key: 4,
  title: 'ПРОФИЛЬ\nИ БЕЗОПАСНОСТЬ', sub: 'Защитите кошелёк за 3 шага', tagline: 'ВАШ КРИПТОКОШЕЛЁК ПОД ЗАЩИТОЙ',
  steps: [
    { t: 3.0, head: 'ОТКРОЙТЕ ПРОФИЛЬ', desc: 'Внизу экрана нажмите на&nbsp;значок человека&nbsp;— справа.' },
    { t: 8.5, head: 'ВАШИ ДАННЫЕ', desc: [
      [8.5, 'Ваш <b>Telegram&nbsp;ID</b>: по&nbsp;нему друзья из&nbsp;INCPT&nbsp;Wallet отправят вам деньги.'],
      [11.4, 'Нажмите <b>«Добавить»</b>, чтобы привязать Email.'],
    ] },
    { t: 13.8, head: 'ЗАЩИТИТЕ КОШЕЛЁК', desc: [
      [13.8, 'Включите <b>PIN</b> и&nbsp;<b>биометрию</b>&nbsp;— кошелёк откроете только вы.'],
      [17.6, '<b>Сид-фраза</b>&nbsp;— ключ к&nbsp;кошельку. Запишите её и&nbsp;никому не&nbsp;показывайте.'],
    ] },
  ],
  screens: {
    home: { img: 'home' },
    profile: { img: 'profile' },
  },
  flow: [[0, 'home'], [6.55, 'profile', 'fade']],
  lifts: [
    { cut: 'pf_ids', slot: 'pf_ids', group: 'profile', t0: 9.0, t1: 13.3, to: { y: -50, z: 170, s: 1.06 } },
    { cut: 'pf_sec', slot: 'pf_sec', group: 'profile', t0: 14.2, t1: 20.6, to: { y: -70, z: 170, s: 1.06 } },
  ],
  spot: [[4.7, 'tab_profile'], [6.7, null]],
  ptrIn: 4.2,
  path: H => [
    H.xy(3.0, 1500, 2600),
    H.at(5.6, 'tab_profile', 8, 8, 30, 1.2),
    H.onLift(9.9, 'pf_ids', 'pf_tgid', 250, 10, 0.9),
    H.onLift(12.0, 'pf_ids', 'pf_email', 290, 10, 0.8),
    H.onLift(15.2, 'pf_sec', 'pf_pin', 10, 10, 0.9),
    H.onLift(16.6, 'pf_sec', 'pf_bio', 10, 10, 0.7),
    H.onLift(18.4, 'pf_sec', 'pf_seed', 250, 10, 0.8),
  ],
  taps: [6.4],
});
