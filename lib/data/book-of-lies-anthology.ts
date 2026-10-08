export interface BookOfLiesEpisode {
  id: string;
  slug: string;
  episode_number: number;
  title: string;
  tagline: string;
  act: 1 | 2 | 3;
  sin_category: 'Pride' | 'Envy' | 'Wrath' | 'Sloth' | 'Greed' | 'Gluttony' | 'Lust' | 'Discernment';
  teaser: string;
  full_text: string;
  cover_image_url?: string;
  published: boolean;
  publish_at: string;
  views_count: number;
  likes_count: number;
  scheduled_for: string;
}

export const MASTER_40_EPISODES: BookOfLiesEpisode[] = [
  // --- CHAPTER I: PRIDE (The Lie of Identity) ---
  {
    id: 'bol-001',
    slug: 'the-monument-of-dust',
    episode_number: 1,
    title: 'The Monument of Dust',
    tagline: 'When the builder worships their own blueprints before the mortar dries.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'He believed the stone would bend to his reputation. The mountain had other metrics.',
    published: true,
    publish_at: '2026-09-01T21:47:00Z',
    views_count: 1420,
    likes_count: 312,
    scheduled_for: '9:47 PM',
    full_text: `The architect stood atop the granite ridge outside the city of stone. His drawings were drawn upon calfskin vellum, inscribed with black squid ink and rimmed with pulverized gold leaf. Every line was straight. Every column was plumb. In his mind, the citadel was already standing, unassailable, celebrated across kingdoms.

"You have not measured the aquifer beneath the footings," the old well-digger murmured, wiping red clay from his calloused palms.

"I do not measure mud," the architect answered, without looking down. "I calculate celestial axes. The sun strikes the pediment at equinox. The emperor will see it from seventy leagues away."

Pride is not the belief that you can build; it is the refusal to check the soil because you consider your own hand infallible.

For three seasons, the masons hauled limestone blocks up the escarpment. The walls rose sixty cubits into the thin mountain air. Travelers stopped on the trading roads to marvel at the sheer arrogance of the architraves. The architect held court beneath silk pavilions, lecturing younger draughtsmen on symmetry and divine proportion. He dismissed the reports of dampness in the lower vaults. He mocked the apprentices who pointed out hairline fractures running through the north foundation piers.

Then came the rains of the fourth equinox. The underground river, unheeded and unchanneled, rose through the subterranean fissures. The water did not shatter the stone; it quietly turned the foundation clay to slurry.

At dawn, with the city watching, the celestial architraves did not merely fall. They sheared cleanly at the joint. The monument collapsed into its own footprint, a plume of grey limestone dust billowing over the terraced hills. When the dust settled, only the old well-digger's drainage ditch remained intact.

Build the floor first. The sky does not owe your pride a pillar.`,
  },
  {
    id: 'bol-002',
    slug: 'the-mask-of-pure-marble',
    episode_number: 2,
    title: 'The Mask of Pure Marble',
    tagline: 'The sculpture that consumed the sculptor’s breath.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'He spent forty years carving a statue of himself so flawless that living flesh disgusted him.',
    published: true,
    publish_at: '2026-09-02T21:47:00Z',
    views_count: 1280,
    likes_count: 290,
    scheduled_for: '9:47 PM',
    full_text: `The master sculptor of Antioch refused to look at his own reflection in still water. He claimed the water was too coarse, ripples distorting the divine symmetry he possessed in his imagination. He locked himself in a sea cave with a block of translucent Parian marble and a dozen tempered chisels.

Every blow of the mallet was accompanied by a decree: "I will make a version of man that never bleeds, never weeps, and never wrinkles under winter winds."

Pride creates an idol of the self so fragile that simple humanity becomes an unbearable embarrassment.

He carved cheekbones sharp as flint. He polished the iris until it caught the morning sun like glass. When friends knocked on the cavern grate, he refused them entry: "Your breath brings moisture, and moisture dulls the sheen of perfection." He slept on wet stone, neglecting his bread, drinking only brine-tainted rain to prolong his working hours.

On the day the statue was completed, the sculptor fell to his knees before his marble counterpart. The figure gazed over his head, cold, aloof, and utterly unresponsive. When winter arrived, frost cracked the sculptor's joints. He reached out to lean against the statue for warmth; the polished marble was five degrees colder than the tomb.

He died alone touching cold stone that did not know his name. The marble survived three empires, eventually ground into lime mortar by builders who needed something to hold together an ordinary pigpen.

Do not chisel an idol of yourself. Stone does not love the hand that strikes it.`,
  },
  {
    id: 'bol-003',
    slug: 'the-pedestal-on-the-faultline',
    episode_number: 3,
    title: 'The Pedestal on the Faultline',
    tagline: 'Erecting bronze where the tectonic earth breathes.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'He demanded his statue be placed at the geological summit, ignoring the tremor in the shale.',
    published: true,
    publish_at: '2026-09-03T21:47:00Z',
    views_count: 1110,
    likes_count: 245,
    scheduled_for: '9:47 PM',
    full_text: `The warlord of the northern pass commanded a bronze colossus cast in his likeness. It stood fifty feet high, an iron spear in the right fist and a scroll of conquered provinces in the left. The surveyors warned him: the high ridge was a tectonic suture; the mountains groaned once every decade when the plates shifted.

"If the earth shakes," the warlord announced to his captains, "it shakes because it recognizes the master of the pass."

Pride believes that nature is merely a stage designed to amplify human importance.

The masons were ordered to drill directly into the fault fissure. They poured molten lead into the bedrock cracks to anchor the bronze sandals. For three years, the statue caught the dawn light, casting a massive shadow across the peasant farms below. The warlord hosted banquets on the platform between the statue's knees, toasting his eternal tenure.

On a moonless October midnight, the tectonic suture sighed. It was not a cataclysmic earthquake; it was a three-inch lateral slippage of the limestone shelf. Because the pedestal was anchored rigidly across the fault seam without jointed tolerances, the shear stress went straight up the bronze shins.

The statue snapped at the ankles with the sound of a siege cannon firing. The colossus pitched forward, rolling two thousand feet down the ravine, crushing the warlord's banquet hall beneath its bronze skull.

Build with margins. The bedrock does not care whose face is stamped on the coin.`,
  },
  {
    id: 'bol-004',
    slug: 'the-inscribed-shield',
    episode_number: 4,
    title: 'The Inscribed Shield',
    tagline: 'When the crest is heavier than the oak that defends the heart.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'He layered silver filigree over the leather boss until the shield weighed more than his sword arm could lift.',
    published: true,
    publish_at: '2026-09-04T21:47:00Z',
    views_count: 1045,
    likes_count: 218,
    scheduled_for: '9:47 PM',
    full_text: `The young prince entered his first tournament carrying a shield forged by royal silversmiths. Across its surface were chased sixteen generations of heraldic victories: lions rampant, eagles with golden eyes, Latin mottos embossed in raised vermilion enamel.

"Sire," his veteran squire warned, testing the straps, "the balance is centered too far forward. The silver repoussé has added thirty pounds to the rim."

"Would you have me enter the lists looking like a common foot-soldier?" the prince retorted. "Men must read my genealogy before they dare raise a lance."

Pride mistakes the ornamentation of capability for capability itself.

When the tournament trumpets sounded, the prince charged down the lists. His opponent was an unheralded mercenary from the western marches, carrying an unadorned shield made of two-ply ash wood covered in cured bull-hide, stripped of all color.

As the lances crossed, the heavy silver boss dragged the prince's left shoulder downward by four inches. The mercenary's blunt ash spear slid past the ornate heraldic lions and struck the prince square in the unprotected breastplate. The prince was unhorsed with such violence that his silver shield tore from his arm and landed face down in the manure of the arena floor.

The crowd did not read the sixteen Latin mottos. They only watched the mercenary dismount, pick up the heavy silver plate, test its weight, and hand it to his squire to be melted into coin.

Carry truth, not heraldry. The battlefield tests weight, not pedigree.`,
  },
  {
    id: 'bol-005',
    slug: 'the-crown-of-hardened-clay',
    episode_number: 5,
    title: 'The Crown of Hardened Clay',
    tagline: 'Rule over ruins is still rule to the vain.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'He proclaimed himself sovereign of the desert after every subject had crossed the border.',
    published: true,
    publish_at: '2026-09-05T21:47:00Z',
    views_count: 980,
    likes_count: 201,
    scheduled_for: '9:47 PM',
    full_text: `The tyrant refused to lower the grain tax when the third drought dried the barley fields. His ministers pleaded: "The farmers are taking their families into the southern kingdom. The villages are empty."

"Let them go," the tyrant declared from his cedar throne. "Those who remain will be the pure stock. I would rather reign over ten loyal retainers than ten thousand murmuring peasants."

Pride will gladly incinerate the kingdom if it means sitting upon the hottest throne in the ashes.

By harvest time, the fields were thistle and thorn. The tax collectors returned with empty satchels. The palace cooks slaughtered the last carriage horses for soup. Still, the tyrant donned his velvet robes each morning, sat in the great council hall, and issued thirty-page edicts regulating foreign trade and maritime tariffs—though the sea was two hundred miles away and no merchant caravan had crossed his gates in nine months.

Finally, even his bodyguards walked away in the night, leaving the front gates swinging open on rusted hinges.

The tyrant walked into the dry square. He found a mound of sun-baked river clay, shaped it with trembling fingers into a circlet, and placed it upon his brow. He bowed to the jackals sitting on the perimeter wall: "All this is mine."

The jackals waited until nightfall, then took what little flesh was left.

Authority without service is an asylum of one.`,
  },

  // --- CHAPTER II: ENVY (The Currency of Greed / Comparison) ---
  {
    id: 'bol-006',
    slug: 'the-boundary-stone',
    episode_number: 6,
    title: 'The Boundary Stone',
    tagline: 'Measuring your harvest by another man’s rainfall.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'He spent seven winters watching his neighbor’s chimney smoke, forgetting his own hearth was cold.',
    published: true,
    publish_at: '2026-09-06T21:47:00Z',
    views_count: 1350,
    likes_count: 320,
    scheduled_for: '9:47 PM',
    full_text: `In the dry plateau of the central valley, two brothers cleared land on opposite sides of a stony stream. The elder brother, Kael, planted sorghum and sesame, tending his furrowed rows with quiet, monotonous regularity. The younger brother, Vane, planted nothing for the first month. He stood at the boundary stone with a measuring cord, watching what seed Kael bought, how deep Kael dug his post-holes, and how many oxen Kael hired.

Whenever Kael hauled timber, Vane traded his winter grain for slightly thicker timber. Whenever Kael sharpened his scythe, Vane bought a whetstone imported from the coast, though he had nothing yet to reap.

Envy is a parasitic geometry: it allows someone else’s coordinates to define your own perimeter.

By midsummer, Kael’s stalks were head-high and heavy with dark grain. Vane’s plot had half-dug ditches and misaligned trenches, all abandoned the moment Kael started working on an irrigation sluice. Vane lay awake listening to the creek trickle into Kael’s reservoir. The sound was not water; to Vane, it was mockery.

One night, under a dead moon, Vane crossed the creek with a crowbar. He did not seek to steal Kael’s harvest; he sought to crack the stone lip of the reservoir so the water would drain uselessly into the shale gully below. He drove the iron wedge into the seam. The stone cracked, but the sudden hydrostatic rush sucked his ankle beneath the collapsing masonry.

When Kael came out at sunrise with his bread and jug, he found his water gone and his brother pinned beneath the dam.

"Why did you not ask for half the ditch?" Kael asked, setting down his jug to lever the rock.

"Because half would still mean you had water," Vane whispered with cracked lips.

The floor you build on another man’s shadow will always collapse under your own weight.`,
  },
  {
    id: 'bol-007',
    slug: 'the-stolen-blueprint',
    episode_number: 7,
    title: 'The Stolen Blueprint',
    tagline: 'Copying the lines without understanding the tension.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'He bribed the draughtsman for the cathedral vault plan, never calculating the load of his own stone.',
    published: true,
    publish_at: '2026-09-07T21:47:00Z',
    views_count: 1190,
    likes_count: 274,
    scheduled_for: '9:47 PM',
    full_text: `The master builder of Milan labored seven years calculating the barrel vaulting for the civic hall. Across town, a rival contractor grew sick with jealousy seeing the city council award contract after contract to the master.

He paid two hundred florins to a drunken apprentice to smuggle out the vellum elevations. By lantern light, the rival traced every arc, rib, and groin vault. "Now I possess his genius," he gloated, breaking the wax seals.

Envy copies the architecture of victory without enduring the mathematical suffering that conceived it.

The rival bid half the price to construct a grand monastery in the foothills using the exact stolen measurements. But where the Milan master had quarried dense dolomite marble capable of handling sixteen thousand pounds of shear force per square cubit, the rival bought soft yellow sandstone from a local pit to increase his profit margin.

He followed the stolen lines with robotic fidelity. The arches rose majestically. The monks sang te deums beneath the soaring crossing.

Two days after the scaffolding was struck, a low rumble began in the clerestory. The geometry was correct, but the stone was porous. Soft sandstone crushed under the concentrated load vectors. The central vault caved in like an eggshell, burying forty oak pews under four hundred tons of rubble.

In the court inquiry, the rival produced the master's stolen drawings in his defense: "Look! I followed his lines to the tenth of an inch!"

The chief magistrate looked at the vellum, then at the defendant: "Lines do not bear weight, fool. Matter does."

Do not steal another architect’s footprint. You do not own the ground they quarry from.`,
  },
  {
    id: 'bol-008',
    slug: 'the-shadow-of-the-neighbor',
    episode_number: 8,
    title: 'The Shadow of the Neighbor',
    tagline: 'Constructing walls only to block another man’s sunrise.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'He built a forty-foot spite tower, forgetting it threw his own vineyards into eternal shade.',
    published: true,
    publish_at: '2026-09-08T21:47:00Z',
    views_count: 1030,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `In the hills of Burgundy, two vineyard owners shared a southern hillside. The western plot yielded the sweetest Muscat grapes because it caught the first rays of the dawn sun over the valley ridge. The eastern owner, driven mad by the awards his neighbor won at the autumn fairs, mortgaged his cellars to construct a massive granite barrier wall directly on the property line.

"He will not taste the dawn again," the eastern owner swore to his masons.

Envy will gladly poison its own soil if it guarantees weeds in the neighbor’s garden.

The wall rose forty feet into the air. It blocked the morning sun from the western plot, exactly as planned. But the eastern owner had failed to consult the wind patterns. In November, the bitter north mistral hit the tall stone wall, swirled into a freezing vortex, and settled directly over his own vineyard.

The frost lingered on the eastern owner's vines for three weeks. When spring arrived, his competitor’s grapes sprouted late but healthy in the afternoon sun, while the eastern owner's vines had blackened and died from the root up.

He spent the autumn sitting alone in the cold shade of his own spite wall, watching his neighbor pick three hundred bushels of Muscat grapes on the other side.

Every spite wall is a tomb you build for yourself.`,
  },
  {
    id: 'bol-009',
    slug: 'the-poisoned-sluice',
    episode_number: 9,
    title: 'The Poisoned Sluice',
    tagline: 'Tainting the river because someone upstream has cleaner water.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'He threw nightshade into the irrigation canal, forgetting his cattle grazed in the delta.',
    published: true,
    publish_at: '2026-09-09T21:47:00Z',
    views_count: 950,
    likes_count: 198,
    scheduled_for: '9:47 PM',
    full_text: `The leather tanner worked at the second bend of the river. Upstream from him was a linen weaver whose cloth was famed across the province for its pristine snow-white brightness. The tanner was convinced the river gave the weaver an unfair advantage.

"His water is clearer. His currents are calmer. My hide vats smell of sulfur while his drying meadows smell of lavender," the tanner complained daily to the tavern keeper.

Envy perceives every natural advantage of another as a personal theft against oneself.

One night, the tanner climbed the river path with sacks of crushed quicklime and rotted tallow. He dumped them into the weaver's intake ditch, turning the pristine water into an alkaline sludge that bleached and rotted eighty bolts of damask linen on the drying frames.

The tanner returned to his workshop celebrating his sabotage. He washed his hands in his own intake sluice and went to sleep with a malicious smile.

By daybreak, the poisoned water had flowed downstream around the second bend. It entered the tanner's own soaking pits where forty thousand florins worth of prime calf hides were curing. The caustic quicklime dissolved the hair and the leather alike, reducing his entire inventory to gelatinous grey foam.

He ran screaming to the weaver's mill to blame him, only to find the weaver already clearing his sluice with a water broom, whistling a morning psalm.

When you poison the river, remember that you also live downstream.`,
  },
  {
    id: 'bol-010',
    slug: 'the-neighbors-bell',
    episode_number: 10,
    title: 'The Neighbor’s Bell',
    tagline: 'Deafened by the music of another town’s festival.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'He melted his town fire bell to recast it bigger than the neighboring cathedral.',
    published: true,
    publish_at: '2026-09-10T21:47:00Z',
    views_count: 920,
    likes_count: 184,
    scheduled_for: '9:47 PM',
    full_text: `The burghers of Ghent could not endure the sound of the great bell of Bruges. On quiet autumn evenings, the bronze tone drifted across the flat Flanders meadows, deep, resonant, and beautiful.

"Our bell sounds like an iron pot," the guildmaster grumbled. "We must have a bell that drowns Bruges in its own silence."

Envy cannot enjoy its own feast while someone else’s song is playing.

The town council voted to melt down every copper kitchen cauldron, every bronze candelabra, and the alarm bell that warned the dikes against flooding. They pooled forty thousand pounds of metal and dug a casting pit in the central square.

The bell-founder poured the giant mold. But in their rush to make it larger than Bruges, they used scrap iron to bulk out the alloy when the tin ran short.

On the day of dedication, six cart horses pulled the clapper into position. The entire city gathered with wine goblets raised. The guildmaster pulled the release rope.

The massive clapper swung. The sound was not a chime. It was a deafening, dry crack that shook the slate tiles from the guildhall roof. The brittle iron-heavy alloy split from crown to lip in a jagged three-inch chasm.

The bell never rang again. Two weeks later, a storm breached the northern dike. The watchman ran to the tower to ring the flood alarm, but found only the split, mute bronze carcass. Half the lower city was submerged before the citizens woke.

And across the water, the clear, sweet bell of Bruges continued to sound through the mist.

Praise what is true in another man's town. Recasting your own alarm into vanity leaves you helpless when the water rises.`,
  },

  // --- CHAPTER III: WRATH (The Blade with Two Grips) ---
  {
    id: 'bol-011',
    slug: 'the-furnace-of-iron',
    episode_number: 11,
    title: 'The Furnace of Iron',
    tagline: 'Wrath is a sword that burns the palm that grips it.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'The blacksmith swore to forge an edge that could sever stone, unaware that fury tempers nothing.',
    published: true,
    publish_at: '2026-09-11T21:47:00Z',
    views_count: 1150,
    likes_count: 289,
    scheduled_for: '9:47 PM',
    full_text: `The blacksmith was insulted by a traveling mercenary who laughed at the balance of his cavalry sabers. The laughter echoed in the smith’s skull long after the horses had crossed the river. He did not sleep. He shuttered his shop, locked out his apprentices, and stoked his furnace with dense charcoal made from ironwood trunks.

"I will make a blade that cuts his saddle in two," the smith snarled, blowing the bellows until the fire roared blinding white.

Wrath believes that intensity is a substitute for discipline. It mistakes heat for metallurgical integrity.

He hammered the billet with furious, violent blows. When the steel cooled to cherry red, instead of annealing it slowly in ash, he quenched it in ice water with a savage oath. The steel screamed and hissed, hardening instantaneously, but microscopic stress lines fractured across the atomic lattice. The smith polished out the surface cracks until the blade shone like polished mirror glass.

When the mercenary returned weeks later, the smith stepped into the dust of the road and swung the great sword with both hands against the iron rim of the mercenary’s buckler.

The sword did not cut the shield. It shattered into fifty glass-like shards. One jagged sliver rebounded directly into the smith’s forearm, severing the tendon of his hammer hand.

The mercenary looked down at the blood in the dirt, unclasped his purse, tossed a copper coin at the smith’s feet, and rode on without speaking a word.

Cold clarity builds systems. Hot fury only shatters the tools you need to survive.`,
  },
  {
    id: 'bol-012',
    slug: 'the-shattered-anvil',
    episode_number: 12,
    title: 'The Shattered Anvil',
    tagline: 'When the hammer strikes so hard it breaks the base.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'In his rage at a bent horseshoe, he drove his sledge into the three-hundred-year-old cast horn.',
    published: true,
    publish_at: '2026-09-12T21:47:00Z',
    views_count: 1080,
    likes_count: 240,
    scheduled_for: '9:47 PM',
    full_text: `The armorer of Toledo lost a government tender for one thousand cuirasses. His bid was rejected because his rivet holes were three millimeters out of alignment with the royal inspection standard. He walked into his workshop, kicked over his quench buckets, and began cursing the inspectors, the king, and the raw ore from the Vizcaya mines.

He seized a sixteen-pound sledgehammer. A red-hot bar was cooling on his ancestral steel anvil—an anvil that had belonged to his grandfather, forged from Swedish hematite.

"Everything in this shop is against me!" he roared.

Wrath demands an immediate victim, even if that victim is the ground upon which the angry man stands.

He swung the sledgehammer not at the glowing iron bar, but with full, blind shoulder momentum directly into the narrow horn of the anvil. The impact sent a shockwave back through his collarbone, but worse: the cold-shocked horn, struck off-center on an unyielding pivot, cracked cleanly off the block and crashed through his wood plank flooring into the cistern below.

His forge went silent.

Without an anvil, an armorer is merely a homeless beggar with dirty hands. He spent the next three months sitting on the curb outside other men’s smithies, paying half his daily food allowance to borrow four square inches of their scrap steel so he could hammer enough nails to pay his rent.

Rage does not punish the world; it disarms you before the world even notices your fury.`,
  },
  {
    id: 'bol-013',
    slug: 'the-burning-orchard',
    episode_number: 13,
    title: 'The Burning Orchard',
    tagline: 'Burning down the estate to catch a thief with a pear.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'He torched forty acres of almond trees to smoke out two orchard thieves.',
    published: true,
    publish_at: '2026-09-13T21:47:00Z',
    views_count: 1020,
    likes_count: 220,
    scheduled_for: '9:47 PM',
    full_text: `The orchardist found two village children stuffing their tunics with sweet almonds from his prize orchard. As the children scampered over the fieldstone fence, one turned and made a mocking gesture.

The gesture burned in the owner's chest like unslaked lime. He did not summon the village constable; he did not speak to their parents.

"They will never steal from these branches again!" he swore.

Wrath has no sense of proportion. It treats an insult to pride as an emergency requiring total destruction.

He grabbed a pitch torch and ignited the dry underbrush along the stone wall, intending to smoke the boys out of the adjacent pine grove. But the August wind shifted off the arid plain. The flames leapt into the canopy of his almond trees. Within forty minutes, forty acres of thirty-year-old almond trees were screaming pillars of fire.

The blaze jumped the road, devoured his packing sheds, incinerated seventy crates of olive oil, and scorched the stone foundation of his family farmhouse.

When the smoke cleared at sundown, the orchardist was sitting on a charred stump, blackened with soot, his eyebrows burned off. Across the road, the two boys were sitting on a rock eating cold bread and sheep cheese, watching the smoke drift into the mountains.

The cost of your vengeance will always come out of your own storehouse.`,
  },
  {
    id: 'bol-014',
    slug: 'the-double-edged-scythe',
    episode_number: 14,
    title: 'The Double-Edged Scythe',
    tagline: 'A weapon sharpened on both sides cuts the harvester on the return stroke.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'He ground an edge on the back of his tool so no one could touch him from behind.',
    published: true,
    publish_at: '2026-09-14T21:47:00Z',
    views_count: 940,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The grain farmer was terrified of rivals sneaking up on him during the harvest. In his chronic fury at real and imagined trespassers, he took his harvesting scythe to the grinder and sharpened both the inner concave curve and the outer spine until it was razor-sharp on every plane.

"Now let any man approach my swath," he sneered, swinging the gleaming weapon in his kitchen.

Wrath designs tools that cannot be safely held by the human body.

He went into the wheat field at dawn. For the first two hours, the scythe cut through the dry grain with terrifying speed. But harvesting requires a rhythm: the sweep forward, the pivot, and the back-swing to clear the chaff.

On the three-hundredth stroke, his boot caught in a rabbit hole. As he stumbled backward to regain his footing, the back-swing whipped around. The razor-sharp outer spine struck his own calf muscle, slicing through flesh to the tibia bone.

He collapsed into his own cut wheat, bleeding into the grain he had sworn to protect. No neighbor came to his aid, because for five years he had threatened to decapitate anyone who stepped across his irrigation ditch.

He lay there until sunset, applying a tourniquet made of thistle straw with his bare hands, while his wheat rotted ungathered under the evening dew.

Build weapons for your work, not tools to terrify shadows. What you sharpen in fury will bite you when you stumble.`,
  },
  {
    id: 'bol-015',
    slug: 'the-ash-in-the-spring',
    episode_number: 15,
    title: 'The Ash in the Spring',
    tagline: 'Fouling the drinking well because the council did not vote your way.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'He poured oil down the mountain spring to spite the elders who denied him the chieftainship.',
    published: true,
    publish_at: '2026-09-15T21:47:00Z',
    views_count: 890,
    likes_count: 175,
    scheduled_for: '9:47 PM',
    full_text: `When the clan council passed over Korah for the title of clan elder, selecting his younger cousin who was known for patience and gentle mediation, Korah's heart turned into a pit of smoking charcoal.

"They will learn what thirst feels like," he hissed to his sons.

Wrath believes that if it cannot sit at the head of the table, everyone at the feast deserves starvation.

Under the cover of a thunderstorm, Korah led three mules laden with pitch and animal carcasses up to the sacred spring in the high limestone caverns. This spring fed every water trough, every vegetable terrace, and every hearth in the valley below. He emptied the foul pitch into the clear subterranean pool, watching the sweet mountain water turn iridescent black with sulfur oil.

He returned to his compound and barred his gates, expecting the council to come begging on their knees by mid-week.

The spring was ruined. But three days later, the summer heat struck with forty-degree winds. Korah’s own well, which tapped the same underground limestone aquifer fifty cubits down, filled with black, stinking petroleum sludge.

His livestock began dying of dehydration in their pens. His children wept with swollen tongues. Korah walked down the mountain path to seek water from his cousin.

His cousin did not curse him. His cousin had already organized the entire village to dig a new communal catchment three miles to the east on the neighboring ridge.

"Drink, Korah," the cousin said, handing him a bowl of fresh rainwater. "Your rage only poisoned the water you yourself had to drink."

Korah took the bowl with trembling hands, tasting the bitter irony of unearned mercy.

Hatred is drinking poison and expecting your enemy to die.`,
  },

  // --- CHAPTER IV: SLOTH (The Sloth of Progress / The Sleeping Scaffold) ---
  {
    id: 'bol-016',
    slug: 'the-architect-who-drew-clouds',
    episode_number: 16,
    title: 'The Architect Who Drew Clouds',
    tagline: 'When the blueprint is a sanctuary from the labor of masonry.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'He spent nine years drafting the perfect arch, but never hauled a single bucket of lime.',
    published: true,
    publish_at: '2026-09-16T21:47:00Z',
    views_count: 1220,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `Master Julian had the reputation of a genius in the universities of Paris. His sketchbooks were wonders of perspective: soaring flying buttresses, intricate rose windows, vaulted ceilings with mathematically precise fractal ribbing. Kings paid him stipends just to inspect his parchment folios.

"Next month," Julian would say, adjusting his fur-lined mantle, "we shall break ground. The geometry is almost complete."

Sloth does not always sleep in bed; often it hides inside perpetual preparation and endless theoretical refinement.

Nine years passed. The foundation trenches dug for the great cathedral filled with rainwater, turning into frog ponds and mosquito breeding grounds. The quarried granite blocks sitting in the staging yards grew thick coats of green lichen. The stonecutters, tired of waiting for Julian’s final elevation drawings, left for other cities to work on bridges and grain silos.

Whenever the bishop visited, Julian unveiled a new rendering. "Notice how I have solved the thrust vector of the northern transept! Another three months of calculation, and the angels will weep."

The bishop was eighty years old. He looked at the frog pond, then at the parchment.

He tore the folio in half.

"The angels do not weep at drawings, Julian," the old man said quietly. "They weep because the parishioners have celebrated nine Easters under a canvas tent while you played with squid ink."

The bishop hired an illiterate stonemason from the valley. In sixteen months, the stonemason built a simple, sturdy sanctuary of squared fieldstone. It had no fractal buttresses, but it had a dry slate roof, solid oak benches, and a warm hearth where old women could pray without catching pneumonia.

Julian died in a cold garret, surrounded by three thousand sheets of drawings for buildings that never cast a shadow.

A completed mud shack is worth ten thousand cathedrals on vellum.`,
  },
  {
    id: 'bol-017',
    slug: 'the-rotting-timber',
    episode_number: 17,
    title: 'The Rotting Timber',
    tagline: 'Waiting for the ideal season until the wood turns to punk.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'He felled fifty oak trunks and left them on the forest floor waiting for perfect weather.',
    published: true,
    publish_at: '2026-09-17T21:47:00Z',
    views_count: 1050,
    likes_count: 235,
    scheduled_for: '9:47 PM',
    full_text: `The boatbuilder of Bristol felled fifty mature white oaks in the king's forest. The timber was sound, heartwood dense enough to withstand transatlantic storms. He hauled the logs to his shipyard slipway, stacked them on skids, and sat down to smoke his pipe.

"The air is too humid to hew them today," he told his apprentice. "We must wait for the dry east wind, or the grain will check."

Sloth waits for frictionless circumstances that never arrive in a fallen world.

The dry wind came three weeks later. But then the boatbuilder decided the sun was too fierce: "We will wait for overcast skies so the timber cools slowly." Then came the autumn rains: "No man can saw oak in the mud." Then came the winter frost: "The sap is frozen; it will dull our adzes."

Five years passed. The logs sat on the slipway skids. Fungus sprouted between the bark seams. Wood-boring beetles drilled thousands of microscopic tunnels through the heartwood.

A merchant captain arrived with five hundred gold sovereigns, needing a hull for a trading voyage to Lisbon. The boatbuilder excitedly took up his broadaxe and swung into the first oak trunk.

The blade did not ring with the sharp ping of iron striking dense wood. It sank with a dull thud four inches into spongy, rotted punk wood. A cloud of brown dust and sawdust beetles exploded into his face.

Every single log was hollowed out from the inside.

The merchant captain spat in the dirt, took his gold to the yard next door, and left the boatbuilder standing among fifty rotted trunks that were now only fit for lighting cooking fires.

The best time to work is when the tool is in your hand. The weather will never apologize for your delays.`,
  },
  {
    id: 'bol-018',
    slug: 'the-uncarved-keystone',
    episode_number: 18,
    title: 'The Uncarved Keystone',
    tagline: 'Leaving the arch unfinished because the ninety-ninth percent is the hardest.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'The bridge had thirty stones placed; the final wedge was left for tomorrow for seven months.',
    published: true,
    publish_at: '2026-09-18T21:47:00Z',
    views_count: 980,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `The mason had built forty arches across the canal district. His technique was legendary. But on the great city gate bridge, he hit a wall of exhaustion. Thirty-nine stones had been set upon the wooden centering frame. All that was required to transfer the load and make the arch self-supporting was the final wedge: the keystone.

"I will dress the keystone tomorrow," the mason muttered at sunset. "It requires exact tapers. I am too weary tonight."

Tomorrow became next Monday. Next Monday became after the feast of Saint Michael.

Sloth loves ninety-nine percent completion because it gives the illusion of victory while sparing the soul the terrifying final test of reality.

The wooden centering frame beneath the arch was temporary pine, meant to hold the stones for forty-eight hours while the keystone was tapped home. Month after month, the damp river mist rose from the canal, rotting the pine wedges and softening the timber braces.

The apprentice begged the mason: "Master, the keystone block is sitting on your workbench. It takes only four hours with the chisel. The pine braces are bowing!"

"Do not lecture me on timing, boy," the mason snapped from his tavern stool. "I will carve it when the mood strikes."

On a quiet Tuesday morning, a loaded coal barge drifted under the bridge. A light breeze stirred the water. The rotted pine centering frame gave way under the un-locked arch stones. Thirty-nine limestone blocks slipped simultaneously, crashing down into the barge, sinking the vessel, and killing two boatmen.

The mason arrived with his chisel three hours later. He looked at the empty gap between the abutments, then at the keystone still sitting untouched on his bench.

Completion is not a luxury; it is the difference between an arch and an avalanche.`,
  },
  {
    id: 'bol-019',
    slug: 'the-untended-ditch',
    episode_number: 19,
    title: 'The Untended Ditch',
    tagline: 'A spadeful of silt today saves fifty cartloads of mud tomorrow.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'He ignored the single dead branch blocking the drainage ditch until the flood washed away his barn.',
    published: true,
    publish_at: '2026-09-19T21:47:00Z',
    views_count: 910,
    likes_count: 189,
    scheduled_for: '9:47 PM',
    full_text: `The drainage ditch behind the granary was clogged by three fallen willow branches and a mound of dry autumn leaves. The farmhand walked past it every morning on his way to feed the mules.

"I will clear that on Saturday," he thought on Tuesday. On Saturday, he had chores in the village: "I will clear it before the rains come."

Sloth trivializes early maintenance because the consequences are deferred to an unseen future.

In late October, a line of black Atlantic squalls stalled over the county. Three inches of rain fell in five hours. The water rushed down the hillside into the drainage ditch. The dead willow branches caught the drifting brush, creating a beaver-like dam.

The water had nowhere to go. It backed up behind the granary foundation. Within two hours, the hydraulic pressure undermined the fieldstone retaining wall. The saturated soil liquefied.

With a sickening roar, the entire south wall of the granary collapsed. Eight hundred bushels of dry wheat were swept into the raging creek, coating the riverbanks for four miles with brown soggy paste.

The farmhand stood in the rain holding an empty shovel.

Clearing the three willow branches in August would have taken ninety seconds with a curved knife. Clearing the collapsed foundation took four months of backbreaking labor with two teams of hired oxen, and the farmer spent the winter eating dry turnips.

Dig the ditch when the sun is shining. Water never waits for lazy hands.`,
  },
  {
    id: 'bol-020',
    slug: 'the-silent-bell-tower',
    episode_number: 20,
    title: 'The Silent Bell Tower',
    tagline: 'When the watchman assumes someone else will check the horizon.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'He stopped oiling the tower hinges because no bandits had raided in twelve months.',
    published: true,
    publish_at: '2026-09-20T21:47:00Z',
    views_count: 870,
    likes_count: 168,
    scheduled_for: '9:47 PM',
    full_text: `The border watchman on the eastern ramparts was paid three silver pennies a week to climb the eighty stone steps of the watchtower twice every shift, scan the scrub plains, and grease the pivot of the brass warning gong.

For three hundred days, nothing happened. Only dust devils and grazing gazelles stirred on the horizon.

"Why walk eighty steps to look at dirt?" the watchman reasoned. He brought a wool blanket up to the lower landing, set down his oil can, and began playing dice against his left hand.

Sloth interprets the absence of crisis as proof that vigilance is unnecessary.

By winter, the brass gong had turned crusty with green verdigris. The iron pivot was seized solid by rust and sand. The watchman spent his nights sleeping behind the parapet shield, wrapping his feet in rabbit skins.

At four o'clock on a freezing foggy morning, seventy horsemen from the hill tribes crossed the dry riverbed with padded hooves.

The watchman woke to the scent of horse sweat. He scrambled to his feet, terrified. He lunged for the warning gong and struck it with his mallet.

The mallet hit seized, frozen metal with a dull clunk like a wooden spoon hitting a sack of flour. No sound echoed into the sleeping garrison below. He grabbed the bell rope to swing the clapper; the frozen hemp snapped in his freezing hands.

The riders breached the low gate before a single spear was drawn. The town was sacked, the armory burned, and the watchman was found shivering in the bell tower, clutching his broken piece of rope.

Peace is not the end of duty; it is the only season in which duty can be practiced without panic.`,
  },

  // --- CHAPTER V: GREED (The Granary of Lead) ---
  {
    id: 'bol-021',
    slug: 'the-golden-millstone',
    episode_number: 21,
    title: 'The Golden Millstone',
    tagline: 'The stone is too soft to grind flour, but too precious to discard.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'He replaced his basalt millstone with solid cast gold, only to discover gold wears to dust and grinds no grain.',
    published: true,
    publish_at: '2026-09-21T21:47:00Z',
    views_count: 1290,
    likes_count: 320,
    scheduled_for: '9:47 PM',
    full_text: `The miller of the low country grew ridiculously wealthy through thirty years of steady tolls. In his old age, he grew obsessed with proving his status to the trading guilds. He melted six hundred bars of hoarded gold into a massive, glittering circular millstone to sit in the center of his river mill.

"Let the peasants see that even their flour is born of gold," he proclaimed.

Greed converts functional instruments into monuments of wealth, destroying their utility in the process.

He engaged the river wheel. The water surged. The heavy golden millstone turned against the lower bedstone. But gold is a malleable, soft metal with an atomic hardness of only 2.5 on the mineral scale, compared to basalt at 6.

Within three days of grinding hard wheat kernels, the flutes on the golden millstone rubbed flat. The metal smeared. Microscopic shavings of gold dust mingled with the flour, turning the bread grey, metallic, and poisonous. Worse, the gold clogged the spindle bearings with greasy yellow residue, causing the friction to ignite the wooden water shaft.

The mill caught fire. The miller refused to flee the burning room because he could not lift the twelve-hundred-pound golden stone out of the mill-race.

He died in the smoke guarding an ingot that could neither grind a loaf of bread nor save his own lungs.

A tool's value is in its edge, not its price tag. When you worship the coin, you starve on the flour.`,
  },
  {
    id: 'bol-022',
    slug: 'the-hoarded-seed',
    episode_number: 22,
    title: 'The Hoarded Seed',
    tagline: 'Starving with full granaries because planting requires giving away.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'He locked three thousand bags of grain in iron vaults during the famine, only for weevils to eat the hearts.',
    published: true,
    publish_at: '2026-09-22T21:47:00Z',
    views_count: 1140,
    likes_count: 275,
    scheduled_for: '9:47 PM',
    full_text: `During the great drought of the Levant, the grain merchant acquired seventy percent of the regional barley stock. Outside his compound, families lined up with copper coins, wedding rings, and deed titles to buy enough flour to keep their children alive.

The merchant released only ten bags a day, artificially doubling the price every Monday.

"If I keep it until spring," he whispered to his accountant, "the price of a bushel will equal three sheep. We will buy the entire province."

Greed hoards life until life itself suffocates inside the vault.

He had the granary sealed with tarred pitch to keep out moisture. But in his terror of theft, he refused to open the ventilation shafts to air the bins. Grain is a living organism; it breathes, releases moisture, and generates heat when packed in massive, unventilated volumes.

Inside the dark bins, the temperature rose to fifty degrees Celsius. Spontaneous condensation formed on the iron ceiling beams, dripping down into the center of the grain mounds. Dormant grain weevil larvae hatched in the millions.

When spring arrived and the merchant finally unlocked the iron doors with armed guards, he did not find golden barley worth three sheep a bushel.

He opened the doors to a blast of hot, putrid stench. The entire three thousand bags had turned into a pulsing, boiling mass of grey mould and black weevils. When he thrust his hand into a sack, the grain crumbled to foul dust in his fist.

Outside his gates, the rains were falling, and farmers were planting fresh seed they had borrowed from an honest neighbor.

Seed is only wealth when it leaves your hand. In the clenched fist, it only rots.`,
  },
  {
    id: 'bol-023',
    slug: 'the-vault-of-dry-bones',
    episode_number: 23,
    title: 'The Vault of Dry Bones',
    tagline: 'Building a lock so secure that the master is trapped inside.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'The moneylender designed a vault that closed automatically at twilight, forgetting his candle was burned out.',
    published: true,
    publish_at: '2026-09-23T21:47:00Z',
    views_count: 1080,
    likes_count: 245,
    scheduled_for: '9:47 PM',
    full_text: `The moneylender of Alexandria lived in perpetual dread of robbers. He hired German locksmiths to build an underground strongroom beneath his bedroom with a three-ton granite drop-slab door. The mechanism was ingenious: at sundown, a water-clock released an iron catch, dropping the slab into a leaded groove. It could only be raised from the outside by three men turning a capstan winch.

Every evening, the moneylender took a wax taper into the vault to count his silver talents and gold staters.

"Here alone," he murmured, running his dry fingers through the coins, "I am sovereign and safe."

Greed creates a sanctuary that is identical to a tomb.

One Thursday evening, absorbed in counting a shipment of newly clipped coins, his elbow knocked the candle taper from its sconce into a bucket of sand. The vault plunged into pitch blackness.

He chuckled, knowing the layout of his room by memory. He walked to the exit archway.

He was twenty seconds late.

Above his head, the water-clock hissed. The iron catch released. The three-ton granite slab crashed into its leaded groove with the sound of a closing crypt. The air pressure blew out his matchbox.

He threw himself against the cold stone, pounding his fists until his knuckles tore. The walls were five feet of solid basalt. His servants on the second floor heard nothing through the insulated vaults.

They assumed their master had departed on a secret journey to Rome to collect debts, as he often did without warning.

When the tax inspectors finally forced the slab three months later, they found five hundred thousand silver staters untouched, and a skeleton lying beside a sack of gold, clutching a useless key.

You can possess wealth, or wealth can bury you. The grave has no pockets.`,
  },
  {
    id: 'bol-024',
    slug: 'the-silver-thread',
    episode_number: 24,
    title: 'The Silver Thread',
    tagline: 'Pulling the thread until the garment falls to pieces.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'He unpicked the embroidery of his wife’s heirloom robe to melt the three drachmas of silver wire.',
    published: true,
    publish_at: '2026-09-24T21:47:00Z',
    views_count: 990,
    likes_count: 210,
    scheduled_for: '9:47 PM',
    full_text: `The merchant’s wife owned an embroidered silk mantle given to her by her mother on her wedding day. Running through the blue silk were delicate arabesques stitched with fine silver thread drawn from the mines of Lydia.

The merchant, short of capital for a risky maritime speculation in pepper, stared at the mantle during dinner.

"There must be forty drachmas of silver in those sleeves," he calculated silently.

Greed evaluates every sacred covenant solely by the weight of scrap it can be dissolved into.

While his wife was visiting her ailing sister, the merchant took a razor blade to the silk. For three days, he sat in his study unpicking the stitches, pulling the silver wire from the blue fabric. In his greed to extract every fractional grain of metal, his razor slipped repeatedly, slicing through the silk weft, shredding the ancient fabric into useless blue rags.

He melted the extracted wire in a clay crucible.

The yield was pathetic: eleven drachmas of silver, worth roughly the price of two sacks of oats. But the mantle—a priceless masterpiece of twelfth-century Antioch needlework that would have fetched four thousand florins at an imperial auction—was now a pile of greasy rags on the floor.

When his wife returned and saw the shreds in the hearth, she did not scream. She packed her chest, took her dowry documents, and left his house forever.

The merchant sat at his desk, holding an eleven-drachma lump of grey silver in one hand, completely alone in an empty house.

When you weigh love by the ounce, you will always be left with scraps.`,
  },
  {
    id: 'bol-025',
    slug: 'the-tax-on-running-water',
    episode_number: 25,
    title: 'The Tax on Running Water',
    tagline: 'Charging for the rain until the valley dies of thirst.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'He built toll gates across seven mountain streams, only for the farmers to abandon the valley.',
    published: true,
    publish_at: '2026-09-25T21:47:00Z',
    views_count: 930,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The feudal lord inherited a fertile valley blessed with seven freshwater streams tumbling down from the high limestone peaks. He calculated that every family required at least forty gallons of water per day for drinking, cattle, and kitchen gardens.

"Water is land, and land is mine," he announced.

He hired mercenaries to build stone barricades across every stream intake, installing padlocked iron turnstiles. Every bucket required a copper token.

Greed assumes that human beings have no alternatives other than submitting to extortion.

The first month, his treasury overflowed with copper tokens. The lord laughed at his councillors: "You called it tyrannical; I call it recurring revenue."

By the third month, the farmers had stopped complaining. They did not riot. They simply stopped planting cash crops. When the harvest season arrived, eighty families loaded their carts in the dead of night and crossed the mountain pass into the neighboring duke’s territory, where water was as free as sunlight.

The following spring, the seven toll gates stood empty. The stream water overflowed the barricades, eroding the toll houses into mud. The lord had plenty of water, but no one to bake his bread, no one to shear his sheep, and no one to defend his castle walls when bandits approached in autumn.

He died alone in a castle surrounded by rushing streams and rotting unplanted fields.

The earth provides enough for man's need, but never enough for one man's greed.`,
  },

  // --- CHAPTER VI: GLUTTONY (The Salt Water Cistern / Information) ---
  {
    id: 'bol-026',
    slug: 'the-feast-of-hollow-grain',
    episode_number: 26,
    title: 'The Feast of Hollow Grain',
    tagline: 'Consuming everything until the stomach bursts while the soul starves.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'He swallowed seventy platters at the banquet, unable to taste a single saffron grain.',
    published: true,
    publish_at: '2026-09-26T21:47:00Z',
    views_count: 1180,
    likes_count: 285,
    scheduled_for: '9:47 PM',
    full_text: `The governor of the imperial province was known as the Great Consumer. His banquets lasted eighteen hours. Flocks of quails, wild boars stuffed with figs, and sweetmeats imported from Damascus filled the cedar tables.

He ate not because he was hungry, but because the sight of an empty plate made him feel poor.

Gluttony is not a love of food; it is an existential panic that screams whenever intake ceases.

His physician warned him: "Your pulse is racing like a trapped hare. Your liver is hardened like river clay. You must eat broth and bitter herbs for a month."

"Would you have the governor eat like a monastery pauper?" the governor roared, ordering another roasted lamb shoulder glazed with honey and poppy seed.

To speed his consumption, he had servants bring warm salt water so he could vomit between courses, returning to the tables with an empty gullet to shovel more fat and sugar into his teeth. He no longer tasted the rosemary, the saffron, or the wine. Food was simply volume to be forced into the void.

At his fiftieth birthday celebration, while trying to swallow a whole stuffed pigeon in a single gulp to amuse his guests, the bolus lodged in his trachea.

He fell forward into the roast boar platter. His guests, accustomed to his drunken collapses, clapped and cheered, assuming it was a theatrical joke.

By the time someone realized his face was turnip-purple, the Great Consumer was dead, his mouth still packed with grease and saffron rice.

He who cannot say 'enough' will be suffocated by his own excess.`,
  },
  {
    id: 'bol-027',
    slug: 'the-library-of-unread-vellum',
    episode_number: 27,
    title: 'The Library of Unread Vellum',
    tagline: 'Gluttony of the mind: collecting scrolls without applying a single sentence.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'He owned fourteen thousand manuscripts on agriculture, but let his kitchen garden choke with weeds.',
    published: true,
    publish_at: '2026-09-27T21:47:00Z',
    views_count: 1250,
    likes_count: 340,
    scheduled_for: '9:47 PM',
    full_text: `The scholar of Padua spent his lifetime inheritance buying manuscripts. Whenever a caravan arrived from Constantinople or Baghdad, he was first at the docks with gold bags, purchasing codices on navigation, treatises on optics, and commentaries on Aristotle.

His palazzo held fourteen thousand vellum scrolls. They lined the stairways, blocked the dining rooms, and towered to the ceilings in double rows.

"I possess the collective mind of antiquity," he bragged to visiting ambassadors.

Information gluttony hoards words to avoid the agonizing vulnerability of actual creation.

A young student arrived from Verona, asking: "Master, you possess the lost commentary of Hero of Alexandria on water pumps. How does he calculate the cylinder clearance?"

The scholar blinked. He walked through his labyrinth of shelves, reading titles: "Ah, it is here! In this box bound with red ribbon."

"Have you read it?" the student asked with shining eyes.

"I have verified its authenticity," the scholar replied haughtily. "I know its provenance, its copyist, and the watermarks of its parchment."

"Yes, but does the pump work?" the student pressed.

The scholar could not answer. He had never built a pump. He had never tested an optical lens. In forty years, he had not planted an onion or resolved an equation.

When a candle tumbled from his desk during an earthquake, the fourteen thousand dry vellum scrolls caught fire like dried kindling. Within eight minutes, his entire library was a furnace.

The scholar ran into the street, having saved only one small, scorched notebook.

He opened it: forty years of catalogue numbers and purchase prices. Not a single idea of his own.

Knowing everything without doing anything is the most elegant form of idiocy.`,
  },
  {
    id: 'bol-028',
    slug: 'the-well-of-bitter-salt',
    episode_number: 28,
    title: 'The Well of Bitter Salt',
    tagline: 'Drinking seawater because the thirst grows with every swallow.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'Cast away on an island, he drank from the ocean because waiting for rain required discipline.',
    published: true,
    publish_at: '2026-09-28T21:47:00Z',
    views_count: 1040,
    likes_count: 230,
    scheduled_for: '9:47 PM',
    full_text: `Three sailors survived a shipwreck on a barren coral atoll. There was no fresh spring, but clouds hovered on the horizon promising tropical rain by twilight.

The boatswain told his comrades: "Gather palm fronds. Dig catch-basins in the sand lined with sailcloth. When the squall hits, we will have water for thirty days."

Two sailors worked diligently, scraping the sand. The third sailor, crazed with immediate thirst, could not bear the waiting. He crawled to the water’s edge and cupped his hands in the sparkling ocean.

"Do not drink the sea," the boatswain warned, grabbing his shoulder. "It cools the tongue for five seconds, then pulls the water straight out of your blood."

"It is wet right now!" the sailor screamed, knocking the boatswain away.

Gluttony demands immediate gratification, blind to the physiological reality that the remedy is worse than the need.

He drank deeply from the reef water. For two minutes, his dry throat felt relieved. But within twenty minutes, the osmotic pressure of the concentrated brine began dehydrating his cells. His thirst returned three times more intense, accompanied by agonizing stomach cramps.

He crawled back to the surf and drank more. By mid-afternoon, he was raving in delirium, hallucinating rivers of wine, plunging his entire face into the ocean foam.

At sunset, the tropical squall broke over the island. Sweet, cool rainwater poured from the sky in sheets. The two disciplined sailors filled their sailcloth basins with forty gallons of pure water.

They carried a bowl of fresh rainwater to their companion on the beach.

He was already dead of acute saline poisoning, lying in the surf with his mouth full of sand and brine.

Wait for the rain. What you gulp in frantic greed will always poison your well.`,
  },
  {
    id: 'bol-029',
    slug: 'the-drunkards-compass',
    episode_number: 29,
    title: 'The Drunkard’s Compass',
    tagline: 'When the senses are so dulled that the needle points to disaster.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'The captain drank three flagons of rum to celebrate rounding the cape, sailing straight into the breakers.',
    published: true,
    publish_at: '2026-09-29T21:47:00Z',
    views_count: 980,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `The galleon was three leagues off the treacherous reefs of the Breton coast. A dense fog bank was rolling in from the Atlantic, extinguishing the stars one by one.

The navigator entered the captain's cabin with the sounding lead: "Sir, the surf is sounding in the northwest. We must heave to until dawn."

The captain was on his third bottle of distilled Madeira. His cheeks were flushed, his speech loud and magnanimous: "Nonsense! I have sailed these waters for forty years. Bring another flagon, boy! A real sailor can smell the channel in his sleep."

Gluttony dulls the instruments of perception while inflating the illusion of confidence.

He staggered to the binnacle. In his blurred vision, the compass needle seemed to align with the harbor heading. When the lookout screamed from the bowsprit that white water was churning fifty yards ahead, the captain laughed: "That is only dolphin foam!"

He refused to order the helm over.

Ten seconds later, the granite teeth of the reef punched through the oak timbers of the hull like a fist through parchment. The freezing sea rushed into the ballast hold.

The ship broke in two within four minutes. The crew scrambled for the spars, while the drunken captain stumbled into his flooded cabin trying to save his remaining bottles of Madeira from the bilge water.

The sea does not negotiate with altered states. Cold sobriety is the only ballast that keeps a ship off the rocks.`,
  },
  {
    id: 'bol-030',
    slug: 'the-endless-scroll',
    episode_number: 30,
    title: 'The Endless Scroll',
    tagline: 'Consuming news of distant battles while your own ramparts crumble.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'He paid couriers for hourly dispatches from Persia, forgetting his own town gate was unhinged.',
    published: true,
    publish_at: '2026-09-30T21:47:00Z',
    views_count: 1120,
    likes_count: 295,
    scheduled_for: '9:47 PM',
    full_text: `The magistrate of Corinth maintained twenty mounted couriers on the imperial post road. Every day, scrolls arrived detailing the scandals of the Senate in Rome, troop movements in Gaul, and currency debasement in Alexandria.

He spent ten hours a day unrolling papyrus sheets, arguing passionately with his aides about politics fifteen hundred miles away.

"We must stay informed!" he declared, chewing imported olives. "Knowledge of global affairs is the mark of a statesman."

Modern gluttony is the consumption of irrelevant distant noise to avoid the terrifying quiet required for local responsibility.

While the magistrate studied the troop movements of Julius Caesar in the northern forests, Corinth’s own municipal water pipes burst. Raw sewage leaked into the public fountains. The city market was overrun with short-weight merchants selling rancid olive oil. The city wall had a breach forty paces wide where teenagers climbed in and out to vandalize the public baths.

When a delegation of local citizens came to his office begging for water repairs, the magistrate shushed them:

"Quiet! A messenger has just arrived from Cappadocia! The king’s nephew has divorced his third wife!"

The citizens looked at each other, walked out of the hall, and refused to pay municipal taxes.

Three weeks later, a ragtag band of fifty mountain pirates walked through the un-repaired breach in the city wall, sacked the treasury, and burned the magistrate's papyrus archive without facing a single organized guard.

Turn off the noise of the empire. Fix the pipe in your own kitchen first.`,
  },

  // --- CHAPTER VII: LUST (The Silhouette on the Silk / The Architecture of Lust) ---
  {
    id: 'bol-031',
    slug: 'the-wax-effigy',
    episode_number: 31,
    title: 'The Wax Effigy',
    tagline: 'Loving the surface reflection until the flame reveals its hollowness.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'He fell in love with a painted mannequin in a shop window, bankrupting his forge to dress it in silk.',
    published: true,
    publish_at: '2026-10-01T21:47:00Z',
    views_count: 1190,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `The tailor of Venice crafted a mannequin from beeswax and powdered marble to display his wedding gowns. The mannequin had painted violet eyes, porcelain-tinted cheeks, and a mouth frozen in an enigmatic, submissive smile.

The apprentice tailor grew obsessed with the figure. At night, after the master locked the shop, the young man would sit in the candlelight talking to the wax woman.

"She never complains," he told his reflection. "She never asks for bread. She never disagrees with my poetry."

Lust is not the desire for intimacy; it is the desire for gratification without the friction of another human soul's sovereign reality.

He began spending his wages on pearl earrings for the mannequin. When his childhood sweetheart asked him why he no longer walked with her on the canal quays, he looked at her calloused hands and tired eyes with disdain: "You are too coarse. You have opinions. You frown when you are cold."

He moved the mannequin to his rented garret. During a harsh winter freeze, he lit four charcoal braziers in the small room to create the warmth he imagined his silent bride deserved.

He fell asleep at her feet.

The charcoal braziers heated the room to forty-five degrees. When the apprentice woke at dawn, his perfect bride had not smiled at his poetry.

The beeswax had melted. The violet eyes were two glass beads floating in a pool of rancid yellow wax on the floorboards. The pearl earrings were tangled in a sludge of synthetic tallow.

Real love embraces the roughness of living stone. Lust falls in love with wax and wakes up drowned in grease.`,
  },
  {
    id: 'bol-032',
    slug: 'the-mirage-on-the-oasis',
    episode_number: 32,
    title: 'The Mirage on the Oasis',
    tagline: 'Chasing the phantom city across three hundred leagues of salt.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'He abandoned his caravan to ride toward the shimmering crystal towers in the dunes.',
    published: true,
    publish_at: '2026-10-02T21:47:00Z',
    views_count: 1080,
    likes_count: 260,
    scheduled_for: '9:47 PM',
    full_text: `The camel driver had guided sixty caravans across the Empty Quarter without losing a single beast. He knew the waterholes, the salt pans, and the alignment of the North Star.

On the eighth day of a scorching crossing, heat shimmering off the white quartz gravel created an atmospheric inversion. Three miles to the east, above the dunes, appeared the crystal towers of an ethereal city: fountains of cool water splashing into jade basins, silk canopies fluttering in a breeze that did not exist.

The driver stopped his camel.

"Do not look at the shimmer," the caravan master ordered. "It is the breath of the salt pan reflecting the sky over Oman."

"No," the driver whispered, his eyes wide with desperate infatuation. "I have smelled that garden in my dreams. A woman in gold is waiting on the balcony."

Lust projects its own unresolved hunger onto the desert and calls the hallucination destiny.

He unhitched his finest dromedary from the pack train, took two waterskins, and rode away from the marked trail toward the shimmering towers.

The caravan master blew his horn three times, then continued toward the real well.

The driver rode for three hours. The towers never grew closer; they floated on the horizon like a mocking silk veil. When the sun passed the zenith, the thermal inversion collapsed.

The crystal city dissolved in thirty seconds.

All that remained was three hundred square leagues of blinding, white, bone-dry salt crystals reflecting a sixty-degree sun. His dromedary collapsed of heat exhaustion. His waterskins were dry.

They found his bones two years later, thirty miles off the trade route, his face turned toward the empty sand.

Hold fast to the marked road. The desert does not build palaces for fools.`,
  },
  {
    id: 'bol-033',
    slug: 'the-velvet-cage',
    episode_number: 33,
    title: 'The Velvet Cage',
    tagline: 'Trading sovereign independence for the perfume of the salon.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'The court poet surrendered his sharp wit to become the lapdog of the duchess’s bedchamber.',
    published: true,
    publish_at: '2026-10-03T21:47:00Z',
    views_count: 1010,
    likes_count: 240,
    scheduled_for: '9:47 PM',
    full_text: `In his youth, Mateo was the fiercest satirist in Florence. His verses dismantled corrupt bishops and exposed usurious bankers. He lived in a cold attic, but his pen made tyrants tremble behind their crenellations.

Then the Duchess of Lucca invited him to read at her private villa.

She gave him a velvet doublet with silver buttons. She poured him Greek wine infused with violets. She offered him a suite of rooms with silk tapestries and an allowance of five hundred ducats a year—on one condition.

"Write only of my beauty, Mateo," she whispered, her fingers grazing his chin. "Leave the politics to ugly men."

Lust trades the prophetic sword of sovereign truth for the warm lap of immediate comfort.

Mateo accepted the velvet. For seven years, he lived in her scented rooms. His verses became sweet, soft, and entirely toothless. He wrote forty odes to her eyelashes, sixteen sonnets to her emerald necklace, and eighty ballads to her lapdog.

His old comrades in Florence stopped reading his work. "Mateo is dead," they said on the street corners. "Only his clothes remain in Lucca."

When the Duchess turned forty-five, she grew bored of his compliments. She met a younger lute player from Provence with darker curls and sharper cheekbones.

She had her guards pack Mateo’s things into a pine chest and set him outside the castle gate in the rain.

He walked down the muddy road to the tavern. He took out an ink horn and a quill to write a satire on the Duchess’s cruelty.

He sat for six hours staring at the blank paper. The sharp edge of his mind had dissolved in violet wine and velvet cushions. He could only remember rhyming 'eyes' with 'skies'.

He had traded his sovereign lightning for seven years of perfume.

Guard your hunger. What flatters the flesh always dulls the blade.`,
  },
  {
    id: 'bol-034',
    slug: 'the-painted-fresco',
    episode_number: 34,
    title: 'The Painted Fresco',
    tagline: 'Worshipping the color on the plaster while the church wall cracks.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'The friar spent twenty years painting angelic faces, neglecting the roof that let in the rain.',
    published: true,
    publish_at: '2026-10-04T21:47:00Z',
    views_count: 940,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `Brother Lorenzo was the finest fresco painter in the Franciscan order. Assigned to the small mountain chapel of San Damiano, he spent every waking hour on scaffolding, painting the angelic hosts across the vaulted ceiling.

He was obsessed with the faces of the seraphim. He used powdered lapis lazuli for their robes and pulverized gold leaf for their halos. He spent three weeks shading the curve of a single angel's jawline.

The prior warned him: "Lorenzo, the slate tiles on the north roof were damaged by the winter hail. Water is seeping into the roof rafters. You must help the brothers re-tile the roof before autumn."

"Would you have an artist haul slate?" Lorenzo scoffed, touching his sable brush to the wet plaster. "I am capturing the divine gaze. The roof can wait."

Lust for aesthetic ecstasy blinds the creator to the structural integrity that protects the canvas.

In late October, a three-day torrential downpour inundated the valley. The damaged north roof absorbed hundreds of gallons of water. The saturated oak rafters rotted and swelled.

On a Sunday morning, while Lorenzo was applying the final touch of cinnabar to the seraph's lips, the main collar tie of the roof fractured with a deafening snap.

The entire timber framework collapsed inward. Four tons of soaked slate and broken oak beams tore through the ceiling plaster.

The painted fresco—twenty years of lapis lazuli, gold leaf, and delicate seraphic smiles—was obliterated in four seconds, reduced to grey rubble on the flagstone floor.

Lorenzo climbed out of the wreckage with broken ribs and a shattered wrist, holding a broken wooden paintbrush in the pouring rain.

Build the roof first. Art without shelter is just colorful ruin.`,
  },
  {
    id: 'bol-035',
    slug: 'the-song-of-the-false-siren',
    episode_number: 35,
    title: 'The Song of the False Siren',
    tagline: 'Steering into the jagged reef because the melody was seductive.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'The helmsman surrendered the wheel to follow a voice singing on the lee shore.',
    published: true,
    publish_at: '2026-10-05T21:47:00Z',
    views_count: 910,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The merchant vessel was beating against a gale off the Peloponnese. Every sailor knew the rules of the passage: stay two leagues off the lee shore; the current pulls violently toward the black volcanic shoals where eighty ships had left their ribs in the sand.

As midnight approached, the gale dropped to a light breeze. From the cliffs across the dark water came the sound of singing: a woman’s voice, sweet as clover honey, singing an ancient Ionian melody of rest, warm beds, and unending peace.

The young helmsman felt his hands tremble on the oak spokes.

"Listen," he whispered to the watch. "She is calling my name. She knows the sorrow of my voyages."

Lust hears in every external illusion the exact promise of relief that its own undisciplined soul craves.

He adjusted the tiller by two points toward the shore.

The second mate rushed to the quarterdeck: "What are you doing? The lead line shows five fathoms and shoaling fast!"

"Can you not hear her?" the helmsman shouted, his eyes wild with desire. "Would you sail into the dark sea when paradise is waiting on the beach?"

He fought the mate for the tiller. In the struggle, the ship drifted into the rip current.

The keel struck the volcanic ledge with a grinding crunch that tore the rudder from its pintles. The surf lifted the vessel and smashed it against the basalt cliffs.

As the helmsman was thrown into the freezing foam, he looked up at the moonlit ledge where the siren had been singing.

There was no woman. There was no paradise.

There was only a wind vortex whistling through a narrow fissure in the hollow volcanic rock, producing a melodic tone as the gale rushed through the stone flue.

He drowned chasing the whistle of the wind.

Bind yourself to the mast of duty. The voices on the lee shore are always death.`,
  },

  // --- CHAPTER VIII: DISCERNMENT (The Eighth Virtue) ---
  {
    id: 'bol-036',
    slug: 'the-plumb-line-in-the-dark',
    episode_number: 36,
    title: 'The Plumb Line in the Dark',
    tagline: 'Gravity does not lie, even when the torches flicker.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'The apprentice learned that when opinions clash, you hang a lead weight and wait for it to settle.',
    published: true,
    publish_at: '2026-10-06T21:47:00Z',
    views_count: 1480,
    likes_count: 395,
    scheduled_for: '9:47 PM',
    full_text: `The city council was locked in a violent dispute over the construction of the public granary wall. The conservative faction claimed the wall was leaning outward by three inches and must be torn down. The progressive faction claimed the wall was perfectly plumb and that the opposition was motivated by political sabotage.

Architects were summoned. They brought complex astrolabes, copper quadrants, and thick volumes of geometric commentary. They shouted at one another for three days in the guildhall, quoting Vitruvius and drawing competing diagrams on slate boards.

An old master mason, deaf in his left ear and wearing an apron stained with sixty years of mortar, walked into the chamber holding an ordinary piece of braided hemp string with a cone-shaped lead weight tied to the end.

"Gentlemen," he said, his voice quiet as dry sand, "bring your lanterns."

Discernment does not shout in the forum; it applies the unalterable laws of reality to the work.

They walked to the disputed wall under the night sky. The politicians continued to argue as the torches flared in the wind.

The old mason stepped up to the north corner. He pressed the hemp cord against the top ashlar stone. The lead weight dropped twenty cubits through the air, dangling two inches above the foundation flagstone.

The cord swung back and forth in the breeze. The mason stood with his hands folded in his apron, waiting.

The politicians fell silent, watching the lead weight. Slowly, the oscillation ceased. Gravity claimed the line.

The lead cone hung exactly one half-inch away from the bottom stone. The wall was out of plumb by less than the thickness of a carpenter’s thumb.

"The wall stands," the mason said simply, cutting the cord with his pocketknife. "Go home to your wives."

The politicians looked at the lead line, then at each other, and walked away without uttering another word.

When the world drowns in rhetoric, drop the plumb line. Truth does not require an argument.`,
  },
  {
    id: 'bol-037',
    slug: 'the-sieve-of-coarse-flour',
    episode_number: 37,
    title: 'The Sieve of Coarse Flour',
    tagline: 'Separating the wheat from the chaff before the fire is lit.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'She refused to bake the dough until she shook the horsehair sieve three times.',
    published: true,
    publish_at: '2026-10-07T21:47:00Z',
    views_count: 1210,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `The village baker was pressured by the harvest festival committee to produce five hundred loaves of white bread by sunrise. The grain shipment had arrived late from the valley, damp and mixed with field dirt, stone chips, and bitter darnel weed seeds.

"Just mill it all together," the festival chairman urged, waving his gold signet ring. "The peasants will never taste the difference once it is baked with honey and aniseed."

The baker shook her head. She brought out three round sieves woven from coarse black horsehair.

"If I bake darnel into the loaf," she answered, "the bread will look golden, but the children will vomit before noon. I do not bake lies to meet a schedule."

Discernment is the courage to filter out poison while the crowd screams for speed.

She poured the flour into the horsehair sieve. She shook it with rhythmic, patient arm strokes. First came the gravel and stone chips, rattling against the mesh. Then came the black darnel seeds, bitter and toxic. Only the clean, white endosperm fell through into the kneading trough.

The festival chairman stamped his boots: "You are wasting two hours! The other bakers are already stoking their ovens!"

"The other bakers are selling poison with honey," she whispered without stopping her rhythm.

At dawn, the festival bread was eaten across the square. By noon, eighty citizens who had bought bread from the rushed bakers were doubled over with violent intestinal spasms from un-sieved darnel weed.

Only those who had bought the loaves stamped with the woman’s horsehair mark sat peacefully beneath the olive trees, nourished, healthy, and alert.

Filter the source. Speed is the enemy of purity.`,
  },
  {
    id: 'bol-038',
    slug: 'the-lamp-in-the-gale',
    episode_number: 38,
    title: 'The Lamp in the Gale',
    tagline: 'Protecting the small wick that shows the step in front of you.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'He cupped his palm around a single horn lantern while the bonfire blew away in embers.',
    published: true,
    publish_at: '2026-10-08T21:47:00Z',
    views_count: 1150,
    likes_count: 290,
    scheduled_for: '9:47 PM',
    full_text: `A hurricane struck the harbor town of St. Malo. The town council, desperate to guide the fishing fleet back through the treacherous granite gap, ignited a massive bonfire on the outer mole using twenty barrels of pitch and dry cedar timbers.

The bonfire flared fifty feet into the black sky. But the seventy-knot gale caught the unshielded flames, shredding the fire into wild, blinding sparks that drifted across the bay, blinding the helmsmen and igniting the sails of three docked schooners.

The light was immense, but it offered no orientation.

An old pilot walked out along the wet jetty. He carried a small storm lantern crafted from brass and thin, translucent sheets of scraped horn. Inside was a single beeswax candle.

The horn lantern cast only enough light to illuminate three feet of wet stone in front of his boots. But because the horn casing was sealed with tight lead seams and a baffled chimney, the gale could not snuff the wick.

The pilot climbed to the extreme spit of the breakwater. He stood still in the screaming wind, holding the small lantern at arm's length, pointing directly at the safe deep-water channel.

Discernment does not seek to illuminate the entire storm; it provides an unshakeable point of reference that does not blow out.

Out in the black surf, the captain of the lead fishing smack looked past the blinding, chaotic inferno of the burning mole. His eyes caught the tiny, steady, golden point of the pilot's horn lantern.

"Steer for the horn," the captain commanded the helmsman.

Six smacks followed the single point of steady light through the gap into the quiet basin, safe and whole.

Do not be blinded by roaring fires that cast sparks in all directions. Look for the steady wick that survives the gale.`,
  },
  {
    id: 'bol-039',
    slug: 'the-anchor-in-deep-mud',
    episode_number: 39,
    title: 'The Anchor in Deep Mud',
    tagline: 'When the surface storm rages, hold to the ancient seabed.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'He did not drop iron on the smooth shale; he waited until his sounding lead touched heavy clay.',
    published: true,
    publish_at: '2026-10-09T21:47:00Z',
    views_count: 1090,
    likes_count: 275,
    scheduled_for: '9:47 PM',
    full_text: `The fleet was caught on a lee shore in the Aegean Sea. The wind was gusting to force nine, driving eight galleys toward the jagged limestone cliffs.

The younger captains panicked. As soon as their vessels drifted into twenty fathoms, they dropped their four-fluked iron anchors. But the seabed was smooth volcanic shale. The iron flukes skipped and scraped across the rock like fingernails on slate, dragging thirty yards a minute while the crews wept and prayed.

The veteran captain of the flagship stood on the forecastle with his leadsman.

The leadsman lowered the tallow-primed lead weight: "Twenty fathoms, sir! Smooth rock!"

"Hold the cable," the captain ordered.

"We are three hundred yards from the breakers!" the first mate screamed, grabbing the anchor brake. "Drop now!"

The captain struck the mate's hand away with his belaying pin. "Drop on shale, and you drag to your death. Wait for the trench."

Discernment has the terrifying composure to wait for the proper foundation while panic demands useless action.

Two minutes passed. The roar of the surf on the cliffs was deafening. The spray was soaking the quarterdeck.

The leadsman pulled up the lead: "Fifteen fathoms! Heavy grey clay in the priming!"

"Drop," the captain whispered.

The heavy bower anchor plunged into the sea. The cable roared through the hawsepipe until the hemp tightened like a bowstring. The fluke sank three feet into the dense subterranean clay of the ancient river delta.

The ship brought up head to wind with a shudder that threw the crew to their knees. The anchor held.

While the seven other galleys dragged their anchors across the smooth shale and shattered against the rocks, the flagship rode out the night fifty yards from the cliffs, tethered to the mud beneath the storm.

Do not drop your anchor in the first shallow refuge. Search for the mud that holds.`,
  },
  {
    id: 'bol-040',
    slug: 'the-master-masons-silence',
    episode_number: 40,
    title: 'The Master Mason’s Silence',
    tagline: 'The stone is set. The tools are wiped. Let the building speak.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'After fifty years of building across empires, he laid down his trowel without signing his name.',
    published: true,
    publish_at: '2026-10-10T21:47:00Z',
    views_count: 1650,
    likes_count: 480,
    scheduled_for: '9:47 PM',
    full_text: `At the dedication of the great stone bridge across the Danube, emperors and prelates gathered in gold vestments. The heralds sounded silver trumpets. The chancellor read a proclamation of sixty paragraphs praising the vision of the imperial treasury and the glory of the dynasty.

The crowd looked for the master mason who had spent twenty-two years living in a wooden hut beside the river, calculating the piers, surviving three winter ice-jams, and burying two sons in the foundation quarry.

They found him standing at the third pier, wiping his steel trowel with an oiled cloth.

"Master," the chancellor called out, gesturing to the vellum scroll, "step forward and sign your name beneath the emperor’s seal, that history may remember who drew these stones!"

The old mason looked at the vellum, then at the massive granite piers resting thirty cubits deep in the bedrock of the river.

He slipped his oiled trowel into his leather bag, picked up his walking stick, and adjusted his wool cap.

"The river will inspect these arches every spring," the mason said in his quiet, cracked voice. "If the arches stand for five hundred winters, the stones will remember who laid them. If they fall, my name on your calfskin will not keep a single cart out of the water."

He turned his back on the silver trumpets, walked across the bridge he had built, and took the footpath into the quiet oak forest without looking back.

Discernment knows that the ultimate signature is not ink on parchment; it is the endurance of the work when the cheering stops and the river rises.

Build the floor. Build the arches. Let the sky and the water test the truth.`,
  },
];

