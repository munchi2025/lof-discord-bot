/**
 * Action Commands Configuration
 * OwO-style action commands with GIFs
 */

const path = require('path');
const fs = require('fs');

// Base path for local GIFs
const GIF_BASE_PATH = path.join(__dirname, '../assets/gifs');

/**
 * Action definitions organized by category
 * Each action has:
 * - category: The folder category
 * - emoji: Display emoji for the action
 * - messages: Array of message templates ({user} = sender, {target} = mentioned user)
 * - color: Embed color
 */
const actions = {
  // ==================== GAMING ACTIONS ====================
  score: {
    category: 'gaming',
    emoji: '🎯',
    color: 0xFFD700,
    messages: [
      '{user} scores on {target}! GG EZ!',
      '{user} just dunked on {target}!',
      '{target} got scored on by {user}!',
      '{user} puts {target} on the highlight reel!',
    ],
  },
  gg: {
    category: 'gaming',
    color: 0x50C878,
    messages: [
      '{user} says GG to {target}!',
      '{user} gives {target} a good game handshake!',
      'GG {target}! - {user}',
      '{user} respects {target}. Good game!',
    ],
  },
  rekt: {
    category: 'gaming',
    color: 0xFF4500,
    messages: [
      '{user} absolutely REKT {target}!',
      '{target} got destroyed by {user}!',
      'GET REKT {target}! - {user}',
      '{user} sends {target} back to the lobby!',
    ],
  },
  carry: {
    category: 'gaming',
    color: 0x9932CC,
    messages: [
      '{user} carries {target} to victory!',
      '{target} is being hard carried by {user}!',
      '{user} puts {target} on their back!',
      'Don\'t worry {target}, {user} has got you!',
    ],
  },
  clutch: {
    category: 'gaming',
    color: 0x00CED1,
    messages: [
      '{user} clutches it for {target}!',
      '{user} pulls off a clutch play for {target}!',
      'CLUTCH! {user} saves {target}!',
      '{user} is INSANE! Clutch for {target}!',
    ],
  },
  teabag: {
    category: 'gaming',
    color: 0x8B4513,
    messages: [
      '{user} teabags {target}! Disrespectful!',
      '{target} is getting teabagged by {user}!',
      '{user} asserts dominance over {target}!',
      'The disrespect! {user} teabags {target}!',
    ],
  },
  rage: {
    category: 'gaming',
    color: 0xFF0000,
    messages: [
      '{user} is RAGING at {target}!',
      '{user} threw their controller because of {target}!',
      '{target} made {user} rage quit!',
      '{user} is malding because of {target}!',
    ],
  },
  noob: {
    category: 'gaming',
    color: 0x808080,
    messages: [
      '{user} calls {target} a NOOB!',
      'Nice try, noob! - {user} to {target}',
      '{user} thinks {target} should uninstall!',
      'L2P {target}! - {user}',
    ],
  },
  camp: {
    category: 'gaming',
    color: 0x228B22,
    messages: [
      '{user} is camping {target}!',
      '{user} sets up a tent and waits for {target}!',
      '{target} got camped by {user}!',
      '{user} is a professional camper vs {target}!',
    ],
  },
  combo: {
    category: 'gaming',
    color: 0xFF6347,
    messages: [
      '{user} hits a sick combo on {target}!',
      'COMBO BREAKER! {user} destroys {target}!',
      '{user} combos {target} into oblivion!',
      '{target} couldn\'t escape {user}\'s combo!',
    ],
  },

  // ==================== AFFECTION ACTIONS ====================
  hug: {
    category: 'affection',
    color: 0xFFB6C1,
    messages: [
      '{user} hugs {target} warmly!',
      '{user} gives {target} a big hug!',
      '{target} receives a hug from {user}!',
      '{user} wraps their arms around {target}!',
    ],
  },
  pat: {
    category: 'affection',
    color: 0xFFE4B5,
    messages: [
      '{user} pats {target} on the head!',
      '{user} gives {target} headpats!',
      '*pat pat* {user} pats {target}!',
      '{target} receives headpats from {user}!',
    ],
  },
  cuddle: {
    category: 'affection',
    color: 0xFFB6C1,
    messages: [
      '{user} cuddles with {target}!',
      '{user} snuggles up to {target}!',
      '{target} is being cuddled by {user}!',
      '{user} and {target} cuddle together!',
    ],
  },
  poke: {
    category: 'affection',
    color: 0x87CEEB,
    messages: [
      '{user} pokes {target}!',
      '*poke poke* {user} pokes {target}!',
      '{user} keeps poking {target}!',
      '{target} got poked by {user}!',
    ],
  },
  boop: {
    category: 'affection',
    color: 0xFFC0CB,
    messages: [
      '{user} boops {target}\'s nose!',
      '*boop* {user} boops {target}!',
      '{user} gives {target} a nose boop!',
      '{target} got booped by {user}!',
    ],
  },
  wave: {
    category: 'affection',
    color: 0x87CEEB,
    messages: [
      '{user} waves at {target}!',
      '{user} waves hello to {target}!',
      '*wave wave* {user} greets {target}!',
      '{user} is waving at {target}!',
    ],
  },
  highfive: {
    category: 'affection',
    color: 0xFFD700,
    messages: [
      '{user} high-fives {target}!',
      '{user} and {target} high-five!',
      '*slap* {user} high-fives {target}!',
      '{target} receives a high-five from {user}!',
    ],
  },
  handhold: {
    category: 'affection',
    color: 0xFFB6C1,
    messages: [
      '{user} holds {target}\'s hand!',
      '{user} and {target} are holding hands!',
      '{user} reaches for {target}\'s hand!',
      'How lewd! {user} holds {target}\'s hand!',
    ],
  },
  snuggle: {
    category: 'affection',
    color: 0xDDA0DD,
    messages: [
      '{user} snuggles {target}!',
      '{user} snuggles up with {target}!',
      '{target} gets snuggled by {user}!',
      '{user} and {target} snuggle together!',
    ],
  },
  glomp: {
    category: 'affection',
    color: 0xFF69B4,
    messages: [
      '{user} glomps {target}!',
      '{user} tackle-hugs {target}!',
      '{target} got glomped by {user}!',
      '*GLOMP* {user} jumps on {target}!',
    ],
  },

  // ==================== AGGRESSIVE ACTIONS ====================
  slap: {
    category: 'aggressive',
    color: 0xFF4500,
    messages: [
      '{user} slaps {target}!',
      '{user} slaps {target} across the face!',
      '*SLAP* {user} hits {target}!',
      '{target} got slapped by {user}!',
    ],
  },
  punch: {
    category: 'aggressive',
    color: 0xFF0000,
    messages: [
      '{user} punches {target}!',
      '{user} throws a punch at {target}!',
      '*POW* {user} punches {target}!',
      '{target} receives a punch from {user}!',
    ],
  },
  kick: {
    category: 'aggressive',
    color: 0xFF4500,
    messages: [
      '{user} kicks {target}!',
      '{user} lands a kick on {target}!',
      '*KICK* {user} boots {target}!',
      '{target} got kicked by {user}!',
    ],
  },
  bonk: {
    category: 'aggressive',
    color: 0xFFD700,
    messages: [
      '{user} bonks {target}!',
      '{user} bonks {target} on the head!',
      '*BONK* Go to horny jail {target}!',
      '{target} got bonked by {user}!',
    ],
  },
  smack: {
    category: 'aggressive',
    color: 0xFF6347,
    messages: [
      '{user} smacks {target}!',
      '{user} gives {target} a smack!',
      '*SMACK* {user} hits {target}!',
      '{target} got smacked by {user}!',
    ],
  },
  bite: {
    category: 'aggressive',
    color: 0x8B0000,
    messages: [
      '{user} bites {target}!',
      '{user} takes a bite of {target}!',
      '*chomp* {user} bites {target}!',
      '{target} got bitten by {user}!',
    ],
  },
  yeet: {
    category: 'aggressive',
    color: 0x00CED1,
    messages: [
      '{user} yeets {target}!',
      '{user} yeets {target} into the void!',
      '*YEET* {user} throws {target}!',
      '{target} got yeeted by {user}!',
    ],
  },
  throw: {
    category: 'aggressive',
    color: 0x4682B4,
    messages: [
      '{user} throws something at {target}!',
      '{user} chucks something at {target}!',
      '*BONK* {user} throws at {target}!',
      '{target} got hit by {user}\'s throw!',
    ],
  },
  stab: {
    category: 'aggressive',
    color: 0x8B0000,
    messages: [
      '{user} stabs {target}!',
      '{user} shanks {target}!',
      '*stab stab* {user} attacks {target}!',
      '{target} got stabbed by {user}!',
    ],
  },
  shoot: {
    category: 'aggressive',
    color: 0x2F4F4F,
    messages: [
      '{user} shoots {target}!',
      '{user} goes pew pew at {target}!',
      '*BANG* {user} shoots {target}!',
      '{target} got shot by {user}!',
    ],
  },

  // ==================== BRATTY/NAUGHTY ACTIONS ====================
  spank: {
    category: 'bratty',
    color: 0xFF69B4,
    messages: [
      '{user} spanks {target}!',
      '{user} gives {target} a spank!',
      '*SMACK* {user} spanks {target}!',
      '{target} got spanked by {user}!',
    ],
  },
  ballkick: {
    category: 'bratty',
    color: 0xFF4500,
    messages: [
      '{user} kicks {target} in the balls!',
      '{user} goes for {target}\'s weak spot!',
      '*CRUNCH* {user} destroys {target}!',
      '{target} is now singing soprano thanks to {user}!',
    ],
  },
  wedgie: {
    category: 'bratty',
    color: 0xFFD700,
    messages: [
      '{user} gives {target} a wedgie!',
      '{user} pulls {target}\'s underwear!',
      '*YOINK* {user} wedgies {target}!',
      '{target} got a wedgie from {user}!',
    ],
  },
  bully: {
    category: 'bratty',
    color: 0x800080,
    messages: [
      '{user} bullies {target}!',
      '{user} is being mean to {target}!',
      '{user} picks on {target}!',
      '{target} is being bullied by {user}!',
    ],
  },
  tease: {
    category: 'bratty',
    color: 0xFF69B4,
    messages: [
      '{user} teases {target}!',
      '{user} is teasing {target}~',
      '{user} playfully teases {target}!',
      '{target} is being teased by {user}!',
    ],
  },
  lick: {
    category: 'bratty',
    color: 0xFF1493,
    messages: [
      '{user} licks {target}!',
      '{user} gives {target} a lick!',
      '*lick* {user} licks {target}!',
      '{target} got licked by {user}! Ew!',
    ],
  },
  grope: {
    category: 'bratty',
    color: 0xFF69B4,
    messages: [
      '{user} gropes {target}!',
      '{user} is being handsy with {target}!',
      '{user} cops a feel on {target}!',
      '{target} got groped by {user}!',
    ],
  },
  choke: {
    category: 'bratty',
    color: 0x8B0000,
    messages: [
      '{user} chokes {target}!',
      '{user} grabs {target} by the throat!',
      '{user} is choking {target}!',
      '{target} is being choked by {user}!',
    ],
  },
  sit: {
    category: 'bratty',
    color: 0xDDA0DD,
    messages: [
      '{user} sits on {target}!',
      '{user} uses {target} as a chair!',
      '{user} plops down on {target}!',
      '{target} is being sat on by {user}!',
    ],
  },
  trap: {
    category: 'bratty',
    color: 0x4B0082,
    messages: [
      '{user} traps {target}!',
      '{user} has trapped {target}!',
      '{target} fell into {user}\'s trap!',
      '{user} won\'t let {target} escape!',
    ],
  },

  // ==================== MEME/REACTION ACTIONS ====================
  cringe: {
    category: 'meme',
    color: 0x808080,
    messages: [
      '{user} cringes at {target}!',
      '{user} finds {target} cringe!',
      '{user} is cringing because of {target}!',
      'Cringe... {user} looks at {target}!',
    ],
  },
  stare: {
    category: 'meme',
    color: 0x4B0082,
    messages: [
      '{user} stares at {target}!',
      '{user} is staring intensely at {target}!',
      '*stare* {user} watches {target}!',
      '{user} gives {target} a menacing stare!',
    ],
  },
  judge: {
    category: 'meme',
    color: 0x696969,
    messages: [
      '{user} judges {target}!',
      '{user} is judging {target} silently!',
      '{user} gives {target} a judgy look!',
      '{target} is being judged by {user}!',
    ],
  },
  shame: {
    category: 'meme',
    color: 0x8B4513,
    messages: [
      '{user} shames {target}!',
      'Shame! Shame! {user} shames {target}!',
      '{user} rings the shame bell for {target}!',
      '{target} should be ashamed! - {user}',
    ],
  },
  flex: {
    category: 'meme',
    color: 0xFFD700,
    messages: [
      '{user} flexes on {target}!',
      '{user} is flexing hard on {target}!',
      '{user} shows off to {target}!',
      '{target} just got flexed on by {user}!',
    ],
  },
  mock: {
    category: 'meme',
    color: 0xFFA500,
    messages: [
      '{user} mocks {target}!',
      '{user} is mocking {target}!',
      '"{target}" - {user} (mocking)',
      '{user} makes fun of {target}!',
    ],
  },
  facepalm: {
    category: 'meme',
    color: 0x808080,
    messages: [
      '{user} facepalms at {target}!',
      '{user} can\'t believe {target}!',
      '*facepalm* {user} at {target}!',
      '{target} made {user} facepalm!',
    ],
  },
  disappoint: {
    category: 'meme',
    color: 0x4682B4,
    messages: [
      '{user} is disappointed in {target}!',
      '{user} expected better from {target}!',
      '{user} shakes head at {target}!',
      '{target} has disappointed {user}!',
    ],
  },
};

