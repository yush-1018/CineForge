export interface OfflineDirectorContext {
  prompt: string;
  projectTitle: string;
  genre: string;
  globalNarrative: string;
  shots: Array<{
    shot_id: string;
    duration_seconds: number;
    camera_movement: string;
    visual_description: string;
    speaker: string;
    dialogue: string;
  }>;
  characters: Array<{
    character_id: string;
    name: string;
    role: string;
    gender: 'male' | 'female';
    visual_description: string;
    image_url: string;
  }>;
  voiceovers: Array<{
    shot_id: string;
    speaker: string;
    dialogue: string;
    audio_url: string;
    duration_seconds: number;
    gender: 'male' | 'female';
  }>;
  videoShots: Array<{
    shot_id: string;
    speaker: string;
    dialogue: string;
    video_url: string;
    thumbnail_url: string;
    prompt: string;
    duration_seconds: number;
    status: 'completed';
  }>;
}

const STOP_WORDS = new Set([
  'A', 'An', 'The', 'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'And', 'Or', 'But',
  'Create', 'Make', 'Generate', 'Write', 'Build', 'Film', 'Movie', 'Trailer', 'Video',
  'Story', 'Scene', 'About', 'Into', 'From', 'Under', 'Over', 'After', 'Before',
  'Act', 'Shot', 'Part', 'Chapter', 'CineForge', 'Director', 'Please'
]);

function extractCustomNames(prompt: string): string[] {
  const matches = prompt.match(/\b[A-Z][a-z]{2,15}\b/g) || [];
  const unique: string[] = [];
  for (const m of matches) {
    if (!STOP_WORDS.has(m) && !unique.includes(m)) {
      unique.push(m);
    }
  }
  return unique.slice(0, 2);
}

function detectGenreProfile(promptLower: string) {
  if (/(cyber|neon|space|mars|galaxy|sci-fi|scifi|robot|ai|android|future|orbit|colony)/.test(promptLower)) {
    return {
      genre: 'Sci-Fi Thriller',
      lighting: 'neon rim-lighting, volumetric haze, anamorphic lens flare',
      leadDefault: 'Kaelen',
      leadRole: 'Lead Protagonist',
      leadDesc: 'Tactical pilot in sleek carbon-weave flight gear',
      leadImg: '/solaris.jpg',
      antagDefault: 'Vesper',
      antagRole: 'Rival Operative',
      antagDesc: 'Enigmatic strategist with holographic visor and dark trench coat',
      antagImg: '/shadow_weaver.jpg',
    };
  }
  if (/(detective|noir|crime|murder|police|rain|mumbai|delhi|city|heist|mafia|spy|agent)/.test(promptLower)) {
    return {
      genre: 'Neo-Noir Crime Thriller',
      lighting: 'moody rain-slicked reflections, warm sodium streetlamps, deep shadows',
      leadDefault: 'Arjun',
      leadRole: 'Lead Investigator',
      leadDesc: 'Sharp-eyed detective in a weathered trench coat under monsoon rain',
      leadImg: '/malakor.jpg',
      antagDefault: 'Meera',
      antagRole: 'Key Informant',
      antagDesc: 'Composed insider with guarded motives and sharp gaze',
      antagImg: '/titaness.jpg',
    };
  }
  if (/(temple|magic|dragon|king|queen|sword|ancient|myth|forest|castle|fantasy|god|warrior)/.test(promptLower)) {
    return {
      genre: 'Epic Mythic Fantasy',
      lighting: 'golden-hour sunbeams piercing mist, dramatic chiaroscuro',
      leadDefault: 'Aarav',
      leadRole: 'Chosen Guardian',
      leadDesc: 'Battle-worn protector bearing ancient engraved armor',
      leadImg: '/aero.jpg',
      antagDefault: 'Lyra',
      antagRole: 'Oracle / Shadow Mage',
      antagDesc: 'Mystic weaver cloaked in obsidian silk with glowing runes',
      antagImg: '/shadow_weaver.jpg',
    };
  }
  if (/(horror|ghost|haunted|curse|nightmare|monster|dark|zombie|fear)/.test(promptLower)) {
    return {
      genre: 'Atmospheric Horror',
      lighting: 'cold moonlight, flickering tungsten shadows, eerie fog',
      leadDefault: 'Elena',
      leadRole: 'Survivor',
      leadDesc: 'Resourceful protagonist navigating shadowy corridors with a lantern',
      leadImg: '/titaness.jpg',
      antagDefault: 'Draven',
      antagRole: 'The Entity / Hunter',
      antagDesc: 'Silhouette shrouded in mist with piercing gaze',
      antagImg: '/malakor.jpg',
    };
  }
  return {
    genre: 'Cinematic Drama',
    lighting: 'naturalistic golden-hour cinematography, shallow depth of field',
    leadDefault: 'Rohan',
    leadRole: 'Lead Protagonist',
    leadDesc: 'Determined central figure shaped by the stakes of the story',
    leadImg: '/solaris.jpg',
    antagDefault: 'Tara',
    antagRole: 'Counterpart',
    antagDesc: 'Charismatic foil whose choices drive the turning point',
    antagImg: '/aero.jpg',
  };
}

