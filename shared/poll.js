/* =============================================================
   Live Poll · client API
   =============================================================
   Two modes:

   1) 'demo' (default) — same browser only.
      - Tallies live in localStorage.
      - BroadcastChannel + storage events sync across tabs.
      - Useful for development and same-laptop demo (open the slide
        and a few /vote/ tabs side-by-side).

   2) 'live' — across devices.
      - Uses a free anonymous key/value store at kvdb.io (no signup).
      - Setup (once):
          curl -L -d "" https://kvdb.io
        That command prints a bucket URL like
          https://kvdb.io/AbCdEf123XyZ
        Take the trailing id ("AbCdEf123XyZ") and set it below
        as POLL_CONFIG.bucket. Then set mode to 'live'.
      - Anyone with the bucket id can read/write. Fine for a class
        poll; rotate by creating a new bucket if needed.
      - Tallies are eventually consistent (last-writer-wins on the
        increment). For larger / higher-stakes polls switch the
        backend to Firestore using FieldValue.increment.

   Public API (window.PollClient):
     subscribePoll(pollId, onUpdate) -> unsubscribe()
       onUpdate({ tallies: { [optionIndex]: count, ... } })
     castVote(pollId, optionIndex) -> Promise<boolean>  (false if already voted)
     hasVoted(pollId) -> boolean
   ============================================================= */

(function () {
  const POLL_CONFIG = {
    mode: 'demo',          // 'demo' | 'live'
    bucket: '',            // e.g. 'AbCdEf123XyZ'
    pollIntervalMs: 1500,  // live-mode refresh
  };

  // ---------- common ----------
  function hasVoted(pollId) {
    return localStorage.getItem('poll_voted_' + pollId) !== null;
  }
  function markVoted(pollId, optionIndex) {
    localStorage.setItem('poll_voted_' + pollId, String(optionIndex));
  }
  function clearVote(pollId) {
    localStorage.removeItem('poll_voted_' + pollId);
  }

  // ---------- demo mode ----------
  function readDemo(pollId) {
    try {
      const raw = localStorage.getItem('poll_data_' + pollId);
      return raw ? JSON.parse(raw) : { tallies: {} };
    } catch {
      return { tallies: {} };
    }
  }
  function writeDemo(pollId, data) {
    localStorage.setItem('poll_data_' + pollId, JSON.stringify(data));
    try {
      const ch = new BroadcastChannel('poll_' + pollId);
      ch.postMessage(data);
      ch.close();
    } catch {}
  }
  function subscribeDemo(pollId, onUpdate) {
    onUpdate(readDemo(pollId));
    let bc = null;
    try {
      bc = new BroadcastChannel('poll_' + pollId);
      bc.onmessage = (e) => onUpdate(e.data || readDemo(pollId));
    } catch {}
    const onStorage = (e) => {
      if (e.key === 'poll_data_' + pollId) onUpdate(readDemo(pollId));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', onStorage);
    };
  }
  async function castDemo(pollId, optionIndex) {
    if (hasVoted(pollId)) return false;
    const data = readDemo(pollId);
    data.tallies[optionIndex] = (data.tallies[optionIndex] || 0) + 1;
    writeDemo(pollId, data);
    markVoted(pollId, optionIndex);
    return true;
  }

  // ---------- live mode (kvdb.io) ----------
  function liveUrl(pollId) {
    return 'https://kvdb.io/' + POLL_CONFIG.bucket + '/' + encodeURIComponent(pollId);
  }
  async function readLive(pollId) {
    try {
      const r = await fetch(liveUrl(pollId), { cache: 'no-store' });
      if (r.status === 404) return { tallies: {} };
      if (!r.ok) throw new Error('http ' + r.status);
      const text = await r.text();
      return text ? JSON.parse(text) : { tallies: {} };
    } catch (e) {
      console.warn('poll read failed', e);
      return { tallies: {} };
    }
  }
  async function writeLive(pollId, data) {
    try {
      await fetch(liveUrl(pollId), {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.warn('poll write failed', e);
    }
  }
  function subscribeLive(pollId, onUpdate) {
    let stopped = false;
    let timer = null;
    const tick = async () => {
      if (stopped) return;
      onUpdate(await readLive(pollId));
      if (!stopped) timer = setTimeout(tick, POLL_CONFIG.pollIntervalMs);
    };
    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }
  async function castLive(pollId, optionIndex) {
    if (hasVoted(pollId)) return false;
    const data = await readLive(pollId);
    data.tallies[optionIndex] = (data.tallies[optionIndex] || 0) + 1;
    await writeLive(pollId, data);
    markVoted(pollId, optionIndex);
    return true;
  }

  // ---------- dispatch ----------
  function isLive() {
    return POLL_CONFIG.mode === 'live' && POLL_CONFIG.bucket;
  }
  function subscribePoll(pollId, onUpdate) {
    return isLive()
      ? subscribeLive(pollId, onUpdate)
      : subscribeDemo(pollId, onUpdate);
  }
  function castVote(pollId, optionIndex) {
    return isLive()
      ? castLive(pollId, optionIndex)
      : castDemo(pollId, optionIndex);
  }

  window.PollClient = {
    subscribePoll,
    castVote,
    hasVoted,
    clearVote,
    config: POLL_CONFIG,
  };
})();