/**
 * Get a random GIF path for an action
 * @param {string} action - The action name
 * @returns {string|null} - Path to a random GIF or null if none found
 */
function getRandomGif(action) {
  const actionConfig = actions[action];
  if (!actionConfig) return null;

  const gifDir = path.join(GIF_BASE_PATH, actionConfig.category, action);

  try {
    if (!fs.existsSync(gifDir)) {
      return null;
    }

    const files = fs.readdirSync(gifDir).filter(file =>
      file.endsWith('.gif') || file.endsWith('.GIF')
    );

    if (files.length === 0) return null;

    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(gifDir, randomFile);
  } catch (error) {
    console.error(`Error reading GIF directory for ${action}:`, error);
    return null;
  }
}

/**
 * Get a random message for an action
 * @param {string} action - The action name
 * @param {string} user - The user who triggered the action
 * @param {string} target - The target of the action
 * @returns {string} - Formatted message
 */
function getRandomMessage(action, user, target) {
  const actionConfig = actions[action];
  if (!actionConfig) return `${user} used ${action} on ${target}!`;

  const messages = actionConfig.messages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return randomMessage
    .replace(/{user}/g, user)
    .replace(/{target}/g, target);
}

/**
 * Get action color
 * @param {string} action - The action name
 * @returns {number} - Hex color
 */
function getActionColor(action) {
  return actions[action]?.color || 0x7289DA;
}

/**
 * Get all action names
 * @returns {string[]} - Array of action names
 */
function getAllActions() {
  return Object.keys(actions);
}

/**
 * Check if an action exists
 * @param {string} action - The action name
 * @returns {boolean}
 */
function isValidAction(action) {
  return action in actions;
}

module.exports = {
  actions,
  getRandomGif,
  getRandomMessage,
  getActionColor,
  getAllActions,
  isValidAction,
  GIF_BASE_PATH,
};
