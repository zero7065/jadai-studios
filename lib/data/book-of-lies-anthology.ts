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
    tagline: 'He measured the skyline every day and the ground never once.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'The tower rose forty floors on a story the analysts stopped believing in. He dismissed the unit economics the way his kind always dismisses the well-digger: as mud.',
    published: true,
    publish_at: '2026-09-01T21:47:00Z',
    views_count: 1420,
    likes_count: 312,
    scheduled_for: '9:47 PM',
    full_text: `The tower went up in the Ikoyi business district with his surname cast into the canopy in letters a man could read from the water. Forty floors of glass, a lobby engineered to make visitors feel underdressed, and a launch gala where the champagne cost more per bottle than his product earned per user. He stood beneath the letters that night and gave the speech he had been rehearsing for nine years: that vision, held long enough, becomes infrastructure.

The head of finance had been sending a different kind of letter for eleven months. Not dramatic. Spreadsheet cells colored amber, the quiet grammar of a treasury asking to be read. Unit economics soft in two markets. CAC above lifetime value since March. The seed round spent the way a man spends when the room is clapping.

Vision without unit economics is not faith. It is a load-bearing fantasy, and fantasies keep their own weather.

He knew all of this. He had simply calculated, the way builders calculate, that the ground would hold because he had never heard it complain.

The announcement came on a Tuesday that felt like a Sunday: bridge funding withdrawn, operations consolidated, the tower sublet floor by floor to companies whose names nobody would read from the water. The letters over the canopy stayed up for six weeks after the staff left, until the rains came and the mounting corroded and one letter detached in the night and hung at an angle.

Reporters called it a collapse. Those who had watched from the beginning knew it as something slower and more honest: a structure finally agreeing with the ground it had been asked to ignore.

Build the floor before the sky. The sky has never once covered a mortgage.`,
  },
  {
    id: 'bol-002',
    slug: 'the-mask-of-pure-marble',
    episode_number: 2,
    title: 'The Mask of Pure Marble',
    tagline: 'He curated the man beyond repair and locked the original in a drawer.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'Eleven hundred posts, zero unflattering photographs, a self polished to museum grade. Then someone real walked into the room and did not recognize the exhibit.',
    published: true,
    publish_at: '2026-09-02T21:47:00Z',
    views_count: 1280,
    likes_count: 290,
    scheduled_for: '9:47 PM',
    full_text: `There were no bad photographs of him. Not one in eleven hundred posts. The lighting was checked before the coffee was ordered. His team had a phrase for the process, "version control for the face," and the joke stopped being funny the quarter he began declining meetings with people who did not see him first through a screen.

The mask had begun as courtesy. Nobody needs every angle published. Somewhere in year four, though, the courtesy hardened into policy, and the policy into a theology: that the curated man was the real one, and the rest was rough stock.

Pride's final form is not arrogance. It is the refusal to be seen in progress, because progress is ugly and ugly does not convert.

The test arrived as a twenty-four-year-old designer with no regard for his mythology, sent to sit beside him for a week. She watched him rehearse a casual answer three times before saying it. She watched him re-shoot a thank-you video until the gratitude had the right lighting. And at the end of the week, she said the sentence he paid a retainer to never hear:

"You are very well preserved. Is there anyone still in there being made?"

He answered with the mask's standard reply — something about standards — and felt it land, for the first time, like a line in a play nobody had bought tickets for.

That night he posted nothing. The silence cost him forty thousand impressions and bought back the only asset the marble could not carry: the right to still be rough.

Perfection is a finished thing, and finished things are displayed, not lived. Let them see the quarry while it is still a quarry.`,
  },
  {
    id: 'bol-003',
    slug: 'the-pedestal-on-the-faultline',
    episode_number: 3,
    title: 'The Pedestal on the Faultline',
    tagline: 'The whole statue stood on one client, one platform, one yes.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'For six years he was the category name, quoted in decks he had never read. The pedestal did not tremble when he fell. It simply admitted what it had always been.',
    published: true,
    publish_at: '2026-09-03T21:47:00Z',
    views_count: 1110,
    likes_count: 245,
    scheduled_for: '9:47 PM',
    full_text: `They called him the category. Journalists used his company's name as a verb. In conference panels, rivals described themselves, respectfully, as "not quite yet him," and he had developed the particular tan of men who mistake the warmth of attention for structural integrity.

Underneath, the accounting was simpler than the mythology: one enterprise client carried sixty-one percent of revenue, one platform carried ninety percent of distribution, and both arrangements had renewal dates that appeared in no speech he had ever given.

Pride is not believing you are tall. It is forgetting what you are standing on.

The renewal email arrived without malice, which was worse. Procurement had consolidated vendors. Nothing personal; the category had matured. He read it in the back of a car in another city where he had gone to give a talk about durable growth, and for a full minute the only sound was the driver indicating to change lanes.

He wanted to be angry at them. The data would not let him: he had met the procurement officer twice, ignored both invitations to dinner, and told his head of sales that logos like that "chase us anyway."

The pedestal never shook. Faultlines do not shake; they open, having been open the whole time, politely waiting for the statue to notice the ground.

He rebuilt on twenty clients by the following spring, smaller logos, smaller margin, and slept, for the first time in six years, without checking whose calendar controlled his.

A monument is only as independent as the ground beneath it. Ask what you stand on before the ground asks you.`,
  },
  {
    id: 'bol-004',
    slug: 'the-inscribed-shield',
    episode_number: 4,
    title: 'The Inscribed Shield',
    tagline: 'Every scar had a story. He had stopped collecting the kind without plaques.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'The awards wall was curated, dated, and lit. Then the first real blow arrived — unannounced, unphotographed, and found nothing on the shelf.',
    published: true,
    publish_at: '2026-09-04T21:47:00Z',
    views_count: 1045,
    likes_count: 218,
    scheduled_for: '9:47 PM',
    full_text: `The shield hung in reception where every visitor passed it: engraved with the awards, the features, the one interview in which a respected editor had called him "the future of the discipline." His staff gave tours starting there. He had heard the script so often he could do it in his sleep, and suspected some of the visitors could too.

Real blows do not announce themselves in advance, which is why they keep their own museum. It arrived as a defect notice — small, technical, boring — buried in a batch shipped to his most conservative client. No one died. A deadline did. The client, courteous to the last line, invoked the clause that had never once been tested and ended the contract by Thursday.

He looked for the shield's counsel and found that it had none. Awards do not litigate. Features do not answer phones. The inscription, so comforting in the lobby, had been written entirely by people who would not be in the room.

Pride mistakes the record of past wars for armor against the next one.

He did the unglamorous arithmetic that weekend: the defect's path, the three approvals that had been shortcuts wearing the costume of speed, the engineer who had flagged it in a comment no one resolved. Then he called the client himself, without the script, without the shield, and read the failure aloud in his own voice, in order, leaving nothing out.

The contract was reinstated at a reduced term. The shield stayed where it was, but a new line joined the reception script, delivered by the staff who now understood it: this hangs behind us, and the work still has to hold.

A shield records what you survived. It has never once stopped the next sword.`,
  },
  {
    id: 'bol-005',
    slug: 'the-crown-of-hardened-clay',
    episode_number: 5,
    title: 'The Crown of Hardened Clay',
    tagline: 'The drought asked him to bend. He answered with the crown.',
    act: 1,
    sin_category: 'Pride',
    teaser: 'When the market turned, every rival cut, adapted, and apologized in the same quarter. He alone issued a memo about standards, and watched the room empty politely.',
    published: true,
    publish_at: '2026-09-05T21:47:00Z',
    views_count: 980,
    likes_count: 201,
    scheduled_for: '9:47 PM',
    full_text: `The memo went out on company letterhead in a quarter when letterhead was the wrong instrument: revenue down thirty percent, the market in the specific silence that follows a bubble, every serious rival already cutting salaries and scope with the same grim courtesy. His memo said the opposite. We do not discount the work. We do not chase the weather. We hold the standard, because standards are what remain when the market remembers itself.

He signed it the way men sign things they have confused with courage.

Leadership has a counterfeit, and it is called rigidity. The crown is clay the moment it refuses to move, however golden it photographs.

The room did not rebel. That was the horror of it. People read the memo, replied "understood," and resigned in ones and twos over the following weeks, each departure framed in the language of the memo: pursuing other opportunities, seeking environments more aligned with flexibility. His best engineer of nine years left last, with a note that contained no anger at all, only arithmetic: "The standard you are protecting is one I can no longer afford to believe in."

He kept the crown. He kept the letterhead. By autumn it was the two of them in a building designed for eighty, the standard intact and unshared, the market having learned precisely nothing from his example because there was nothing left to learn from.

Holding the line is only leadership when the line is where the people are. Otherwise it is a statue saluting its own reflection while the city quietly relocates.

The drought does not reward the hardest clay. It rewards the roots.`,
  },

  // --- CHAPTER II: ENVY (The Currency of Greed / Comparison) ---
  {
    id: 'bol-006',
    slug: 'the-boundary-stone',
    episode_number: 6,
    title: 'The Boundary Stone',
    tagline: 'Two partners, one stone, and a harvest measured against the other side.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'They cleared the same ground from opposite ends. The envy arrived the season his brother\'s trees began to fruit first, and the stone, which had been a promise, became a scoreboard.',
    published: true,
    publish_at: '2026-09-06T21:47:00Z',
    views_count: 1350,
    likes_count: 320,
    scheduled_for: '9:47 PM',
    full_text: `The stone between their plots had been set by their father with one instruction: neither side moves it, and neither side counts the other's harvest. For eleven years the instruction held. They shared tools, warned each other about frost, and drank on the same veranda with the ease of men who had agreed, early, that the fence was a formality.

Then his sister's farm won the regional award, and the photographs traveled further than the congratulations. He watched her buyers turn down his road without stopping. He watched the cooperative give her the better seed. He began, without deciding to, keeping a second set of numbers in his head: not his yield, but the gap.

Envy is not wanting the neighbor's field. It is secretly converting your own harvest into a ratio with theirs, and then farming the ratio.

The first act was small enough to deny: he stopped sharing the irrigation pump in the dry weeks, calling it maintenance. The second was smaller and worse: he let a rumor stand that her prize produce had been sorted with chemicals. It traveled the way relieved news travels.

The boundary stone stayed exactly where it was. He was the one who moved, and only in the direction that mattered — away from his own acreage, toward the scoreboard, which does not grow anything and never has to water.

Her crop failed the following year from a blight that came from the river, not the rumor, and it changed nothing. His had failed the year before that, quietly, in the part of the season nobody photographs: the mornings he spent looking east.

Count your own field twice before you count your neighbor's once. The stone was never keeping her in. It was keeping the ratio out.`,
  },
  {
    id: 'bol-007',
    slug: 'the-stolen-blueprint',
    episode_number: 7,
    title: 'The Stolen Blueprint',
    tagline: 'They copied the drawing to the millimeter and never once visited the quarry.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'A rival shipped his exact system in ninety days and called it innovation. Six months later, the copy was flawless — and failing in ways only the original could diagnose.',
    published: true,
    publish_at: '2026-09-07T21:47:00Z',
    views_count: 1190,
    likes_count: 274,
    scheduled_for: '9:47 PM',
    full_text: `The competitive teardown was thorough, he would give them that: screenshots annotated down to the padding, the flows rebuilt in their own stack, the pricing copied with the decimal intact. Within a quarter their version was in market, cheaper, faster to demo, and praised in the trade press for its clarity — clarity being what a system looks like when someone else has already paid for the confusion of inventing it.

He felt the heat, then the strange calm that follows it. Every blueprint is a description of decisions, and decisions are the only part that cannot be photographed.

They had his structure. They had not been present for the four years of broken assumptions the structure sat on: why field three exists, why that step cannot be automated, why the customer's lie about their workflow must be routed around rather than trusted. The drawing showed the walls. It never showed the arguing.

Envy steals the map and calls it territory. The copyist does not want your craft; he wants your head start, and head starts cannot be transferred, only re-earned.

Their failure arrived as support tickets in a dialect only he could read. Meanwhile his team, freed from defending the architecture, shipped the next three moves the blueprint had never contained, because the blueprint had never been the asset. The asset was the quarrymen.

The rival's version still runs. It runs well, and it runs in circles, which is what precision looks like when it is divorced from judgment.

Copy the wall all you like. The quarry closes at dusk, and the men who know where the stone comes from have already gone home with it.`,
  },
  {
    id: 'bol-008',
    slug: 'the-shadow-of-the-neighbor',
    episode_number: 8,
    title: 'The Shadow of the Neighbor',
    tagline: 'He built his entire backyard facing hers.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'Her wins arrived like weather on his side of the fence. He redesigned his house around the forecast, and one morning found he had no south-facing room of his own.',
    published: true,
    publish_at: '2026-09-08T21:47:00Z',
    views_count: 1030,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `The renovation was supposed to be for them: the deck, the long window, the office with morning light. The architect, curious, kept drawing one wall facing east — toward the neighbor's property, where the competitor's signs went up first, their funding was announced first, their hiring glass polished before his own. "You'll want to watch the light come over there," he said, and everyone in the room laughed in the specific way people laugh when a thing is true.

For two years he ran the company as a reaction. Their feature, his roadmap. Their hire, his offer letter. Their pricing page, refreshed nightly at 11 p.m. by him alone, the browser a small shrine.

Comparison is not a mirror. It is a compass that only points at someone else's north, and a man can sail his whole career on it without ever choosing a destination.

The reckoning was quiet. A candidate he wanted said no and, being kind, said why: "I read your strategy deck. It's excellent. It also answers their questions, not yours. I want to work somewhere that has its own."

He sat with the deck after she left. It was true. Every page was a rebuttal. Somewhere in year one they had stopped being a company and become a commentary, and commentaries end when the subject stops publishing.

That winter he turned the desk around. The east window stayed, because the light is genuinely good there, but the work now faced the south wall, where nothing could be seen except the work.

Stop reading the neighbor's mail long enough to write your own. The fence was never a screen; it was a direction he kept choosing.`,
  },
  {
    id: 'bol-009',
    slug: 'the-poisoned-sluice',
    episode_number: 9,
    title: 'The Poisoned Sluice',
    tagline: 'He salted their stream to ruin their crop. The river does not read deeds.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'One anonymous review, one leaked screenshot, one quiet call to a journalist — small poisons released upstream. They traveled the way water travels: indiscriminately.',
    published: true,
    publish_at: '2026-09-09T21:47:00Z',
    views_count: 950,
    likes_count: 198,
    scheduled_for: '9:47 PM',
    full_text: `The opportunity was late-night and deniable: a screenshot of the rival's draft contract, marked-up in a hand that was not hers, forwarded to a journalist who had been waiting for exactly this kind of gift. Within forty-eight hours the story ran. The rival lost the partnership. The industry called it accountability. He called it, privately, weather — something that simply happened to people who left their windows open.

The lie that makes sabotage palatable is that influence, like water, flows downhill in one direction: from you to them.

But the stream served the whole valley. The partnership he had poisoned belonged to a supplier he also used. The journalist, warmed by the gift, began asking about the marks on other people's contracts. And the rival, stripped of one deal, rebuilt on smaller clients who did not read trade press — clients who were, he noticed with a cold drop in the stomach, his next quarter's pipeline.

Envy never checks the map downstream. That is its entire method.

By spring the anonymous hand had become a question people asked openly at conferences, always with a smile, always near the drinks. He found himself explaining a story he had never admitted to telling, to audiences who had not yet decided whether it was a joke.

He left the industry that summer for work that involved no stream at all, and understood at last what the valley had always known: poison does not select. It dissolves, and everything downstream drinks.

Do not open the sluice. The current you aim at a rival will find your own cup before it finds anyone else's.`,
  },
  {
    id: 'bol-010',
    slug: 'the-neighbors-bell',
    episode_number: 10,
    title: 'The Neighbor’s Bell',
    tagline: 'Their success rang daily, right through his wall, and he could not unhear it.',
    act: 1,
    sin_category: 'Envy',
    teaser: 'The funding announcement, the award, the feature in the trade weekly — each one a bell rung on his street. He finally climbed the tower to silence it and found the clapper was inside.',
    published: true,
    publish_at: '2026-09-10T21:47:00Z',
    views_count: 920,
    likes_count: 184,
    scheduled_for: '9:47 PM',
    full_text: `The notification was harmless: a rival's funding announcement, blue on white, the number large enough to read from across the room. He closed the laptop. It opened again in his chest. Within an hour he had read the thread fourteen times, counted the investors against his own, and discovered in himself a sound he had no word for — not anger exactly, more like a bell being struck in a room he thought was private.

Envy's particular cruelty is that it makes other people's good news a debt you have to service.

He tried the standard remedies. Mute. Unfollow. A productivity system so aggressive it would leave no room for the sound. For three weeks the street was quiet. Then the weekly entered his inbox through a colleague's forward, rung once more, and he understood that the volume had never been in their announcements.

The climb took the form, that autumn, of an honest inventory: what precisely did the bell say? Not the words — the claim underneath. It said they were ahead. And underneath that, the sentence he had been avoiding: ahead in a race he had never consciously agreed to run.

He built something in secret for six months, not because secrecy is virtue, but because he wanted one season of work that began with his own name on the invitation instead of theirs. It shipped in the spring to modest applause and no bell, and he felt the strange silence of a man who has left the tower.

Ring your own, or come down from the clapper's room. The neighbor's bell was never installed in their house.`,
  },

  // --- CHAPTER III: WRATH (The Blade with Two Grips) ---
  {
    id: 'bol-011',
    slug: 'the-furnace-of-iron',
    episode_number: 11,
    title: 'The Furnace of Iron',
    tagline: 'The review arrived at 9:04. By 9:06 the work was melting.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'He did not dispute a single word of the critique. He did something far more efficient: he melted the whole forge down and swore he had never called it his.',
    published: true,
    publish_at: '2026-09-11T21:47:00Z',
    views_count: 1150,
    likes_count: 289,
    scheduled_for: '9:47 PM',
    full_text: `The review was fair. That was the insult. A lesser critic he could have handled — cruelty he understood, having practiced it. But the essay was measured, specific, generous in exactly the places that made the conclusion unavoidable: his last three releases had the shape of excellence and the temperature of a man performing it.

He read it standing in the kitchen with the phone at eye level and felt the old furnace open beneath his ribs. Within six minutes he had drafted four replies, deleted three, and archived the repository — his own repository — under a name that translated roughly to "samples."

Wrath does not argue. It eliminates the audience, then the stage, then wonders why the theatre is quiet.

By noon he had told two collaborators the project was paused indefinitely and posted, with the controlled calm of a man announcing weather, that he was "refocusing." The third collaborator, older, called and did not mention the review at all. She asked what the furnace was being used for this time, and whether the iron remembered being useful before it learned to burn.

The question did not cool anything. It only named the cost: nine months of work, spent as fuel, by a man who could not bear to be read correctly.

The essayist never learned what her words had funded. Most don't. The furnace burns on schedule regardless, feeding itself the only currency it accepts — the work itself, fed in, one repository at a time.

Cool the forge first. The metal can wait; the man who keeps melting it cannot.`,
  },
  {
    id: 'bol-012',
    slug: 'the-shattered-anvil',
    episode_number: 12,
    title: 'The Shattered Anvil',
    tagline: 'The room asked one hard question. He answered with the table.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'A procurement panel, a clarifying question about timelines, and thirty seconds that cost the contract he had mortgaged the quarter against.',
    published: true,
    publish_at: '2026-09-12T21:47:00Z',
    views_count: 1080,
    likes_count: 240,
    scheduled_for: '9:47 PM',
    full_text: `The tender was the largest they had ever pursued: two years of runway folded into a single signature, priced down to the point where pride was the only margin left. The panel's final question was small — could the lead engineer confirm the delivery risk flagged in appendix C, and who owned it if the timeline slipped.

The engineer began an honest answer. The founder, standing behind him, interrupted with the correction he had been assembling all morning: the appendix was conservative, the risk overstated, the auditor not qualified to — and there it was, the anvil leaving his hands in the voice everyone in the room recognized, the one that ends meetings.

Silence is a professional instrument in those rooms. It was deployed for eleven seconds, then the chair thanked them, and the minutes recorded what minutes always record: nothing and everything.

Wrath's economy: thirty seconds of relief purchased at the price of everything mortgaged for thirty months.

He replayed it in the car park with the specificity of a man scrubbing a wound. The question had not been an attack. It was a door. Panels ask for the owner of a risk because they intend to shake the owner's hand — and he had answered the handshake with the table.

The contract went to a weaker firm, publicly, in the trade weekly he received every Friday. His team stopped raising risks in his presence after that, which is the second invoice for the same temper: the room learns to hide the very information the anvil was meant to protect.

You do not defend the work by shattering the room where the work is judged. Lay down the hammer; the anvil was never the enemy.`,
  },
  {
    id: 'bol-013',
    slug: 'the-burning-orchard',
    episode_number: 13,
    title: 'The Burning Orchard',
    tagline: 'One crate went missing. He set fire to the harvest to find it.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'A small theft, a smaller betrayal, and a response calibrated entirely by rage — which does not do arithmetic, only area.',
    published: true,
    publish_at: '2026-09-13T21:47:00Z',
    views_count: 1020,
    likes_count: 220,
    scheduled_for: '9:47 PM',
    full_text: `The missing crate was worth less than a week's wages: components, misallocated at worst, stolen at worst-er. He knew every hand that had touched the loading bay, and rage, which is a kind of memory, supplied the name before evidence did — the quiet contractor, always the last to leave, whose cousin worked for a competitor.

What followed was not an investigation. It was a broadcast: access revoked, payment withheld, accusation delivered in a group chat with more participants than facts, the orchard's entire workforce informed of the rot in one furious paragraph. Two other contractors resigned the same afternoon, unwilling to work under a man who sentences before he samples.

Wrath confuses the burned field for the weeded one. Fire is fast, and that is its only argument.

The crate turned up nine days later, under a shelf in the bay, misfiled by a loader who had been too embarrassed to say so. The contractor, for his part, had already taken work elsewhere and did not bother to clear his name; clearing it, he told a mutual acquaintance, would have required staying in a field the man had already set alight.

The harvest that survived was smaller, quieter, and hired at a premium, because word travels: this orchard burns, and the wind carries the story farther than the fruit ever did.

Before you answer a theft with fire, weigh what the flames cannot read: contracts, loyalty, the innocent man standing one row over.

Cool the accusation first. The orchard can afford a missing crate. It cannot afford a farmer who burns to be exact.`,
  },
  {
    id: 'bol-014',
    slug: 'the-double-edged-scythe',
    episode_number: 14,
    title: 'The Double-Edged Scythe',
    tagline: 'He swung at every rival in reach and trimmed his own standing in the same stroke.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'Paranoia sharpened the blade beautifully. The harvest it cut was his name, taken off at the ankles along with everyone else within swing radius.',
    published: true,
    publish_at: '2026-09-14T21:47:00Z',
    views_count: 940,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The scythe was sharp. He kept it that way — late-night subtweet threads assembled with editorial care, a dossier on every competitor's weakness, the precise sentence that could unseat a rival's claim in a panel audience. He never lied exactly. He selected. Selection, done nightly, feels like justice.

The trouble with a double-edged instrument is arithmetic: at the radius required to reach them, you are also within reach of your own blade. Colleagues learned to stand outside the swing. Partners were briefed not to attend events where he would speak.

It peaked at the industry summit: a keynote rebuttal so surgically aimed at the front row that the room applauded the cut and quietly updated its seating chart for the following year. He counted the applause. He did not count the four introductions that never happened afterward, or the candidate who declined citing "culture," or the old friend who now described him, carefully, as "very sharp."

Wrath believes attention and trust are the same currency. They do not clear at the same bank.

The final cut he never saw coming was internal: the board, reviewing the year, noted that his blade had become the firm's public identity, and that clients who feared being selected against eventually stop calling at all.

He retired the scythe to a shelf. Within a season, three rivals he had been swinging at merged without his comment and never mentioned him in the announcement — the merciful sentence a blade earns when it stops cutting: silence where a name used to be.

Swing only where you can afford to stand. The edge you keep for others is measured, every time, against your own neck.`,
  },
  {
    id: 'bol-015',
    slug: 'the-ash-in-the-spring',
    episode_number: 15,
    title: 'The Ash in the Spring',
    tagline: 'The promotion passed him over. He poisoned the water the whole team drank.',
    act: 2,
    sin_category: 'Wrath',
    teaser: 'Bypassed for the role he had trained his successor for, he chose the professional revenge available to every overlooked man: to become, permanently, a temperature.',
    published: true,
    publish_at: '2026-09-15T21:47:00Z',
    views_count: 890,
    likes_count: 175,
    scheduled_for: '9:47 PM',
    full_text: `The announcement named her. He had recommended her, in fact, in a memo so generous it had been forwarded up two levels as a model of leadership — a document he now read as evidence of his own sentencing. Eighteen months of passed-over bitterness, ash where a spring should have been, and the quiet decision that if the title was not his, the room's weather would be.

What ash does to water: it does not stop the flow. It slows it. Reviews arrive sarcastic. Standups become briefings where every risk is named and no solution volunteered. He answered questions with questions, approvals with pauses, and every new initiative inherited the specific lukewarmness of a man who has decided the future is not his to warm.

Wrath's most employable form is not the shout. It is the drip.

New hires felt it first and misread it as seniority's gravity. Her first ninety days were haunted by a deputy whose every concession was technically perfect and spiritually absent, and she understood, with the particular loneliness of the promoted, that the org had handed her a title and a sabotaged engine.

The reckoning arrived as a PIP she refused to write, replaced instead by a conversation in which she read his own memo aloud — the generous one — and asked, without heat, whether he still meant any sentence of it.

He resigned that Friday. Ash, it turns out, can be swept; it was the spring he had been poisoning, and the water had been his own all along.

Do not season the team's water with your disappointment. The bitterness has one taster: the man who poured it.`,
  },

  // --- CHAPTER IV: SLOTH (The Sloth of Progress / The Sleeping Scaffold) ---
  {
    id: 'bol-016',
    slug: 'the-architect-who-drew-clouds',
    episode_number: 16,
    title: 'The Architect Who Drew Clouds',
    tagline: 'Two hundred diagrams of the sky. Not one load-bearing wall.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'His specifications were beautiful, peerless, and published in a folder no builder had opened in a year. The site below him remained, faithfully, a hole.',
    published: true,
    publish_at: '2026-09-16T21:47:00Z',
    views_count: 1220,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `He was the clearest thinker they had. His diagrams — the system drawn whole, each edge labeled, every future state anticipated to the third inflection — were circulated in onboarding decks as examples of rigor. Executives quoted his plans in board meetings. The plans, for their part, had never been deployed.

Because deployment is where thinking meets resistance: the customer who lies about their workflow, the dependency that ships broken, the Tuesday that eats the elegant quarter. The architect of clouds had built a private immunity to all of it. Refinement felt like progress. Revision felt like betrayal. And "not yet — the model isn't complete" had quietly become the firm's unofficial motto.

Sloth's cleverest costume is called preparation, and it works exactly as long as nobody asks for a building.

The question came, as questions do, from outside the cathedral: a client with a deadline and no interest in the sky, asking — politely, then not politely — for the wall the drawings had promised for eighteen months. The room looked at him. He opened his folder. Somewhere in the third diagram he understood that the folder was not a library but a hiding place, built to architectural standard, weatherproof against the only element it feared: being tested.

He shipped a wall that Thursday. It was plainer than the clouds, slightly wrong at the corner, and the first thing in two years the client could lean against.

Draw until it bears weight. Above the ground, every beautiful line is a costume for the fear underneath it — that the real one might not hold.
`,
  },
  {
    id: 'bol-017',
    slug: 'the-rotting-timber',
    episode_number: 17,
    title: 'The Rotting Timber',
    tagline: 'The stack was seasoned, the talent was idle, and the rain had opinions.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'Nine engineers, one warehouse of unwritten potential, and a deadline that finally arrived and asked what, precisely, had been curing all this time.',
    published: true,
    publish_at: '2026-09-17T21:47:00Z',
    views_count: 1050,
    likes_count: 235,
    scheduled_for: '9:47 PM',
    full_text: `The timber had been chosen well: select engineers, senior beyond the headcount, hired in the ambitious year and assigned, at first, to ambitious things. Then the funding changed shape, and the warehouse protocol took hold — no layoffs, no waste, just a policy of keeping good wood under cover while the weather decided what it wanted.

Timber under cover does not stay seasoned. It starts curing in the dark, absorbing the smell of the shed, testing itself against nothing, until the day the builder arrives for a deadline and discovers the stack is past its best by years.

Sloth's accounting trick: idle excellence booked as "retained capacity," and depreciation booked as loyalty.

Three of them had quietly rebuilt their careers into other departments' problems. Two interviewed on Fridays with the camera-off calm of men who had stopped pretending. The rest had learned the warehouse vocabulary — "aligning," "circling back," "when the time is right" — and could hold a status meeting for forty minutes without once touching an object.

The deadline arrived in the form of a launch date announced by the CEO to a room he had not audited. The builder walked into the warehouse that afternoon with the list and the date, and for the first time in eighteen months the timber met the rain: shipped, imperfect, two pieces replaced on site.

What rots fastest in the warehouse is not the wood. It is the reason the wood was cut.

Use the stack or release it. A talent kept dry and unused is not preserved — it is postponed, and postponed things have a habit of arriving at the deadline already spoiled.`,
  },
  {
    id: 'bol-018',
    slug: 'the-uncarved-keystone',
    episode_number: 18,
    title: 'The Uncarved Keystone',
    tagline: 'Every stone was dressed. The one in the middle waited, deliberately rough.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'The arch could not close because the keystone remained exactly as delivered — and everyone in the crew had agreed, wordlessly, that shaping it was someone else\'s risk.',
    published: true,
    publish_at: '2026-09-18T21:47:00Z',
    views_count: 980,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `The arch was fine work: the stones cut to the drawing, the crew experienced, the funding sufficient, the ground surveyed twice. What it lacked sat in the center of the span, still in its delivery wrap — the keystone, the one stone whose angle determines whether the whole curve becomes structure or collapse.

It was not forgotten. Everyone knew. The foreman had named it in the first week's briefing, and since then the crew had developed the professional hush that descends on a task everyone recognizes as consequential and nobody volunteers to touch. Crews call this "waiting on the drawing." What it was, was waiting on somebody else's courage.

Sloth does not always avoid work. Sometimes it avoids the one piece of work whose failure would be attributable.

The consultant arrived, saw the wrapped stone immediately — they always do — and asked the question the crew had been rotating around for a month: who is shaping the keystone? The answers were a circle: the designer's angles were advisory, the foreman executed drawings, the drawings awaited a decision that only management could — and the sentence dissolved, as such sentences do, into the weather.

They shaped it that afternoon, the four of them standing around it, the decision made in public where risk could not hide. The stone fit. The arch closed that evening, and the crew stood under the span with the specific relief of men who had been living beneath an open question.

Every build has its unwrapped stone. The arch does not care whose name is on the drawing.

Shape the keystone yourself, in daylight, where the fall would be visible — because the span closes for no one's alibi.`,
  },
  {
    id: 'bol-019',
    slug: 'the-untended-ditch',
    episode_number: 19,
    title: 'The Untended Ditch',
    tagline: 'A millimeter of silt. Eight seasons of ignoring it. One Tuesday of water.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'The drain had asked, each quarter, for an hour of someone\'s afternoon. The flood eventually reserved the entire building, plus legal.',
    published: true,
    publish_at: '2026-09-19T21:47:00Z',
    views_count: 910,
    likes_count: 189,
    scheduled_for: '9:47 PM',
    full_text: `The ditch ran along the eastern edge of the compound, cut years ago to carry the seasonal water away from the server room. It required nothing dramatic: a shovel, an hour, twice a year, ideally before the rains. The maintenance log recorded the task in a font nobody read, assigned to a rotating name that changed whenever someone left.

Silt is patient. It does not announce itself; it offers, each quarter, a decision that costs almost nothing — which is precisely why the decision survives eight quarters unmade.

By the sixth season the ditch's capacity had halved. The building had added, in the same period, a generator, a fuel store, and a contract with a client whose SLA contained the word "guaranteed." Nobody connected the additions to the shallowing channel. Continuity is abstract; the log is a font nobody reads.

The water arrived on a Tuesday with the region, unannounced, in the volume the ditch had been predicting politely for eight seasons. It found the fuel store first — slop overflows choose their poetry — then the generator's base, then the room where "guaranteed" lived.

Downtime reviews are always astonished. The ditch never is; it merely reports, in the only language available: the exact volume it had asked, in hours, at the exact price it had quoted.

They dug it out by hand that Friday, in the mud of their own deferral, with lawyers on hold.

Tend the ditch in the dry season. Floods are merely compound interest on the hour you did not spend.
`,
  },
  {
    id: 'bol-020',
    slug: 'the-silent-bell-tower',
    episode_number: 20,
    title: 'The Silent Bell Tower',
    tagline: 'He saw the fire at 2 a.m. and respected everyone\'s sleep.',
    act: 2,
    sin_category: 'Sloth',
    teaser: 'The watchman\'s first duty is to ring, before he is sure, before it is polite, before anyone has decided what the ringing will cost him.',
    published: true,
    publish_at: '2026-09-20T21:47:00Z',
    views_count: 870,
    likes_count: 168,
    scheduled_for: '9:47 PM',
    full_text: `The watchtower was the firm's oldest institution: a rotation of senior engineers whose actual job, beneath the title of "oversight," was to notice things at inconvenient hours and say them before they became expensive. The bell had one instruction, written by a founder who had watched a previous company burn from politeness: ring while it is still a suspicion.

He saw the anomaly on a Saturday — a drift in the payments reconciliation, small, possibly a rounding artifact, possibly the kind of thing that appears in trade publications next to the word "investigation." He noted it in the channel, at 2 a.m., under a header he titled "fwiw," and went to sleep having performed the exact gesture of warning while ensuring it would be read as nothing.

Sloth's most respectable form is the alarm rung so quietly that its ringer can claim, afterward, that he did ring it.

Monday, the drift had a name. Tuesday, it had an auditor. The recordings of the channel were reviewed, and his sentence was there, technically heroic: seen early, mentioned, timestamped, and formatted with the care of a man who wanted the record to show diligence without the inconvenience of insistence.

The board's finding was not that he had failed to notice. It was worse and more modern: he had noticed, and priced the ringing — the awkward meeting, the colleague's embarrassment, the possibility of being wrong — and paid the cheaper invoice instead.

He kept the rotation. The bell was reassigned to a junior with less to lose and no theory of embarrassment, and the next anomaly, arriving in the night, was rung at volume in the first minute.

Ring before you are sure, or admit you were never the watchman. Towers are cheap; the sleeping city is not.
`,
  },

  // --- CHAPTER V: GREED (The Granary of Lead) ---
  {
    id: 'bol-021',
    slug: 'the-golden-millstone',
    episode_number: 21,
    title: 'The Golden Millstone',
    tagline: 'The bridge had one toll. The town had one road. He raised it once too often.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'Every cart that crossed paid him, and every payment made the next increase feel like arithmetic rather than theft — until the carts simply chose a different town.',
    published: true,
    publish_at: '2026-09-21T21:47:00Z',
    views_count: 1290,
    likes_count: 320,
    scheduled_for: '9:47 PM',
    full_text: `The toll was his because his grandfather had paid for the bridge, and because the bridge, being the only one for forty miles, was less an asset than a verdict: cross here, or do not cross. The first rates were fair. The second were defensible. By the fourth increase, written in the small polite type that rentiers use, the mill had begun to take a tenth of every load that passed.

Greed does not announce itself as appetite. It announces itself as yield, tracked monthly, praised quarterly.

The traders adjusted first, as traders do. They consolidated loads, shifted departure hours, and quietly began routing through the newer crossing two valleys over — built, ironically, with the savings his toll had taught them to keep. The bridge that had made him inevitable became, over three seasons, merely available, and available bridges charge whatever the last competitive crossing allows.

His accountant could not find the quarter it broke in. It had not broken in a quarter; it had broken in a sentence he kept repeating — "the bridge is paid for, so every cart after is profit" — a sentence that mistakes the tool for the relationship.

By the following year the toll house was staffed for a volume that no longer arrived, and the town, no longer captive, had grown around his bridge the way towns do around anything that stops asking them for tribute.

The millstone is golden only to the man holding it. To everyone crossing, it is simply the weight that decides whether they cross at all.

Toll what you maintain. The moment the toll outweighs the crossing, people stop needing your bridge — and bridges without traffic are only stone with ambition.`,
  },
  {
    id: 'bol-022',
    slug: 'the-hoarded-seed',
    episode_number: 22,
    title: 'The Hoarded Seed',
    tagline: 'The granary overflowed. The next planting found nothing in the ground.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'Seasons of abundance, and he stored every grain against a famine that never came — until the famine was the storage, and the field remembered how empty he had made it.',
    published: true,
    publish_at: '2026-09-22T21:47:00Z',
    views_count: 1140,
    likes_count: 275,
    scheduled_for: '9:47 PM',
    full_text: `He had learned the lesson of scarcity too well: from parents who watched prices the way other families watch weather, who remembered the year the shelves mocked them. So when the harvests came good — three straight, then five — he sold none of it into the ground. The granary filled, then the second granary, then a rented facility across town, and the balance sheet read, in the language of finance, prudence.

Greed's most respectable costume is the emergency that never arrives.

The field, for its part, needed seed. Not money — seed, at the hour seed goes in. His neighbors, planting aggressively, took the available stock; his own supply, being an asset, was arranged against credit rather than opened. In the first missed window he told himself the rains were late. In the second he told the bank a story about timing. By the third, the granary's contents had become the reason there was nothing to plant: the hoard had been priced so carefully that opening it would have shown, at last, what it had all cost.

The famine came from inside the ledger. Land left fallow two seasons grows a crop of its own: interest, and then doubt, and then buyers who purchase at the price of men who must sell.

He is still careful with money. The care now has a shape his parents would recognize and a result they would not: full bins, empty fields, and a lesson inverted — that the seed's job was never to be safe in storage.

What you withhold from the ground you eventually have to buy back from the market, at the exact season when it knows you must.

Store the surplus. Plant the seed. A granary that has never cost the farmer anything was fed by a field he stopped feeding.`,
  },
  {
    id: 'bol-023',
    slug: 'the-vault-of-dry-bones',
    episode_number: 23,
    title: 'The Vault of Dry Bones',
    tagline: 'The money was safe. The company it was meant to protect was not.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'Four years of reserves, untouched, admired in board decks — and one morning the treasury was pristine and the business beneath it had quietly died of the cold.',
    published: true,
    publish_at: '2026-09-23T21:47:00Z',
    views_count: 1080,
    likes_count: 245,
    scheduled_for: '9:47 PM',
    full_text: `The vault was a point of pride: eighteen months of runway, documented, stress-tested, spoken about at dinners with the particular modesty of men displaying a large number. Investors called the posture conservative. Employees, who never saw any of it, began calling it something else, though not in rooms where the decks were presented.

Money kept is measurable. Money spent on the right thing at the right hour is merely hoped for — which is why the vault always wins the argument and occasionally loses the company.

The occasions accumulated: the engineer whose counter-offer he declined to match, citing discipline; the marketing season he skipped because the quarter demanded preservation; the acquisition of a smaller rival's team, four people deep in the only capability the firm lacked, allowed to walk to a competitor over a delta of salary that would not have changed the vault's stress test by a rounding error.

The bones in the vault were dry because nothing living had entered them in four years. Capital without a thesis is not safety; it is a storage unit the business pays rent on while it starves outside.

The autopsy, when it came, was bloodless in both directions: no fraud, no collapse — only a slow migration of relevance toward people who spent. His final memo praised the reserves as the reason the wind-down was orderly, a sentence he must have known was a eulogy drafted as a balance sheet.

Keep eighteen months, or six, or whatever your real risk requires — and make the rest go to war before the war does.

A vault is a coffin that accrues interest. Bones dry out; deployment is what breathes.`,
  },
  {
    id: 'bol-024',
    slug: 'the-silver-thread',
    episode_number: 24,
    title: 'The Silver Thread',
    tagline: 'One thread. No weight. The robe unraveled from the hem upward.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'It began as a small accommodation everyone made — a cousin\'s invoice, a friend\'s exemption, a line item nobody would miss — and ended where small corruptions always end: at the door with the audit.',
    published: true,
    publish_at: '2026-09-24T21:47:00Z',
    views_count: 990,
    likes_count: 210,
    scheduled_for: '9:47 PM',
    full_text: `The first thread cost nothing. That was its design. A vendor arrangement for his wife's brother, priced a little generously, approved by him with a signature that took four seconds and a justification he could repeat in his sleep: family, loyalty, the small republic of obligations every man runs while pretending to run only a company.

He did not think of it again for a year, because the robe still fit, still photographed well, still carried the weight people expected.

Greed that arrives as favors understands something the honest steal does not: a single thread cannot be weighed.

The second thread was a friend's firm exempted from a review. The third, a rebate booked to the wrong column by a finance team that had learned the tone of his "clarifications." None was large. All were load-bearing, in the way threads are: individually invisible, collectively the fabric.

It ended at the door with the audit, as such things do — not with the discovery of any one thread, but with the discovery that the whole pattern had been cut to measure. The board's phrase was "control environment," which is the professional name for the space where the silver thread used to be.

He kept the job and lost the room; these are different terminations, and the second one is quieter and lasts longer.

The first accommodation is never the corruption. It is the loom.

Inspect the hem. Everything you are wearing was either woven or unraveled by what you allowed at the edge, where nobody looks and every fabric begins.`,
  },
  {
    id: 'bol-025',
    slug: 'the-tax-on-running-water',
    episode_number: 25,
    title: 'The Tax on Running Water',
    tagline: 'Every drop metered. By autumn, the river had learned to route around his gauge.',
    act: 3,
    sin_category: 'Greed',
    teaser: 'He monetized the sign-up, the silence, the scroll, the exit — and the users, being water, did what water does when every path is priced: they found a path that was not.',
    published: true,
    publish_at: '2026-09-25T21:47:00Z',
    views_count: 930,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The monetization plan was admired for its completeness. Free tier with a toll at every joint: the third feature behind the wall, the wait-time without payment, the export withheld from those who had not yet paid to leave. Each gauge was defensible alone. The spreadsheet, summing them, predicted a river of revenue — which is what happens when analysts price water without ever having been thirsty on the far bank.

Greed does not fear the customer leaving. It fears leaving money at the exit.

The users did not revolt. Revolts are loud and give you something to answer. They routed. A competitor's quieter gate appeared in the tutorial threads, mentioned by a creator with no commercial interest in the matter, and the flow that had passed through his meters began, gently and then all at once, to find the older channel that charged nothing.

The gauges, for their part, worked perfectly. They reported, weekly and true, that the river was thinner. The reports agreed with each other. None of them mentioned why.

In the final quarter he cut the tolls — the sequence every water-tax story ends with — and watched half the diverted flow continue past, because habits, unlike rivers, do not return just because the toll is lifted. The channel they found has since grown banks.

A river will cross any cost to reach the sea. Price the value you carry; never the current itself.

Running water is not a revenue line. It is the road your revenue travels on — and roads priced by the mile lose their traffic to the field path beside them.`,
  },

  // --- CHAPTER VI: GLUTTONY (The Salt Water Cistern / Information) ---
  {
    id: 'bol-026',
    slug: 'the-feast-of-hollow-grain',
    episode_number: 26,
    title: 'The Feast of Hollow Grain',
    tagline: 'Nine courses. No bread. He left the table hungry and called it abundance.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'Dashboards, feeds, newsletters, podcasts in triple-time — consumed nightly and digested never, until the mind he was feeding could no longer tell nourishment from volume.',
    published: true,
    publish_at: '2026-09-26T21:47:00Z',
    views_count: 1180,
    likes_count: 285,
    scheduled_for: '9:47 PM',
    full_text: `The table was always set: four newsletters before breakfast, three podcasts between meetings, a feed read in the gaps until the gaps themselves were gone. He could recap the week's arguments in four industries, cite the newest frameworks in each, and could not — this was the part that frightened him in the specific way emptiness frightens — remember the last idea that had been his.

Gluttony in his trade never comes with sugar. It comes as inputs, and inputs have no calories.

Hollow grain is grain with the flour removed: the summary of the book, the thread about the essay, the dashboard standing in for the customer. It fills the specific shape of hunger that reading creates, and starves the only appetite that matters — the one that makes you produce.

The correction arrived as a commissioned piece he could not write. The client, patient, had asked for a position — not a survey, a position — and he found, opening the document, that he had twenty-two references and no sentence he was willing to sign. Ten years of eating, and the house he was building with it had no walls.

He ate differently after that. One book a week, read slow enough to argue with. The feeds he starved deliberately, watching the hunger change shape over ten days into something that had a taste he recognized: boredom, which turned out to be the appetite of makers, sitting quietly at the end of every fast.

Consume to build. The table that leaves you hungry was serving someone else's harvest.

Bread is made from grain that was grounded. Everything you read should cost you something on the way to becoming yours.`,
  },
  {
    id: 'bol-027',
    slug: 'the-library-of-unread-vellum',
    episode_number: 27,
    title: 'The Library of Unread Vellum',
    tagline: 'Twelve hundred volumes. A year of buying. A decade of meaning to.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'The shelf was a monument to intention: courses purchased, frameworks archived, tabs open since March — and a mind that had begun to distinguish, painfully, between owning knowledge and having met it.',
    published: true,
    publish_at: '2026-09-27T21:47:00Z',
    views_count: 1250,
    likes_count: 340,
    scheduled_for: '9:47 PM',
    full_text: `The library had been assembled with real money and real enthusiasm: the industry canon, the out-of-print classics, the course bundles bought in the January enthusiasm and the July guilt. Twelve hundred volumes by count. Fourteen by honest measure — the ones with marks in the margins, arguments left in the front pages, the dog-ears that mean a man was losing a fight with a paragraph at 1 a.m.

Gluttony's shelf is built from the books it will read, which is why it grows faster than any reader.

He had confused acquisition with practice, a confusion the shelf rewarded weekly: every new purchase felt like progress, and progress, being unmeasured, never had to be tested. The unread volume is the most flattering object a thinking man can own — it agrees, silently, that he is the kind of person who reads.

The test was a working session with a junior engineer half his age who had read fewer books and argued better, because the four she had read had been through her: rebutted, applied, failed in public, repaired. She did not quote. She referenced, the way people reference wounds.

He went home and read his oldest acquisition — the one on every list, the one that had started the shelf — and found it ordinary in the way of things truly worked over: no revelation, only confirmation, plus thirty pages of notes he now had opinions about.

The library did not shrink. Its status did: from monument to tool, from to-be-read to being-read.

Buy fewer. Finish more. The shelf is a warehouse; only the margin knows the book.`,
  },
  {
    id: 'bol-028',
    slug: 'the-well-of-bitter-salt',
    episode_number: 28,
    title: 'The Well of Bitter Salt',
    tagline: 'He drank deep of every success and remained, precisely, thirsty.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'The acquisition landed, the applause arrived, the number cleared — and the satisfaction lasted the length of a sentence before the mouth, trained on salt, asked for the next.',
    published: true,
    publish_at: '2026-09-28T21:47:00Z',
    views_count: 1040,
    likes_count: 230,
    scheduled_for: '9:47 PM',
    full_text: `The win was real: the term sheet signed at 4:40 on a Friday, the call home, the dinner where everyone said the right things and he felt — accurately, briefly — the whole apparatus of years settle into place. He woke Saturday to the familiar taste: salt. The victory had been drunk and had, in the drinking, made him thirstier, which he had diagnosed for a decade as a character flaw and now suspected was a design.

The well of bitter salt is not poisoned. It is honest: it delivers exactly the satisfaction that seeking it produced.

He had built his desires to the size of the event rather than the work, and events, by definition, end. The acquisitive man measures the sip; the maker, reluctantly, the harvest — and the harvest has a different taste, less immediate, available on ordinary Tuesdays, which is why almost nobody trains for it.

He asked an older founder, retired and unbothered, how long the last exit had lasted. "The buzz?" she said. "Six days. The work it took to deserve it lasted nine years, and I'd take either Tuesday."

The arithmetic stayed with him longer than the dinner had. He began, cautiously, keeping a ledger of the second kind — mornings where the thirst was absent: the days of flow, of useful difficulty, of problems that were still problems when he left them, which is the only company that never leaves him thirsty.

Drink if you must, but know the type of mouth you have built.

Satisfaction is not a drink. It is a mouth that has stopped being sold salt.`,
  },
  {
    id: 'bol-029',
    slug: 'the-drunkards-compass',
    episode_number: 29,
    title: 'The Drunkard’s Compass',
    tagline: 'The needle was true. The hand holding it had been celebrating all evening.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'Flattery, press, the fourth drink of a night that had been one — each a small exemption granted to judgment — until the map and the man agreed on a destination neither of them had chosen.',
    published: true,
    publish_at: '2026-09-29T21:47:00Z',
    views_count: 980,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `The compass, tested in the morning, was fine. That was the tragedy's first condition: no broken instrument, no treacherous stars, only a hand that had spent the evening granting exemptions. The third toast had exempted him from doubt. The flattering profile, read twice before the toasts, had exempted him from scrutiny. By the time the key decisions of the quarter were being placed on the table, his judgment had been declared, by everyone including himself, a matter that could wait for morning.

Impairment in his class rarely comes from bottles. It comes from agreements to stop checking.

The destination they chose that night — the aggressive hiring, the market he had never visited, the partner whose reputation preceded him in ways everyone in the room had heard and no one had said — seemed, at the table, like momentum. Morning found it like a map drawn by someone else: accurate to the wrong place.

He did not drink again before deciding anything of consequence. Not from virtue — he had simply learned the taste of the compass after four exemptions, a flavor that arrives as confidence and clears as a contract.

The recovered version of the story is that he rebuilt the decisions one at a time, soberly, some of them reversible and some only explainable. The unrecovered ones he now kept visible in the office, not as shame but as instruments: reminders that a true needle in a celebrating hand will still, faithfully, point.

Check the hand before you trust the needle.

The compass never gets drunk. The man does — and calls the resulting direction his gut.`,
  },
  {
    id: 'bol-030',
    slug: 'the-endless-scroll',
    episode_number: 30,
    title: 'The Endless Scroll',
    tagline: 'The feed ended where it began. He had been reading his own hunger for three hours.',
    act: 3,
    sin_category: 'Gluttony',
    teaser: 'Thumb, glow, the next thing, the next — a river with no far bank, carrying him nightly past the work he had sworn to reach before midnight.',
    published: true,
    publish_at: '2026-09-30T21:47:00Z',
    views_count: 1120,
    likes_count: 295,
    scheduled_for: '9:47 PM',
    full_text: `The river had no far bank, which is how rivers in the feed are engineered: no arrival, no place where the water says enough. He entered at eleven, briefly — one link, he told the room of his own skull — and surfaced at two with nothing to show for the crossing except the exact shape of other people's evenings.

Gluttony used to require a table. The modern version requires only that nothing ever end.

What made it his hunger rather than their content was the taste at minute forty: no pleasure left, only continuation, the hand scrolling a river that had stopped carrying anything but its own current. He had read, in that span, eleven summaries of books he owned, four arguments he would never have, and a weather report for a country he did not live in.

The night ended, as these end, with the phone placed face-down and the sentence spoken into the dark: tomorrow I start with the work. The sentence was true each night and believed each night and, being believed, cost nothing.

What finally broke the loop was not discipline but arithmetic: he counted the hours in a week that the river was actually carrying — twenty-three — and then counted what the same span had ever returned: not one finished thing, not one sentence he had signed.

He did not quit the river. He gave it a bank: an hour after lunch, standing, with the timer visible — water permitted only where the land could see it.

The scroll has no end because you are not meant to arrive. Arrive anyway.

Everything real has a far bank: the book closes, the film ends, the work ships. Cross only rivers that put you down somewhere.`,
  },

  // --- CHAPTER VII: LUST (The Silhouette on the Silk / The Architecture of Lust) ---
  {
    id: 'bol-031',
    slug: 'the-wax-effigy',
    episode_number: 31,
    title: 'The Wax Effigy',
    tagline: 'He loved the portrait. The subject had been excused years ago.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'Her image, maintained across channels by a team of two, had become more real than her week — and the week, unphotographed, began filing complaints nobody could print.',
    published: true,
    publish_at: '2026-10-01T21:47:00Z',
    views_count: 1190,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `The portrait was exquisite. Ten posts a week, each one lit, graded, and captioned by people who understood that the effigy now paid better than the woman who had once sat for it. She reviewed the drafts each morning the way a warden reviews mail: quickly, suspiciously, occasionally striking a word that sounded too much like her.

Lust, in her trade, had transferred its object without announcing the move: she no longer wanted the life. She wanted the picture of the life to remain unbroken.

The complaint arrived as fatigue — the ordinary, undocumented kind that photographs badly. Weeks were being scheduled around the portrait's needs: destinations chosen for their backdrops, meals ordered to be looked at rather than eaten, a friendship ended because it did not frame well. She noticed she could describe her last quarter in images and not in a single sentence.

The wax effigy does not age on its own. It is maintained, and maintenance is a job, and the job was quietly consuming the person it was commissioned to preserve.

She posted the truth on a Tuesday — one unedited paragraph, the first in four years, admitting she did not know what she wanted and that the certainty in the grid had been styling. The comments, which she had feared would be a collapse, contained instead the strange relief of thirty strangers writing me too.

The portrait stays. It is now understood as a portrait: signed by her, dated, and allowed to be a likeness rather than a life.

Do not fall in love with your own rendering. Wax is flattery's favorite material — it holds any shape except the living one.
`,
  },
  {
    id: 'bol-032',
    slug: 'the-mirage-on-the-oasis',
    episode_number: 32,
    title: 'The Mirage on the Oasis',
    tagline: 'They watered the horizon for three seasons. The real well was under their boots.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'Every competitor\'s number looked like rainfall from where he stood. He marched toward it across ground he already owned, and arrived, at last, thirsty on his own land.',
    published: true,
    publish_at: '2026-10-02T21:47:00Z',
    views_count: 1080,
    likes_count: 260,
    scheduled_for: '9:47 PM',
    full_text: `The mirage was built entirely of other people's figures: revenue announced in conference talks, growth shared in screenshots, the competitor's new office photographed through glass from across the street. From where he stood, it shimmered — a market, clearly, where the water was — and his own ground, examined daily for defects, began to read as drought.

The desert teaches this lesson with great patience: that distance makes every horizon a lake.

He reorganized twice to reach it. Features abandoned mid-build for the market they were losing, a pivot announced in the company-wide email that nobody had asked for, a year spent walking toward a number he could not source. The mirage, meanwhile, behaved as mirages do: it receded at exactly his pace.

The real well was under his boots — clients he had never visited twice, a segment he had called "saturated" based on one bad quarter, the product's second use case, which three customers had named in writing and he had logged as edge.

He sank the next season straight down instead of out. The aquifer was there on the first probe, which is often how it goes: the water you walk miles for and the water you kneel for are frequently the same water, and kneeling is not a strategy anyone photographs.

By year's end the mirage could keep shimmering for whoever else was thirsty. He had stopped, permanently, watering horizons.

You cannot drink a competitor's announcement. Measure your own ground before you curse your own sky.

The oasis is usually the distance; the well is usually the work directly beneath the man who has been walking all night.
`,
  },
  {
    id: 'bol-033',
    slug: 'the-velvet-cage',
    episode_number: 33,
    title: 'The Velvet Cage',
    tagline: 'Everything was provided. Including, eventually, the reason to leave.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'The salary arrived before dawn and asked nothing in return but the whole day — comfortable, upholstered, and slowly, expensively, unbearable.',
    published: true,
    publish_at: '2026-10-03T21:47:00Z',
    views_count: 1010,
    likes_count: 240,
    scheduled_for: '9:47 PM',
    full_text: `The cage was upholstered by professionals: salary above the market's noise, a title his parents could pronounce, work that never once threatened the furniture. He was grateful — gratitude was practically the lease agreement — and for four years gratitude covered what it always covers, which is the small scream of a creature that has been comfortable at the wrong hour.

Comfort is not the opposite of danger. It is danger with better linen, and the linen is the point: it makes leaving look like ingratitude.

The test came as an invitation he declined automatically — a smaller firm, real risk, his name on the thing rather than in the footer — and heard, in his own refusal, the cage's voice speaking in his accent now. Not fear. Something worse: a cost-benefit analysis in which his own life appeared as the line item being saved from.

He stayed two more quarters, collecting the linen, and understood the geometry: every comfort purchased with the day was also a claim on the day, until the salary was not paying him but renting him, expensively, hourly, in a currency he could not spend back.

The exit, when it came, was undramatic and unpaid-for: six months of savings, a smaller room, and the return of the specific hunger that had hired him in the first place. He works now where the risk is visible, and sleeps better than the cage's upholstery predicted.

They say the gilded cage is the trap. Wrong: velvet is the trap. Gold at least admits it is metal.

Leave before comfort files the deed. A cage you cannot resent is a cage you will never notice yourself locking.
`,
  },
  {
    id: 'bol-034',
    slug: 'the-painted-fresco',
    episode_number: 34,
    title: 'The Painted Fresco',
    tagline: 'From the aisle it was a masterpiece. From the scaffolding, wet plaster over rot.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'The launch film, the brand book, the keynote with the music cue — surface so beautiful that nobody in the room thought to ask what it was attached to.',
    published: true,
    publish_at: '2026-10-04T21:47:00Z',
    views_count: 940,
    likes_count: 215,
    scheduled_for: '9:47 PM',
    full_text: `They had painted the fresco in the order that photographs best: narrative first, music second, the values wall third, and the load-bearing questions — retention beyond month one, support after the demo, the promise the sales deck made on the founder's behalf — last of all, and then not at all.

Surface is not lying. Surface is a discipline, and like all disciplines it can be used to avoid a greater one.

The plaster failed the way plaster always fails over rot: invisibly at first, then structurally, then publicly. A customer's renewal review contained the sentence no brand book can grade over — it does what the film said, roughly, and then it stops. The keynote's music cue had been answered, downstream, by silence from the market.

Lust for the beautiful surface is the adult version of loving the wrapping: the holiday is in the room, and the room has been outsourced to the ribbon.

They rebuilt in the correct order that quarter, and the correct order is uncomfortable: capability first, then the sentence, then — if anything survives — the music. The new film is plainer than the old one, shot in the actual workshop with the actual dust, and converts better, because customers have a fresco detector built from years of standing in aisles and being moved by things that were true.

Beauty is the last coat, applied by the people who know it cannot cover anything. Apply it last, or it will be the only thing you own.

A masterpiece you cannot walk behind is a wall with an opinion. Go look at the scaffolding before you applaud.
`,
  },
  {
    id: 'bol-035',
    slug: 'the-song-of-the-false-siren',
    episode_number: 35,
    title: 'The Song of the False Siren',
    tagline: 'The narrative sang his name in perfect pitch. It was recruiting him for its own chorus.',
    act: 3,
    sin_category: 'Lust',
    teaser: 'Every room applauded the story he had started telling about himself — and the story, having acquired an audience, quietly began choosing what he was allowed to become.',
    published: true,
    publish_at: '2026-10-05T21:47:00Z',
    views_count: 910,
    likes_count: 195,
    scheduled_for: '9:47 PM',
    full_text: `The song was his, originally: a positioning, a line he said at dinners that always landed, a version of the company and himself that received the reception of a well-made thing. He sang it more often because it worked. That is how the siren begins — as your own voice, amplified, returning to you with a gain.

The narrative, once applauded, becomes a contract with the audience. Nobody signs it. Everybody enforces it.

So the pivot that would have embarrassed the song was delayed a quarter, then two. The hire who did not fit the story was passed over for one who did. The truth arrived once, at a board meeting, in a form he swallowed: the market had moved, the song had not, and the room was now loyal to the tune rather than to the thing the tune described.

False siren songs are not false in pitch. They are true — about who you were when you wrote them.

He stopped singing it at dinner. The silence that followed was instructive: some listeners had been there for him, most for the melody, and the difference became visible exactly when the music did. The ones who stayed asked better questions. The chorus, politely, found another singer.

What he writes now changes more often than it performs, which is the only reliable sign that the song belongs to the man rather than the man to the song.

Sing short. Leave the long notes to the audience, and check, before encore, whether you are still the one holding the microphone.

The truest voice in the room is the one willing to be off-key in public before it is willing to be wrong alone.
`,
  },

  // --- CHAPTER VIII: DISCERNMENT (The Eighth Virtue) ---
  {
    id: 'bol-036',
    slug: 'the-plumb-line-in-the-dark',
    episode_number: 36,
    title: 'The Plumb Line in the Dark',
    tagline: 'No audience. No audit. The line still hung true, or it did not.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'The standard that matters is the one you apply when nobody is grading — the plumb line dropped in the dark, deciding what your work actually is.',
    published: true,
    publish_at: '2026-10-06T21:47:00Z',
    views_count: 1480,
    likes_count: 395,
    scheduled_for: '9:47 PM',
    full_text: `The warehouse had one instrument worth trusting: a plumb line, simple as a string and a weight, older than the firm, indifferent to opinion. It did not care who had approved the wall. It did not read the review. In the dark, by the light of whatever you brought, it hung the same — vertical, patient, true — and the wall was either plumb or it was a story about a wall.

Discernment is this string. Everything else is commentary.

He ran the firm for years with the lights on: metrics that praised the quarter, clients who confirmed the deck, a team trained to report the weather he preferred. All of it was audience. The plumb line had been in the warehouse the whole time — the defect rate he never opened, the churn he reframed, the one engineer whose reports everyone routed to the bottom of the inbox because they were, inconveniently, vertical.

The night he finally brought the lamp to the string was not dramatic. It was a spreadsheet and a rule he applied alone: what would I tell the team if the good news were mine and the bad news were theirs? The answer came out crooked, and he heard it — not with shame, which is loud, but with the quiet of a man who has stopped arguing with a weight.

They rebuilt the next two quarters around the crooked finding. The company that emerged was smaller in the places the lights had praised and stronger in the places the dark had measured.

Hang your string before you need it. The audience will applaud whichever way the wall leans — and then leave you alone with it in the dark.

True is not a mood. It is a weight, and weights do not attend meetings.
`,
  },
  {
    id: 'bol-037',
    slug: 'the-sieve-of-coarse-flour',
    episode_number: 37,
    title: 'The Sieve of Coarse Flour',
    tagline: 'He fed everything in and blamed the flour when the bread came out grey.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'The inputs were fine, each of them, individually praised — and the loaf they became together was the color of a committee, tasting of no decision at all.',
    published: true,
    publish_at: '2026-10-07T21:47:00Z',
    views_count: 1210,
    likes_count: 310,
    scheduled_for: '9:47 PM',
    full_text: `The mill took everything: good wheat beside bad, the urgent beside the ceremonial, a little of every idea any senior person had ever said aloud in any room. It was, by policy, inclusive grinding. And the flour it produced — the roadmap, the strategy, the quarterly plan — came out the color of weather, grey with the arithmetic of never having refused anything.

Discernment begins at the sieve, and the sieve is where friends are made and enemies are required.

He knew the sieve was there because he had bought it: a review process, standing, called exactly that. It had never sieved anything, because its inventor sat at its center and had learned, over the years, to call every grain essential — particularly his own.

The correction was external, as it usually is: a partner with no interest in his feelings looked at the loaf and asked which of the four theorems was actually load-bearing. Not four. One, badly dressed by three others. The question did not require cruelty. It required a sieve operated by someone who did not bake the grain.

They installed one. Refusals became a tracked output, published quarterly like the roadmap, because a decision nobody was allowed to see was still a decision — it had merely been made by exhaustion instead of judgment.

Bread remembers every grain that entered it. So does the market.

Coarse flour is not a failure of wheat. It is the mill's confession that nothing was ever turned away — and nothing, therefore, was ever chosen.
`,
  },
  {
    id: 'bol-038',
    slug: 'the-lamp-in-the-gale',
    episode_number: 38,
    title: 'The Lamp in the Gale',
    tagline: 'Not the lighthouse. The lamp. Small, fed hourly, and still lit at 3 a.m.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'The storm did not ask his permission, and the wind had opinions about his schedule — but the flame had been pruned, sheltered, and fed before the weather arrived, and that was the entire strategy.',
    published: true,
    publish_at: '2026-10-08T21:47:00Z',
    views_count: 1150,
    likes_count: 290,
    scheduled_for: '9:47 PM',
    full_text: `The gale arrived the way gales do: a market that closed, a partner that vanished, a board that wanted answers in the register of verdicts. Everyone in the firm looked, that first night, for the lighthouse — the grand gesture, the announcement, the plan with music — and found instead the same small lamp they had been tending for two years: the core client relationship, kept warm by habit; the cash discipline, kept boring by rule; the one product line that had always worked, kept alive despite every attempt to make it impressive.

Discernment in a storm is not choosing bravely. It is discovering which flame you already agreed to feed.

The lamp had no romance. It was fed hourly by people who did not call the feeding leadership: the founder who answered support at 11 p.m., the engineer who had declined three rewrites for beauty, the finance lead who said no to the expansion in a sentence everyone had found dull in May and quoted in November.

They did not survive because they were fearless. They survived because the weather, having taken everything performative, found only the fed things left, and fed things do not blow out; they are simply there when the morning counts.

The lighthouses in their industry announced the storm's end with a new narrative. The lamp-keepers, unphotographed, were already at work — and by spring, hiring the lighthouse's former staff.

Keep a flame too small to brag about. Storms are where portfolios of grand gestures go to be audited.

The gale respects nothing you displayed. It respects what you fed before it arrived.
`,
  },
  {
    id: 'bol-039',
    slug: 'the-anchor-in-deep-mud',
    episode_number: 39,
    title: 'The Anchor in Deep Mud',
    tagline: 'The storm wanted him to move. The mud wanted him to stay. He chose, deliberately, the slower question.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'Every rival had already sailed — toward the new market, the new platform, the new weather — and the old captain checked his ground one more time and, for once, did not follow.',
    published: true,
    publish_at: '2026-10-09T21:47:00Z',
    views_count: 1090,
    likes_count: 275,
    scheduled_for: '9:47 PM',
    full_text: `The anchor's job is not to prevent movement. It is to make movement a decision. Laid in deep mud, it held the hull through the weather that broke ships which had been drifting with admirable, fatal agility — and the captain, watching the others run before the wind toward whatever was trending, felt the specific loneliness of the man who has chosen to hold when holding is not a strategy anyone publishes.

Discernment is the ground you have already surveyed, re-asked as a question when everyone else is sailing.

He had surveyed it. Twice. The market they were chasing was real and had already moved twice, each time leaving the ones who arrived first holding the last version of somebody else's weather. His own ground — the unglamorous segment, the deep relationships, the capability that took years to sink — was still down there, in the mud, holding the exact shape of the hull it had been given.

So he did not sail. He repainted while the others were in port weather. He deepened the one line nobody photographed. Clients who had been told, by the fleeing fleet, that the storm meant everything was changing, found that at his dock nothing had — and that "nothing had changed" is, in a hurricane of announcements, the most persuasive sentence available.

When the weather cleared, half the fleet was back, anchorless, looking for ground. His was occupied, with a waiting list, at a price that had never once been discussed in a webinar.

An anchor is not fear. It is a claim about where your harbor is.

Know your mud. Ships that anchor everywhere are called driftwood, and the sea has a word for driftwood: temporary.
`,
  },
  {
    id: 'bol-040',
    slug: 'the-master-masons-silence',
    episode_number: 40,
    title: 'The Master Mason’s Silence',
    tagline: 'The mark was pressed while the clay was still listening.',
    act: 3,
    sin_category: 'Discernment',
    teaser: 'Everyone else stamped their bricks with names. The master mason let hers set unmarked — and the wall, a century on, was found without a single fraud.',
    published: true,
    publish_at: '2026-10-10T21:47:00Z',
    views_count: 1650,
    likes_count: 480,
    scheduled_for: '9:47 PM',
    full_text: `Her bricks carried no name. The others did — stamped deep, pressed early, fired in the kiln of being recognized before the wall was even laid — and the guild, admiring the stamps, would have predicted hers would vanish in the mortar of history. That is what stamps are for: to be noticed while the clay is still wet.

Discernment's final lesson is about silence, and it is the one the loud never learn: that the mark you do not press is also a mark.

She spent the quiet years the stamps could not photograph: the sandstone tested twice, the mix refused once on a sentence only she would ever read, the joints set to a tolerance the foreman called superstition and the weather later called mercy. When the quake came — the one that took the guild's showroom and its stamped inventory down to the substrate — her wall stood in the field, unadvertised, unread, still holding, and was found afterward by people who could not find its author.

They asked, when they found her, why no mark. She gave the answer that has outlived every stamp in the archive:

"A signature on the clay is a promise made to the audience. The wall is a promise made to the weather. I only had time for one."

The masons who stamp first sell first. The ones who press nothing sell, eventually, the only thing that cannot be counterfeited: work that remains after the name attached to it has been forgotten.

JADAI's mark — when it is pressed at all — is pressed last, small, and only on what held.

Keep the stamp in the drawer. Let the wall speak first, and let it say your name in the only tense the craft respects: still standing.
`,
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
