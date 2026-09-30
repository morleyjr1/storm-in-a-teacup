/*
  The personal bits. Everything here is optional: leave a line empty and the
  game carries on without it.
*/
window.FRIEND = {
  // Shown under the title.
  dedication: "For Luciano, who has never once flogged a dead horse. Only ducks.",

  // Their favourite biscuit becomes the top prize. The Jaffa Cake is already
  // Luciano's, so it stays as it is.
  topBiscuit: null,

  // Extra things the game sometimes says when they get one right.
  cheers: [
    "Correct! Not a single marble spilt.",
    "Spot on. Have a Jaffa Cake. Well, a cup of tea for now.",
    "Right first time. Luciano would have said it differently.",
    "Correct, and bone dry. Or stick dry, depending on who you ask."
  ],

  // What the house idioms are labelled as in the game.
  houseLabel: "Floridi original",

  // Luciano's mangled versions. They play like real idioms.
  houseIdioms: [
    { pre: "Flog a dead", word: "duck", post: "", emo: "🦆",
      decoys: [["horse", "🐴"], ["parrot", "🦜"]],
      meaning: "To waste effort on something hopeless, as a duck would tell you.",
      origin: "A Floridi blend of 'flog a dead horse' and 'a dead duck'. Both mean something is finished, so you could argue it is twice as correct.",
      rebus: "✋🦆💀" },
    { pre: "As dry as a", word: "stick", post: "", emo: "🪵",
      decoys: [["bone", "🦴"], ["biscuit", "🍪"]],
      meaning: "Very dry.",
      origin: "A Floridi original. Everyone else says 'dry as a bone', but a stick is also, to be fair, quite dry.",
      rebus: "🏜️🪵" },
    { pre: "Spill my", word: "marbles", post: "", emo: "🔮",
      decoys: [["beans", "🫘"], ["tea", "🍵"]],
      meaning: "Somewhere between revealing a secret and losing your mind. Possibly both at once.",
      origin: "A Floridi fusion of 'spill the beans' and 'lose my marbles'. Linguists call this a blend; his friends call it Tuesday.",
      rebus: "🫗🔮🔮" }
  ],

  // Special replies when a player picks Luciano's version of a real idiom.
  // Keyed by the idiom's id in idioms.js.
  mangles: {
    horse: { pick: "duck", say: "That's the Floridi edition. The rest of Britain flogs a horse." }
  },

  // A line at the bottom of the page.
  footer: "Made for Luciano Floridi. Several idioms were harmed in the making of this website."
};
