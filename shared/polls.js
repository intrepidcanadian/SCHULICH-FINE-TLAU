/* =============================================================
   Live Poll · question registry
   =============================================================
   Add new polls by appending to window.POLLS. Each entry is keyed
   by a stable poll id used in:
     - slide markup (data-poll-id="...")
     - voter URL (/vote/?poll=...)
     - storage / kvdb key

   Keep ids URL-safe (lowercase, dashes). Don't reuse an id across
   semesters if you want a fresh tally — bump the suffix instead.
   ============================================================= */

window.POLLS = {
  'ch1-revolution-evolution': {
    chapter: 1,
    question: 'Revolution or evolution?',
    prompt: 'Which paradigm best describes today’s fintech wave?',
    options: [
      { label: 'Revolution',   note: 'Disrupting the financial order' },
      { label: 'Evolution',    note: 'Continuation of Fintech 1.0–2.0' },
      { label: 'Both',         note: 'Revolution at the edges, evolution at the core' },
      { label: 'Too early',    note: 'The 2024–26 wave hasn’t resolved' },
    ],
  },
};
