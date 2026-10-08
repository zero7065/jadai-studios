export interface JadaiCharacter {
  id: string;
  name: string;
  type: 'male' | 'female' | 'creature';
  realm: 'land' | 'sea' | 'air' | 'citadel' | 'void';
  sinTied: string;
  story: string;
  shadowBeing: {
    name: string;
    description: string;
    silhouetteStyle: string;
  };
  armorDesign: string;
  image: string;
  artAccents: string[];
}

export const JADAI_ROSTER: JadaiCharacter[] = [
  // 3 Male Protagonists
  {
    id: 'kaelen',
    name: 'Kaelen, The Void-Breaker',
    type: 'male',
    realm: 'citadel',
    sinTied: 'Wrath',
    story: 'Tempered in the high furnaces of the Jos Plateau. He forged armor not to resist blows, but to contain the celestial fire of unspent fury.',
    shadowBeing: {
      name: 'Umbra-Kaelen',
      description: 'A black mirror reflection with flickering crimson embers where eyes should be.',
      silhouetteStyle: 'Jagged crystalline edges radiating dark heat',
    },
    armorDesign: 'Layered matte-black obsidian plates inlaid with razor gold circuit lines, high collar tactical vest, and magnetic gauntlets.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Concentric hex wards', 'Crimson lens flare', 'Edge-lit gold trim'],
  },
  {
    id: 'orion',
    name: 'Orion, The Star-Seer',
    type: 'male',
    realm: 'void',
    sinTied: 'Pride',
    story: 'He mapped every sovereign constellation before the age of reason, refusing to look down upon the mud until the sky knelt before his blueprints.',
    shadowBeing: {
      name: 'Null-Orion',
      description: 'A silent, faceless silhouette absorbing all ambient light with a crown of dark solar rays.',
      silhouetteStyle: 'Floating cape resembling ink spreading in cold water',
    },
    armorDesign: 'Aeroluxe longcoat in deep void weave with gold fractal embroidery and celestial astrolabe shoulder pauldrons.',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Sacred dodecahedron matrix', 'Golden celestial rings', 'Film-grain texture'],
  },
  {
    id: 'thorne',
    name: 'Thorne, The Unyielding',
    type: 'male',
    realm: 'land',
    sinTied: 'Greed',
    story: 'He hoarded neither gold nor land, but every second of lost computational cycles, demanding that matter itself yield maximum velocity.',
    shadowBeing: {
      name: 'Erebus-Thorne',
      description: 'A pitch-black phantom trailing chains woven from broken promises and unindexed memory.',
      silhouetteStyle: 'Heavy armor silhouette with empty hollow visor',
    },
    armorDesign: 'Heavy-plated composite battle rig, motorized exoskeleton joints, bronze knuckles, and gold-trimmed tactical chest rig.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Fibonacci spiral shield', 'Dual electric glow', 'Heavy mechanical rivets'],
  },

  // 3 Female Protagonists
  {
    id: 'lyra',
    name: 'Lyra of the Golden Spire',
    type: 'female',
    realm: 'citadel',
    sinTied: 'Envy',
    story: 'She gazed at the stars not with longing, but with the quiet determination to build towers so tall that heaven would envy the view from Earth.',
    shadowBeing: {
      name: 'Vesper-Lyra',
      description: 'A liquid-shadow twin holding an empty mirror frame through which only static breathes.',
      silhouetteStyle: 'Flowing asymmetric silk contours with needle-sharp fingertips',
    },
    armorDesign: 'Form-fitting dark synth-silk with champagne gold kinetic greaves, gold-threaded high collar, and floating luminescent hair needles.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Interlocking Metatron rings', 'Golden eye reflections', 'Cinematic rim lighting'],
  },
  {
    id: 'seraphina',
    name: 'Seraphina, The Shadow-Weaver',
    type: 'female',
    realm: 'void',
    sinTied: 'Lust',
    story: 'A scholar of forbidden frequencies whose passion for beauty was so consuming it bent photons into tangible blades.',
    shadowBeing: {
      name: 'Nocturne-Seraphina',
      description: 'A velvet-black silhouette cloaked in dancing ribbons of void mist, featureless save for a single gold tear.',
      silhouetteStyle: 'Hypnotic billowing silks and trailing tendrils',
    },
    armorDesign: 'Layered crimson velvet and obsidian carbon weaves, segmented dragon-scale vambraces, and a gold filigree half-mask.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Crimson radial glow', 'Golden sacred triangles', 'Donghua high-contrast grading'],
  },
  {
    id: 'zephyra',
    name: 'Zephyra, The Silent Chronos',
    type: 'female',
    realm: 'air',
    sinTied: 'Sloth',
    story: 'She mastered absolute stillness — waiting so patiently between heartbeats that time would halt, letting her step across epochs untouched.',
    shadowBeing: {
      name: 'Stasis-Zephyra',
      description: 'A motionless silhouette frozen inside a sphere of darkened hourglass sand.',
      silhouetteStyle: 'Zero-gravity hair suspension with geometric clockwork halo',
    },
    armorDesign: 'Ultralight aerodynamic flight suit in pearl-white and burnished bronze, pneumatic knee thrusters, and holographic visor.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Hourglass geometry vectors', 'Cyan-to-gold spectral split', 'Subtle 5% grain'],
  },

  // 3 Legendary Creatures
  {
    id: 'ignis-leviathan',
    name: 'Ignis, The Abyssal Leviathan',
    type: 'creature',
    realm: 'sea',
    sinTied: 'Gluttony',
    story: 'Slumbering beneath the southern oceanic trench, its bioluminescent scales consume deep currents to exhale geothermal auroras.',
    shadowBeing: {
      name: 'The Abyssal Trench',
      description: 'A colossal serpent of negative space that swallows sonar pulses and submarine light.',
      silhouetteStyle: 'Massive serpentine coil spanning the deep horizon',
    },
    armorDesign: 'Iridescent jewel-toned obsidian scales reinforced with gold hydrothermal vents along the spinal crest.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Bioluminescent blue-gold nodes', 'Underwater caustics', 'Sacred wave curvature'],
  },
  {
    id: 'obsidian-chimera',
    name: 'Chimera of the Granite Crest',
    type: 'creature',
    realm: 'land',
    sinTied: 'Pride',
    story: 'Born from the ancient volcanic crags of Shere Hills. It steps without sound, its claws leaving molten gold tracks on raw granite.',
    shadowBeing: {
      name: 'The Living Ridge',
      description: 'A mountain ridge that rises into four-legged black form when trespassers enter the sovereign perimeter.',
      silhouetteStyle: 'Predatory feline and leonine contours with massive arched shoulders',
    },
    armorDesign: 'Chiseled obsidian body carapace with raw gold ore protruding like crystalline spines.',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Molten gold veins', 'Sacred tetrahedral horns', 'Stone fracture lines'],
  },
  {
    id: 'zephyrion-roc',
    name: 'Zephyrion, The Solar Roc',
    type: 'creature',
    realm: 'air',
    sinTied: 'Wrath',
    story: 'A thunderbird of golden solar fire. Its wingspan spans valleys, casting a shadow that turns midday into night before ignition.',
    shadowBeing: {
      name: 'The Eclipse Herald',
      description: 'A giant winged silhouette blocking out the sun, crowned in a rim of blinding white corona.',
      silhouetteStyle: 'Expansive razor-feather wings with sweeping tail plumes',
    },
    armorDesign: 'Layered gold plumage with carbonized wingtips that spark static electricity with every flap.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    artAccents: ['Solar corona halo', 'Geometric feather tessellation', 'Dramatic upward camera angle'],
  },
];
