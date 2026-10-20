'use strict';

// Shared, local-only arithmetic for the proposal and its verification.
const ProposalPricing = (() => {
  const rates = Object.freeze({base:147, reception:50, standard:197, unlimited:397, voice:0.29, reply:0.04, vat:0.21});
  const cents = value => Math.round((value + Number.EPSILON) * 100);
  function estimate({period='paid', plan='standard', voiceSeconds=0, replies=0, metaEUR=0}={}) {
    if (!['paid','initial'].includes(period) || !['standard','unlimited'].includes(plan)) throw new RangeError('Modalidad no válida');
    if (![voiceSeconds,replies].every(value=>Number.isSafeInteger(value)&&value>=0) || !Number.isFinite(metaEUR) || metaEUR<0) throw new RangeError('Consumos no válidos');
    const initial=period==='initial';
    const unlimited=!initial && plan==='unlimited';
    const fee=initial?0:unlimited?rates.unlimited:rates.standard;
    const extraSeconds=unlimited?0:Math.max(0,voiceSeconds-(initial?0:6000));
    const extraReplies=unlimited?0:Math.max(0,replies-(initial?0:500));
    const voiceCents=cents(extraSeconds*rates.voice/60);
    const replyCents=cents(extraReplies*rates.reply);
    const metaCents=cents(metaEUR);
    const walletCents=voiceCents+replyCents+metaCents;
    const netCents=fee*100+walletCents;
    const vatCents=Math.round(netCents*rates.vat);
    const standardNetCents=rates.standard*100+cents(Math.max(0,voiceSeconds-6000)*rates.voice/60)+cents(Math.max(0,replies-500)*rates.reply)+metaCents;
    const unlimitedNetCents=rates.unlimited*100+metaCents;
    return {fee,extraSeconds,extraReplies,voiceCents,replyCents,metaCents,walletCents,netCents,vatCents,totalCents:netCents+vatCents,standardNetCents,unlimitedNetCents};
  }
  return Object.freeze({rates,estimate});
})();
if (typeof module!=='undefined' && module.exports) module.exports=ProposalPricing;