export function getBookOfLiesBySlug(slug: string): BookOfLiesEpisode | undefined {
  if (!slug) return undefined;
  // Check local storage for custom stories first
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem('jadai_custom_episodes');
      if (customStr) {
        const customList: BookOfLiesEpisode[] = JSON.parse(customStr);
        const match = customList.find(
          (e) => e && (e.slug === slug || String(e.episode_number) === slug || e.id === slug)
        );
        if (match) return match;
      }
    } catch {}
  }
  return MASTER_40_EPISODES.find(
    (e) => e && (e.slug === slug || String(e.episode_number) === slug || e.id === slug)
  );
}

export function getAllBookOfLies(filters?: { sin?: string; act?: number }): BookOfLiesEpisode[] {
  let list = [...MASTER_40_EPISODES.filter(Boolean)];
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem('jadai_custom_episodes');
      if (customStr) {
        const customList: BookOfLiesEpisode[] = JSON.parse(customStr);
        list = [...customList, ...list];
      }
    } catch {}
  }
  if (filters?.sin && filters.sin !== 'All') {
    list = list.filter((e) => e.sin_category && e.sin_category.toLowerCase() === filters.sin?.toLowerCase());
  }
  if (filters?.act) {
    list = list.filter((e) => e.act === filters.act);
  }
  return list;
}
