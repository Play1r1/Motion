// Instagram reels (ig_*): short 9:16 loops at 120 BPM on the "drive" track.
// Every reel: a hook before the drop (2.0 s), three more beats of 2 s each, the brand end card at 8 s.
// Layout keeps to Instagram's safe area: headlines from y 240, products between y 600 and 1500
// (the caption and the action buttons cover the bottom and the right edge).
'use strict';

const IG = { drop: 2.0, end: 8.0, dur: 11.0, titleY: 240 };
// a short swell on every beat after the drop
const igKick = t => (t < IG.drop || t > IG.end ? 0 : Math.exp(-((t - IG.drop) % 0.5) / 0.09));
const outBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const igCut = name => new Cut($('#cam'), name, { onScreen: false });

function igSetup(key) {
  DURATION = IG.dur;
  META = { drop: IG.drop, end: IG.end, bpm: 120, music: 'drive', key };
}

// the four headlines of a reel: [text, tin, tout, size, stagger]
class IgTitles {
  constructor(list) {
    this.list = list.map(([text, tin, tout, size = 132, stagger = 0.08]) => ({ h: new Headline(text, { y: IG.titleY, size, fit: 990 }), tin, tout, stagger }));
    for (const l of this.list) l.n = l.h.words.length;
  }
  at(t) {
    for (const l of this.list) l.h.at(t, l.tin, l.tout, { stagger: l.stagger, dur: 0.45, outDur: 0.16, outStagger: 0.02, dy: 0.5 });
  }
}

// standard cue set: riser into the drop, impact + crash on it, a crash and fill on every section
function igCues(sections) {
  cue(0.0, 'riser', { dur: IG.drop - 0.02, gain: 0.45 });
  cue(IG.drop - 0.02, 'impact', { gain: 0.95 });
  cue(IG.drop, 'crash', { gain: 0.75 });
  sections.forEach(t => { cue(t - 0.5, 'fill', { n: 4, step: 0.125, gain: 0.5 }); cue(t, 'crash', { gain: 0.4, pan: t % 4 ? 0.4 : -0.4 }); });
  cue(IG.end - 0.5, 'fill', { n: 4, step: 0.125, gain: 0.55 });
}