export function buildOfflineContext(
  rawPrompt: string,
  projectTitle: string,
  targetDurationSeconds: number
): OfflineDirectorContext {
  const cleanPrompt = rawPrompt.trim();
  const title = (projectTitle && projectTitle !== 'CineForge Studio Project')
    ? projectTitle
    : cleanPrompt.slice(0, 48);

  const profile = detectGenreProfile(cleanPrompt.toLowerCase());
  const customNames = extractCustomNames(cleanPrompt);
  const leadName = customNames[0] || profile.leadDefault;
  const secondName = customNames[1] || profile.antagDefault;

  const shotDuration = Math.max(4, Math.min(8, Math.round((targetDurationSeconds || 60) / 10)));

  const globalNarrative = `${title} — ${profile.genre}. Set around "${cleanPrompt}", the story follows ${leadName} and ${secondName} through an escalating sequence of high-stakes cinematic moments bathed in ${profile.lighting}.`;

  const shots = [
    {
      shot_id: 'shot_1',
      duration_seconds: shotDuration,
      camera_movement: 'Wide aerial push-in establishing shot',
      visual_description: `EXT. OPENING ESTABLISHING SHOT — ${cleanPrompt}. Sweeping 24fps camera glides into the heart of the scene with ${profile.lighting}, ultra-detailed 8K cinematography.`,
      speaker: 'Narrator',
      dialogue: `It began with ${cleanPrompt.charAt(0).toLowerCase() + cleanPrompt.slice(1).replace(/\.$/, '')}. Nobody expected what would happen next.`,
    },
    {
      shot_id: 'shot_2',
      duration_seconds: shotDuration,
      camera_movement: 'Intimate over-the-shoulder tracking shot',
      visual_description: `MED. CHARACTER CONFRONTATION — ${leadName} steps forward into the frame, reacting to the unfolding tension of "${cleanPrompt}", rendered with ${profile.lighting}.`,
      speaker: leadName,
      dialogue: `If we don't act right now, everything we fought for disappears.`,
    },
    {
      shot_id: 'shot_3',
      duration_seconds: shotDuration,
      camera_movement: 'Dramatic low-angle dolly-out climax',
      visual_description: `CLIMAX WIDE & CLOSE-UP — ${leadName} and ${secondName} face the decisive moment of "${cleanPrompt}" as the score swells and light cuts through the frame.`,
      speaker: secondName,
      dialogue: `Then let's finish what we started — together, no turning back.`,
    },
  ];

  const characters = [
    {
      character_id: 'char_1',
      name: leadName,
      role: profile.leadRole,
      gender: 'male' as const,
      visual_description: `${profile.leadDesc}, tailored for "${cleanPrompt}". Consistent facial geometry and ${profile.lighting}.`,
      image_url: profile.leadImg,
    },
    {
      character_id: 'char_2',
      name: secondName,
      role: profile.antagRole,
      gender: 'female' as const,
      visual_description: `${profile.antagDesc}, tailored for "${cleanPrompt}". Consistent wardrobe and ${profile.lighting}.`,
      image_url: profile.antagImg,
    },
  ];

  const voiceovers = shots.map((s, idx) => ({
    shot_id: s.shot_id,
    speaker: s.speaker,
    dialogue: s.dialogue,
    audio_url: '',
    duration_seconds: s.duration_seconds,
    gender: idx === 2 ? ('female' as const) : ('male' as const),
  }));

  const videoClips = ['/Card_1_Video.mp4', '/Card_2_Video.mp4', '/Card_1_Video.mp4'];
  const videoShots = shots.map((s, idx) => ({
    shot_id: s.shot_id,
    speaker: s.speaker,
    dialogue: s.dialogue,
    video_url: videoClips[idx % videoClips.length],
    thumbnail_url: idx % 2 === 0 ? profile.leadImg : profile.antagImg,
    prompt: s.visual_description,
    duration_seconds: s.duration_seconds,
    status: 'completed' as const,
  }));

  return {
    prompt: cleanPrompt,
    projectTitle: title,
    genre: profile.genre,
    globalNarrative,
    shots,
    characters,
    voiceovers,
    videoShots,
  };
}
