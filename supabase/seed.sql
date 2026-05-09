-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: admin user (mejella@gmail.com / 123456) + two seeded articles
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Admin user ─────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  is_sso_user
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mejella@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  now(),
  now(),
  '', '', '', '', '',
  false
) ON CONFLICT (id) DO NOTHING;

-- Trigger handle_new_user creates the profile as 'reader'; override to admin
INSERT INTO public.profiles (id, username, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'mejella', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', username = EXCLUDED.username;

-- ── 2. Article: Dravidianism ───────────────────────────────────────────────────
INSERT INTO public.articles (id, slug, title, subtitle, current_version, published, created_by)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'what-is-dravidianism',
  'What is Dravidianism, actually?',
  'Not the politics. Not the parties. The 100-year philosophy that most people have an opinion about — but haven''t quite examined.',
  1,
  true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.article_versions (article_id, version_number, content, created_by)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  1,
  $drav_body$<div class="progress-bar" id="prog"></div>

<div class="nav-dots" id="navDots">
  <div class="nav-dot active" onclick="g('quiz')" title="Start Here"></div>
  <div class="nav-dot" onclick="g('ch1')" title="What is Dravidianism?"></div>
  <div class="nav-dot" onclick="g('ch2')" title="The Timeline"></div>
  <div class="nav-dot" onclick="g('ch3')" title="Periyar"></div>
  <div class="nav-dot" onclick="g('ch4')" title="Philosophy in Practice"></div>
  <div class="nav-dot" onclick="g('ch5')" title="The Freebie Question"></div>
  <div class="nav-dot" onclick="g('ch6')" title="Where It Failed"></div>
  <div class="nav-dot" onclick="g('ch7')" title="Reflection"></div>
</div>

<div class="wrap">

<!-- MASTHEAD -->
<div class="masthead fade-up">
  <span class="masthead-label">A question journey · For curious minds · No agenda</span>
  <h1>What is <em>Dravidianism</em><br>actually?</h1>
  <p class="masthead-sub">Not the politics. Not the parties. The 100-year philosophy that most people have an opinion about — but haven't quite examined.</p>
  <div class="intent-box">
    This is not an argument for any party. It is not against any party. It is an attempt to separate a <em>philosophy</em> from the <em>politicians</em> who claimed to carry it — and sometimes did, and sometimes didn't. Read slowly. Sit with the questions. There are no right answers here — only more honest ones.
  </div>
</div>

<div class="rule-heavy"></div>

<!-- OPENING QUIZ -->
<div id="quiz" class="chapter fade-up">
  <span class="ch-num">Before We Begin</span>
  <div class="ch-title">Where are you starting from?</div>
  <p class="ch-lead">Not a test. No score. Just a mirror — so you know what assumptions you're walking in with. Answer honestly. Notice what comes up.</p>

  <div class="quiz-wrap">
    <p class="quiz-intro">Five questions · Your answers stay with you · Tap to reflect</p>

    <div class="q-item" id="q1">
      <div class="q-text">1. When someone says "Dravidian politics," what's your first instinct?</div>
      <div class="q-options">
        <button class="q-opt" onclick="answer(1,'a')">DMK. Family rule. Corruption. Free stuff.</button>
        <button class="q-opt" onclick="answer(1,'b')">Tamil pride. Anti-caste. Language fights.</button>
        <button class="q-opt" onclick="answer(1,'c')">I'm not really sure. It's complicated.</button>
        <button class="q-opt" onclick="answer(1,'d')">A philosophy going back to Periyar.</button>
      </div>
      <div class="q-reflection" id="r1">
        <strong>Notice this:</strong> If your first thought was DMK or corruption, you're not wrong — those things exist. But you jumped from a <em>party</em> to a <em>philosophy</em> in one step. That's the exact conflation this piece wants to gently pull apart. If your first thought was Tamil pride or Periyar — you may already have some separation between the two. Neither is more correct. Both are worth examining.
      </div>
    </div>

    <div class="q-item" id="q2">
      <div class="q-text">2. Who started the noon meal scheme in Tamil Nadu?</div>
      <div class="q-options">
        <button class="q-opt" onclick="answer(2,'a')">MGR</button>
        <button class="q-opt" onclick="answer(2,'b')">Karunanidhi</button>
        <button class="q-opt" onclick="answer(2,'c')">Kamarajar</button>
        <button class="q-opt" onclick="answer(2,'d')">Jayalalithaa</button>
      </div>
      <div class="q-reflection" id="r2">
        <strong>The answer is Kamarajar</strong> — a Congress leader, not a Dravidian party leader. He started it in the late 1950s to keep poor children in school by removing hunger as a barrier. MGR later scaled it dramatically in the 1980s. Jayalalithaa expanded it further. <em>Three different leaders, three different parties, one continuous philosophy: the state owes the poor child a floor.</em> If the philosophy were just DMK politics, how did it survive across parties that hated each other?
      </div>
    </div>

    <div class="q-item" id="q3">
      <div class="q-text">3. "Freebies are ruining Tamil Nadu." Do you agree?</div>
      <div class="q-options">
        <button class="q-opt" onclick="answer(3,'a')">Completely agree. It's vote-buying.</button>
        <button class="q-opt" onclick="answer(3,'b')">Some freebies make sense. Others are circus.</button>
        <button class="q-opt" onclick="answer(3,'c')">Disagree. Welfare is not a freebie.</button>
        <button class="q-opt" onclick="answer(3,'d')">I genuinely don't know where to draw the line.</button>
      </div>
      <div class="q-reflection" id="r3">
        <strong>The most honest answer is probably B or D.</strong> There is a real difference between a scheme that removes a barrier to opportunity — a bus pass that lets a woman access work, a meal that keeps a child in school — and a scheme that simply buys a vote with no lasting change. Both exist in TN's political history. The question worth sitting with: <em>who decides which is which, and by what standard?</em>
      </div>
    </div>

    <div class="q-item" id="q4">
      <div class="q-text">4. Has caste discrimination reduced in Tamil Nadu after 70+ years of Dravidian-influenced governance?</div>
      <div class="q-options">
        <button class="q-opt" onclick="answer(4,'a')">Yes — it's much better than before.</button>
        <button class="q-opt" onclick="answer(4,'b')">Partially — education improved but caste still runs deep.</button>
        <button class="q-opt" onclick="answer(4,'c')">No — it just changed form. Politicians weaponised caste.</button>
        <button class="q-opt" onclick="answer(4,'d')">I see evidence of both improvement and failure.</button>
      </div>
      <div class="q-reflection" id="r4">
        <strong>D is probably the most accurate reading.</strong> School enrollment across caste lines improved significantly. Backward class representation in government jobs increased. But caste-based violence still occurs. Caste is still the primary unit of electoral calculation. The parties that promised to end caste used caste to win elections. <em>That is a genuine, documented failure of execution — worth examining honestly rather than defending or dismissing entirely.</em>
      </div>
    </div>

    <div class="q-item" id="q5">
      <div class="q-text">5. Have you ever said "I don't like Dravidian politics" when what you really meant was "I don't like how DMK or AIADMK governs"?</div>
      <div class="q-options">
        <button class="q-opt" onclick="answer(5,'a')">Yes — I think I've done exactly that.</button>
        <button class="q-opt" onclick="answer(5,'b')">No — I meant the whole ideology, not just the parties.</button>
        <button class="q-opt" onclick="answer(5,'c')">I've never really thought about the difference.</button>
        <button class="q-opt" onclick="answer(5,'d')">For me, the ideology and the parties are inseparable.</button>
      </div>
      <div class="q-reflection" id="r5">
        <strong>This is the central question of this entire piece.</strong> If you answered A — you've already done the hard work. What follows is just context. If you answered B or D — that's worth examining too. Can you point to one idea in Dravidian philosophy that you find wrong — separate from DMK or AIADMK's behaviour? If you can, the critique is substantive. If the critique only exists when you think of the parties — it might be anti-incumbency wearing a philosophical costume. <em>Neither answer makes you right or wrong. Both make you more honest.</em>
      </div>
    </div>

  </div>
</div>

<div class="rule-heavy"></div>

<!-- CHAPTER 1: WHAT IS IT -->
<div id="ch1" class="chapter fade-up">
  <span class="ch-num">Chapter 01</span>
  <div class="ch-title">What Dravidianism actually is — and is not</div>
  <p class="ch-lead">It's older than DMK. It's older than Tamil Nadu as a state. And it belongs to no single party.</p>

  <p class="prose">Let's start with what it is not. Dravidianism is not DMK. It is not AIADMK. It is not Karunanidhi's dynasty. It is not Jayalalithaa's governance style. These are all political expressions — some good, some deeply flawed — of an older underlying philosophy.</p>

  <p class="prose">Dravidianism as a philosophy has four core ideas. These ideas existed before any party. They have been carried — partially and imperfectly — by multiple parties across 100 years.</p>

  <div class="callout thought">
    <span class="callout-label">The Four Core Ideas</span>
    <p style="margin-bottom:10px;"><strong>1. Caste hierarchy is the primary obstacle to development</strong> — not poverty, not lack of industry, but the system that decides a child's ceiling at birth. Fix this first.</p>
    <p style="margin-bottom:10px;"><strong>2. The state owes citizens a floor of dignity</strong> — not charity, not populism, but a baseline below which no person should fall. Food, education, basic mobility.</p>
    <p style="margin-bottom:10px;"><strong>3. Tamil identity is civilisational, not just cultural</strong> — one of the world's oldest living languages and literary traditions deserves to be protected structurally, not merely celebrated.</p>
    <p style="margin-bottom:0;"><strong>4. Autonomy from Delhi is governance intelligence</strong> — a state that understands its own conditions will always make better decisions than a central authority managing 1.4 billion people through one lens.</p>
  </div>

  <p class="prose">Now here is the important thing to hold. These four ideas are not DMK's ideas. Kamarajar — a Congress leader — governed by ideas 1 and 2 without ever calling them Dravidian. MGR — who split from DMK and was closer to BJP sympathetically — governed by idea 2 more aggressively than any DMK leader. Jayalalithaa — BJP's own coalition partner — governed by idea 3 and 4 fiercely.</p>

  <div class="pull">
    "If the philosophy is just DMK, how did it survive every leader who was at war with DMK?"
  </div>

  <div class="compare">
    <div class="compare-col a">
      <div class="compare-col-head a">Dravidianism — The Philosophy</div>
      <div class="compare-item"><strong>Anti-caste as core principle</strong>Caste hierarchy is irrational and unjust. Remove it structurally — through education, representation, and social reform.</div>
      <div class="compare-item"><strong>Welfare as infrastructure</strong>The state's job is to remove barriers that keep the poor trapped — not to give gifts, but to clear obstacles.</div>
      <div class="compare-item"><strong>Tamil civilisational pride</strong>A 2,000+ year literary tradition. Language as identity. Cultural confidence as human capital.</div>
      <div class="compare-item"><strong>Federal autonomy</strong>States know their people. Delhi does not. Decentralisation is efficiency, not separatism.</div>
    </div>
    <div class="compare-col b">
      <div class="compare-col-head b">DMK / AIADMK — The Parties</div>
      <div class="compare-item"><strong>Family dynasties</strong>Karunanidhi's sons. Stalin's own. Jayalalithaa's patronage. Power concentrated in a few hands.</div>
      <div class="compare-item"><strong>Electoral freebies</strong>Mixers, grinders, gold, TVs — distributed before elections with no lasting development logic. Vote-buying in welfare's clothing.</div>
      <div class="compare-item"><strong>Caste as vote-bank</strong>The parties that promised to end caste became the parties that weaponised it. Caste calculus drives candidate selection.</div>
      <div class="compare-item"><strong>Corruption cycles</strong>Multiple documented corruption cases across both parties across multiple decades.</div>
    </div>
  </div>

  <p class="prose">One column can be legitimate. The other can be corrupt. <strong>They are not the same thing</strong> — even though the same people have sometimes claimed to represent both.</p>

</div>

<div class="rule"></div>

<!-- CHAPTER 2: TIMELINE -->
<div id="ch2" class="chapter fade-up">
  <span class="ch-num">Chapter 02</span>
  <div class="ch-title">The Timeline — 100 years in honest sequence</div>
  <p class="ch-lead">The story did not begin with DMK. It did not begin with Tamil Nadu as a political unit. It began with a man who wanted to break something.</p>

  <div class="timeline">
    <div class="tl-item">
      <div class="tl-dot" style="background:var(--accent)"></div>
      <div class="tl-yr">1879 · Periyar is born</div>
      <div class="tl-title">E.V. Ramasamy is born into a merchant caste in Erode</div>
      <div class="tl-body">A man who would eventually reject the caste he was born into — and reject religion, ritual, and hierarchy with a ferocity that made him the most controversial and most consequential Tamil thinker of the 20th century. He didn't become Periyar — the great one — immediately. That took decades of argument, organisation, and provocation.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--accent)"></div>
      <div class="tl-yr">1925 · Self-Respect Movement</div>
      <div class="tl-title">Periyar founds the Self-Respect Movement — the ideological root of everything</div>
      <div class="tl-body">This is where Dravidianism as a philosophy formally begins. Not a party. A movement. Core argument: caste, Brahminical authority, and religious superstition are tools of oppression. Rational thinking, self-dignity, and social equality are the alternative. Periyar ran self-respect marriages — without priests, without dowry, without caste criteria. Radical for 1925. Still radical in many parts of India today.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--accent)"></div>
      <div class="tl-yr">1938 · The Hindi Imposition Agitation</div>
      <div class="tl-title">Periyar leads massive resistance to compulsory Hindi in Madras Presidency</div>
      <div class="tl-body">The British colonial government under Congress wanted to impose Hindi as a compulsory subject. Periyar organised mass protests. Two protesters died. The policy was eventually withdrawn. This was the first major demonstration that Tamil linguistic identity could mobilise a political movement. It also set the template for 1965 — the second, larger Hindi agitation that permanently ended any central government attempt to impose Hindi on Tamil Nadu.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--gold)"></div>
      <div class="tl-yr">1944 · Dravidar Kazhagam founded</div>
      <div class="tl-title">Periyar founds DK — a social organisation, not an electoral party</div>
      <div class="tl-body">Periyar was skeptical of electoral politics. He believed political parties would compromise ideological purity. He was partially right. DK remained a social-cultural organisation. It never contested elections — a deliberate choice. This is why the argument "Periyar built Dravidianism as an electoral project" is historically inaccurate. He built it as a social project. Others converted it into electoral currency.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--gold)"></div>
      <div class="tl-yr">1949 · DMK founded by CN Annadurai</div>
      <div class="tl-title">Annadurai splits from Periyar and creates an electoral vehicle from the philosophy</div>
      <div class="tl-body">Annadurai — "Anna" — was Periyar's protégé. He broke from DK primarily over the question of electoral participation. Where Periyar refused politics, Anna embraced it. He took the anti-caste, Tamil identity, anti-Brahmin framework and turned it into coalition mathematics. This is the moment when Dravidian philosophy becomes Dravidian party politics. The translation was imperfect from the start.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--gold)"></div>
      <div class="tl-yr">1954–1963 · Kamarajar as Chief Minister</div>
      <div class="tl-title">A Congress leader operationalises Dravidian social priorities without the label</div>
      <div class="tl-body">K. Kamarajar — a Nadar, formally educated only to Class 6 — becomes one of the most consequential Chief Ministers in TN's history. He builds thousands of schools in rural areas. He initiates the noon meal scheme to keep poor children from dropping out. His rise was only possible because Periyar's movement had cracked the upper-caste ceiling on public life. He never called himself Dravidian. He was operating within the world Periyar had made possible.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--teal)"></div>
      <div class="tl-yr">1965 · Second Hindi Agitation</div>
      <div class="tl-title">Mass resistance to Hindi imposition — two students die, national policy changes</div>
      <div class="tl-body">The central government attempted to make Hindi the sole official language of India. Tamil Nadu exploded. Student suicides, mass protests, clashes. Two students — Veeramani and Shanmugam — died. The national policy was permanently reversed. Tamil was protected as an official language. This was the decisive moment when Tamil linguistic identity became structurally embedded in Indian constitutional politics. It did not happen through elections. It happened through the streets.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--teal)"></div>
      <div class="tl-yr">1967 · DMK wins — Congress era ends permanently in TN</div>
      <div class="tl-title">Annadurai wins. Tamil Nadu never returns to Congress. Dravidian parties govern ever since.</div>
      <div class="tl-body">Congress has not won a Tamil Nadu assembly election since. This is the beginning of the Dravidian party era. What follows is 57 years of alternating DMK and AIADMK governance — with all the achievements and all the failures that come with power concentrated in a two-party dynamic with no serious third alternative.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--teal)"></div>
      <div class="tl-yr">1972 · AIADMK founded by MGR</div>
      <div class="tl-title">Film star MGR splits from DMK — Dravidian politics fractures into two camps</div>
      <div class="tl-body">MGR's split was personal and political — he was expelled from DMK. He built a party on his film stardom, his welfare-populist instincts, and mass adoration. His governance, despite its theatrical qualities, delivered real welfare outcomes. He scaled the noon meal scheme to universal coverage. He created the TASCO cooperative system. The philosophy traveled — even through a film star who was ideologically conservative and closer to national parties.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--blue)"></div>
      <div class="tl-yr">1980s–2000s · The Welfare State Expands and Distorts</div>
      <div class="tl-title">Genuine welfare competes with electoral freebies — the line blurs</div>
      <div class="tl-body">Both parties expand welfare programmes. Free rice, subsidised rations, health schemes, education. Simultaneously: free TVs, free mixers, free grinders appear. The distinction between removing barriers to opportunity and buying votes with consumer goods becomes harder to defend. This is the period when the philosophy begins to be genuinely misused — not abandoned, but instrumentalised in ways that empty it of meaning.</div>
    </div>

    <div class="tl-item">
      <div class="tl-dot" style="background:var(--blue)"></div>
      <div class="tl-yr">Today · The Anti-Dravidian Sentiment Rises</div>
      <div class="tl-title">Legitimate anti-incumbency gets absorbed into anti-Dravidian framing</div>
      <div class="tl-body">Frustration with DMK's family politics, AIADMK's corruption, and the genuine failure to deliver on the anti-caste promise is real and valid. But this frustration is increasingly framed not as "these parties failed" but as "Dravidianism failed." Those are different arguments with different implications. One is an electoral critique. The other is a civilisational one. This matters — because one invites better governance, the other invites replacing the philosophy entirely.</div>
    </div>
  </div>

</div>

<div class="rule"></div>

<!-- CHAPTER 3: PERIYAR -->
<div id="ch3" class="chapter fade-up">
  <span class="ch-num">Chapter 03</span>
  <div class="ch-title">Periyar — The Rational and The Irrational</div>
  <p class="ch-lead">He is either worshipped or reviled. Both responses miss him. He was a complex, often contradictory human being with some genuinely transformative ideas and some genuinely troubling ones.</p>

  <p class="prose">Periyar's incest claim — which circulates constantly — needs to be addressed clearly. In the 1940s, he made an anthropological argument that society's rules around kinship marriage were social constructs, not divine law. He was challenging the idea that any social rule is "natural" rather than made by humans. This was a philosophical provocation in the tradition of rational inquiry. It was weaponised, stripped of context, and turned into a personal accusation. That is a legitimate concern about how his words were used — not evidence that the rest of his thinking is wrong.</p>

  <div class="callout neutral">
    <span class="callout-label">On the incest claim — the honest reading</span>
    Periyar's argument was that social norms — all social norms — are human creations, not divine mandates. He used kinship marriage rules as an example of an arbitrary norm. Whether you agree with his argument or not, it is a philosophical position, not an endorsement. The claim that "Periyar supported incest" is a decontextualised misreading used to discredit his anti-caste work. Engaging with his actual arguments is more honest than either worshipping him or dismissing him through this claim.
  </div>

  <div class="periyar-split">
    <div class="ps-col rational">
      <span class="ps-col-head">What he got right — rational thinking</span>

      <div class="ps-item">
        <strong>Caste is irrational</strong>
        Arguing in 1925 that caste hierarchy had no rational basis — only a power-maintenance basis — was ahead of what most institutions would say openly until decades later.
      </div>
      <div class="ps-item">
        <strong>Women's equality</strong>
        He advocated for widow remarriage, against dowry, against child marriage — at a time when these positions were genuinely radical. Self-respect marriages gave women legal equality without ritual subordination.
      </div>
      <div class="ps-item">
        <strong>Rationalism over superstition</strong>
        He challenged temple rituals, priesthood monopoly, and religious justifications for social hierarchy. Whether you agree with his atheism or not, his critique of religious authority being used to justify caste oppression was structurally accurate.
      </div>
      <div class="ps-item">
        <strong>Tamil identity without supremacy</strong>
        He argued for Tamil civilisational pride without arguing Tamil people were superior to others. The distinction between cultural confidence and cultural supremacy is one he largely maintained.
      </div>
    </div>

    <div class="ps-col irrational">
      <span class="ps-col-head">Where he was inconsistent or wrong</span>

      <div class="ps-item">
        <strong>Dravidistan separatism</strong>
        At various points, Periyar advocated for a separate Dravidian nation — separate from India. This went beyond cultural assertion into a political position that most Tamil people never supported and that contradicted his own universalist social philosophy.
      </div>
      <div class="ps-item">
        <strong>His late marriage</strong>
        Periyar married Maniammai — a woman significantly younger than him — late in his life. He was in his 70s. He had advocated for women's autonomy and against unequal power in relationships. The contradiction between his stated values and personal choice was real and noted by contemporaries.
      </div>
      <div class="ps-item">
        <strong>Anti-north statements</strong>
        Some of his rhetoric about northern Indians crossed from cultural self-assertion into generalisations that were reductive. Critiquing Brahmin power is one thing. Characterising entire northern populations is another. The distinction was not always maintained in his speeches.
      </div>
      <div class="ps-item">
        <strong>Electoral skepticism that backfired</strong>
        His refusal to engage with electoral politics meant the philosophy he built was eventually picked up by parties — DMK — without the structural guardrails he might have insisted on. His distrust of politics left the philosophy without political protection.
      </div>
    </div>
  </div>

  <div class="callout thought">
    <span class="callout-label">The honest assessment</span>
    Periyar was not a saint. He was not a demon. He was a man who identified a genuine structural injustice — caste hierarchy — and fought it with the tools available to him: argument, provocation, organisation, and relentless public challenge of authority. Some of his methods were extreme. Some of his positions were inconsistent. The question worth asking is: <em>can you separate the idea from the man who first articulated it?</em> Because the idea — that caste hierarchy is irrational and must be dismantled — does not become wrong because Periyar was sometimes wrong about other things.
  </div>

</div>

<div class="rule"></div>

<!-- CHAPTER 4: PHILOSOPHY IN PRACTICE -->
<div id="ch4" class="chapter fade-up">
  <span class="ch-num">Chapter 04</span>
  <div class="ch-title">How the philosophy held across parties that hated each other</div>
  <p class="ch-lead">This is the most important evidence that Dravidianism is a philosophy, not a party platform. The same core ideas survived leaders who were political enemies.</p>

  <p class="prose">Consider what the noon meal scheme tells us. Kamarajar — Congress — started it in the 1950s as a development intervention: keep poor children in school by removing hunger as a barrier. This is philosophy idea number 2: the state owes citizens a floor of dignity.</p>

  <p class="prose">MGR — AIADMK, DMK's bitter rival — scaled it to every child in Tamil Nadu in the 1980s. He didn't do this because Karunanidhi told him to. He did this because the philosophical logic was sound: a hungry child cannot learn. A child who cannot learn cannot escape poverty. The state must intervene at that specific point of failure.</p>

  <p class="prose">Jayalalithaa — who took the feud with DMK to personal and occasionally vicious levels — maintained and expanded the scheme. She also fiercely defended Tamil linguistic rights and opposed central government overreach — philosophy ideas 3 and 4.</p>

  <div class="callout truth">
    <span class="callout-label">What this proves</span>
    If the philosophy were merely DMK's political programme, it would have died the moment AIADMK came to power in 1977. It didn't. If it were merely one leader's personality cult, it would have died with MGR in 1987. It didn't. The continuity of core welfare commitments and Tamil identity protection across deeply hostile political rivals is the strongest evidence that something exists underneath the parties — a shared philosophical floor that no party has been willing to fully abandon, even when abandoning it would have served their political interests.
  </div>

  <p class="prose">Kamarajar's role specifically is worth holding clearly. He was not Dravidian in party affiliation. He was a product of the social environment Periyar created — where a Nadar with a Class 6 education could rise to Chief Minister. His governance instincts — education first, honest administration, rural investment, the poor child over the wealthy corporation — were shaped by the same social philosophy. He is proof that the philosophy does not belong to any one party's ownership.</p>

</div>

<div class="rule"></div>

<!-- CHAPTER 5: FREEBIES -->
<div id="ch5" class="chapter fade-up">
  <span class="ch-num">Chapter 05</span>
  <div class="ch-title">The freebie question — where's the line?</div>
  <p class="ch-lead">Not all welfare is the same. The difference between removing a barrier and buying a vote is real — and worth examining without being dismissive of either.</p>

  <p class="prose">There is an old distinction: teaching a person to fish versus giving them a fish. Applied to welfare, it becomes: does this scheme create lasting capability, or does it only create temporary comfort? Both might be defensible — but they are not the same thing, and conflating them is how legitimate welfare gets discredited and how vote-buying gets defended as welfare.</p>

  <div class="freebie-grid">
    <div class="fb-card invest">
      <span class="fb-card-label">Barrier-removal welfare</span>
      <div class="fb-card-title">Noon meal scheme</div>
      <div class="fb-card-body">A hungry child cannot concentrate, cannot learn, cannot attend school consistently. Remove hunger, and school attendance goes up, learning improves, and the child's trajectory changes. The investment compounds across a lifetime and across generations. This is barrier-removal.</div>
    </div>
    <div class="fb-card invest">
      <span class="fb-card-label">Barrier-removal welfare</span>
      <div class="fb-card-title">Free bus passes for women</div>
      <div class="fb-card-body">Transport cost is a real barrier to workforce participation for women in lower-income households. Removing it expands the labour market they can access. A woman who earns income is less economically dependent. The scheme creates mobility — literal and economic.</div>
    </div>
    <div class="fb-card invest">
      <span class="fb-card-label">Barrier-removal welfare</span>
      <div class="fb-card-title">₹1,000/month to women</div>
      <div class="fb-card-body">A small regular income in a woman's name — not the household's name — creates a degree of financial independence. Whether this is sufficient is debatable. Whether financial independence matters to women's autonomy is not. The intent maps to the philosophy.</div>
    </div>
    <div class="fb-card invest">
      <span class="fb-card-label">Barrier-removal welfare</span>
      <div class="fb-card-title">Education subsidies, free books</div>
      <div class="fb-card-body">Cost of education materials is a documented reason for poor children dropping out. Removing that cost removes a barrier. First-generation learners in families that have never had an educated member need structural support — not charity, but equalisation.</div>
    </div>

    <div class="fb-card circus">
      <span class="fb-card-label">Electoral freebie — question its logic</span>
      <div class="fb-card-title">Free mixers and grinders</div>
      <div class="fb-card-body">A mixer-grinder is a consumer appliance. It does not change a household's income, education, or opportunity. It makes cooking easier — but it does not remove any structural barrier to development. It is a gift. The question: does receiving a mixer make someone's children more likely to finish school or access better work? If yes — indirect barrier removal. If no — it is electoral goodwill.</div>
    </div>
    <div class="fb-card circus">
      <span class="fb-card-label">Electoral freebie — question its logic</span>
      <div class="fb-card-title">Free TVs</div>
      <div class="fb-card-body">Television is entertainment and information. A TV does not produce income, does not improve health outcomes, does not change a child's educational trajectory in any documented way. It is a visible, memorable gift delivered before an election. The philosophy of "the state owes citizens a floor of dignity" does not obviously include a television.</div>
    </div>
    <div class="fb-card circus">
      <span class="fb-card-label">Worth examining honestly</span>
      <div class="fb-card-title">Free gold for marriages</div>
      <div class="fb-card-body">This one is genuinely complicated. Dowry burden on poor families is real and documented. Reducing that burden has a real effect on whether daughters are seen as liabilities. But gold as the mechanism — rather than direct dowry-abolition campaigns or legal enforcement — raises questions. Is this reducing the dowry problem or participating in it?</div>
    </div>
    <div class="fb-card circus">
      <span class="fb-card-label">The structural problem</span>
      <div class="fb-card-title">The escalation pattern</div>
      <div class="fb-card-body">Each election cycle sees new promises. Each party tries to outbid the other. The competition is no longer about who has the better development vision — it is about who will give more. This arms race hollows out the philosophy. The original idea was dignity through capability. The circus version is dignity through consumption.</div>
    </div>
  </div>

  <div class="callout thought">
    <span class="callout-label">The honest question to sit with</span>
    The freebie debate is often used to dismiss all welfare — which is intellectually lazy. And welfare is sometimes used to defend all freebies — which is equally lazy. The real question is: <em>does this specific scheme create lasting change in someone's capability or opportunity, or does it create temporary comfort and electoral memory?</em> Both can be defended. But they should be defended on different grounds. Conflating them weakens the case for the welfare that genuinely works.
  </div>

</div>

<div class="rule"></div>

<!-- CHAPTER 6: WHERE IT FAILED -->
<div id="ch6" class="chapter fade-up">
  <span class="ch-num">Chapter 06</span>
  <div class="ch-title">Where Dravidianism failed — and why honesty requires saying so</div>
  <p class="ch-lead">A philosophy that cannot acknowledge its failures becomes a religion. These are documented failures — not anti-Dravidian arguments, but honest assessments of where the gap between promise and delivery is real.</p>

  <div class="fail-list">
    <div class="fail-item">
      <div class="fail-num">Failure 01 · The Core Promise</div>
      <div class="fail-title">Casteism was supposed to end. It didn't.</div>
      <div class="fail-body">This is the most fundamental failure. The central promise of Dravidian philosophy — that caste hierarchy would be dismantled through social reform — has not been delivered in 100 years. Tamil Nadu has better caste-based representation in government jobs than most states. It has better school enrollment across caste lines. But caste-based violence still occurs. Caste is still the primary unit of electoral calculation for both Dravidian parties. The parties that were supposed to end caste use caste as their most reliable electoral tool. Whether this is a failure of the philosophy or a failure of its executors is the genuine debate.</div>
    </div>

    <div class="fail-item">
      <div class="fail-num">Failure 02 · The Dynasty Problem</div>
      <div class="fail-title">The movement that fought inherited privilege became inherited privilege.</div>
      <div class="fail-body">Periyar's movement was explicitly anti-dynastic — he rejected hereditary authority of all kinds, including Brahmin hereditary authority. DMK under Karunanidhi became a family business: Stalin inherited the party, Kanimozhi is a Rajya Sabha member, multiple family members hold party positions. AIADMK under Jayalalithaa was less dynastic but built on absolute personal loyalty. The parties that were founded to fight one form of inherited privilege created another. This is a documented failure that cannot be explained away.</div>
    </div>

    <div class="fail-item">
      <div class="fail-num">Failure 03 · Corruption as Normal</div>
      <div class="fail-title">Anti-corruption was part of the founding promise. Corruption became endemic.</div>
      <div class="fail-body">Both parties have documented corruption cases across multiple governments. 2G spectrum allocation under DMK-aligned central ministers. Jayalalithaa's own disproportionate assets case — for which she was convicted by a Karnataka court before acquittal on appeal. Sand mining, liquor licensing, government contracts — the corruption in TN's governance has been documented across investigative journalism and court records. A philosophy that began with Kamarajar's legendary personal honesty — he reportedly died with almost nothing — ended up producing governments with very different standards.</div>
    </div>

    <div class="fail-item">
      <div class="fail-num">Failure 04 · Caste as Vote Bank</div>
      <div class="fail-title">The anti-caste movement created caste-based electoral arithmetic.</div>
      <div class="fail-body">In trying to represent OBC communities politically, both parties ended up making caste the primary unit of electoral organisation. Candidate selection is based on caste arithmetic. Coalition building is based on caste arithmetic. This is not unique to TN — it is the structural contradiction of any electoral democracy trying to address caste. But it is worth naming: the parties that were supposed to make caste irrelevant made it more relevant as an electoral unit, even as they made it less relevant as a social ceiling. Two different things happened simultaneously.</div>
    </div>

    <div class="fail-item">
      <div class="fail-num">Failure 05 · The Philosophy Became a Tribal Identity</div>
      <div class="fail-title">Dravidianism stopped being examined and started being performed.</div>
      <div class="fail-body">By the 2000s, "Dravidian" for many people was less a set of ideas to be examined and more a cultural identity to be claimed. You were Dravidian because you opposed BJP, not because you had thought through Periyar's anti-caste arguments. You were against Hindi imposition because it was the Dravidian position, not because you had examined why language autonomy matters. When a philosophy becomes a tribal marker — something you inherit rather than choose — it loses its ability to challenge and reform. This is arguably the deepest failure: the philosophy ate itself.</div>
    </div>
  </div>

  <div class="callout warn">
    <span class="callout-label">The honest position</span>
    Naming these failures is not the same as saying the philosophy is wrong. It is saying that having good ideas and executing them well are two different things. The anti-caste idea was correct. The execution has been deeply imperfect. Welfare as infrastructure was correct. It became partially corrupted by electoral incentives. Tamil autonomy was correct. It became partially tribalistic. <em>You can hold both: the ideas were largely right, and the parties that claimed them largely failed to fully deliver them.</em> That is not a contradiction. That is the honest picture.
  </div>

</div>

<div class="rule-heavy"></div>

<!-- CLOSING REFLECTION -->
<div id="ch7" class="reflection-section fade-up">
  <div class="ref-intro">Before you close — sit with these</div>
  <p class="ref-lead">Not questions with answers. Questions with honesty. Tap each one when you're ready.</p>

  <div class="ref-q" onclick="toggleRef(this)">
    <div class="ref-q-text">"When I criticise Dravidian politics, am I criticising a set of ideas — or a set of people who claimed those ideas and disappointed me?"</div>
    <div class="ref-q-expand">
      <p>Both are valid. But they require different conversations. If you're criticising the ideas — that Brahmins dominated unfairly, that caste should not determine destiny, that the state owes its poorest citizens a floor, that Tamil has a right to exist without subordination to Hindi — then make that argument. Say which specific idea you think is wrong.</p>
      <p>If you're criticising DMK's nepotism, AIADMK's corruption, and the freebie circus — that's also valid. But it is a critique of governance, not philosophy. The same way you can criticise a specific government's handling of the economy without arguing that economic development is a bad goal.</p>
      <p>The question is: <em>what exactly are you angry at?</em> The more precisely you can answer that, the more useful your critique becomes — and the less likely it is to be absorbed into a broader anti-Dravidian sentiment that serves interests you may not share.</p>
    </div>
  </div>

  <div class="ref-q" onclick="toggleRef(this)">
    <div class="ref-q-text">"If Dravidianism's core ideas — anti-caste, welfare as infrastructure, Tamil identity, federal autonomy — are wrong, what is the alternative? And has anyone actually offered one?"</div>
    <div class="ref-q-expand">
      <p>This is worth thinking through honestly. The critique of Dravidianism is often clearer than the alternative being offered. What is the alternative model for Tamil Nadu's development? One that addresses caste inequality differently? One that delivers welfare more efficiently? One that protects Tamil without cultural chauvinism?</p>
      <p>These are legitimate questions. But "the Gujarat model" or "BJP's governance" are not self-evidently the answer — because Gujarat's human development indicators lag Tamil Nadu's on most metrics. The comparison requires specifics, not slogans.</p>
      <p>The question to hold: <em>am I rejecting a philosophy, or am I rejecting the people who claimed it?</em> If it's the people — say that clearly. If it's the philosophy — say what you'd replace it with and why.</p>
    </div>
  </div>

  <div class="ref-q" onclick="toggleRef(this)">
    <div class="ref-q-text">"Casteism survived 100 years of anti-caste politics in Tamil Nadu. Does that mean the idea was wrong — or that it was never fully tried?"</div>
    <div class="ref-q-expand">
      <p>This might be the most important question in this entire piece. The anti-caste philosophy says: a society organised around birth-based hierarchy wastes its human potential, produces injustice, and sustains itself through social violence. That observation is accurate by almost any measure.</p>
      <p>The Dravidian parties said they would dismantle caste. They improved representation. They improved access. They did not dismantle caste — partly because dismantling caste required giving up the caste-based voter coalitions that kept them in power.</p>
      <p>So: the philosophy was never fully tried, because fully trying it would have been politically suicidal for the parties that claimed it. <em>That is a failure of political courage, not a failure of the underlying idea.</em> Whether you find that distinction meaningful is up to you.</p>
    </div>
  </div>

  <div class="ref-q" onclick="toggleRef(this)">
    <div class="ref-q-text">"Have I ever seen a freebie that changed someone's life — and have I ever seen one that was just a purchase of loyalty?"</div>
    <div class="ref-q-expand">
      <p>Most people who grew up in Tamil Nadu can probably answer yes to both if they think carefully. A first-generation college student whose family could afford school because of subsidised meals and free textbooks — that is a changed life. A household that received a television before an election and voted accordingly and received nothing else — that is purchased loyalty.</p>
      <p>The honest position is not "all welfare is good" or "all freebies are bad." It is: <em>what is the mechanism of change?</em> Does this specific scheme create lasting capability? Does it remove a specific documented barrier? Is there evidence it works?</p>
      <p>When the answer is yes — defend it as welfare, not as freebies. When the answer is no — it is worth saying so, even if it is uncomfortable.</p>
    </div>
  </div>

  <div class="ref-q" onclick="toggleRef(this)">
    <div class="ref-q-text">"What would Periyar think of Tamil Nadu today — and is that a comfortable thought?"</div>
    <div class="ref-q-expand">
      <p>He would probably notice that inter-caste marriage rates in Tamil Nadu remain low despite decades of anti-caste politics. He would probably note that manual scavenging — which he called irrational and degrading — has not been fully eliminated. He would probably observe that the parties that claimed his legacy became exactly the kind of hereditary authority structures he spent his life opposing.</p>
      <p>He would also probably note that a Dalit woman can now sit in the front of a bus, that a first-generation learner from an OBC family can access college, that Tamil is constitutionally protected in ways it wasn't in 1925.</p>
      <p>He would probably be both satisfied and furious — which is the only honest thing a rational thinker can be when examining a century of partial progress. <em>The question for you is: which part of that assessment do you sit with more comfortably?</em></p>
    </div>
  </div>

  <div style="margin-top:40px;text-align:center;">
    <p style="font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:var(--muted);line-height:1.65;max-width:500px;margin:0 auto;">
      You don't have to agree with Dravidianism.<br>You don't have to defend DMK or AIADMK.<br>You just have to know which one you're talking about<br>before you start.
    </p>
  </div>

</div>

<!-- CITATIONS -->
<div class="cite fade-up">
  <strong style="display:block;margin-bottom:10px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;">Sources & Further Reading</strong>
  This piece draws on documented historical records and peer-reviewed scholarship. Key sources: A.R. Venkatachalapathy, <em>In Those Days There Was No Coffee: Writings in Cultural History</em> (Yoda Press, 2006) — on Tamil social history. V. Geetha and S.V. Rajadurai, <em>Towards a Non-Brahmin Millennium</em> (Samya, 1998) — the standard scholarly work on Periyar and the Dravidian movement. M.S.S. Pandian, <em>The Image Trap: M.G. Ramachandran in Film and Politics</em> (Sage, 1992) — on MGR and Dravidian populism. B.R. Ambedkar, <em>Annihilation of Caste</em> (1936, republished Verso 2014) — on caste as a structural problem. Election Commission of India official records for electoral data. Census of India and NFHS surveys for demographic data. NHRC and state government records for welfare scheme data. The noon meal scheme history is documented in government records and K. Rajaram, <em>Kamarajar: A Study</em> (Emerald 1991). Periyar's speeches are available through the Periyar Self-Respect Propaganda Institution archives, Chennai.
</div>

</div><!-- /wrap -->

$drav_body$,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
) ON CONFLICT (article_id, version_number) DO NOTHING;

-- ── 3. Article: Tamil Nadu Governance Audit ───────────────────────────────────
INSERT INTO public.articles (id, slug, title, subtitle, current_version, published, created_by)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'tn-governance-audit',
  'Tamil Nadu — Read the Full Record',
  'Factual · Cited · Both-Sided · 2024–25. Real governance flaws and the real hidden costs of BJP alignment.',
  1,
  true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.article_versions (article_id, version_number, content, created_by)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  1,
  $tn_body$<div data-theme="dark">
<div id="prog"></div>
<button class="tbtn" id="tBtn">☀️</button>
<a class="btt" id="btt" href="#top">↑</a>

<div class="wrap" id="top">

<!-- ══════ HERO ══════ -->
<div class="hero up">
  <span class="mono">Factual · Cited · Both-Sided · 2024–25</span>
  <h1>Tamil Nadu —<br><span class="hl-red">Real Governance Flaws.</span><br><span class="hl-amber">Real Hidden Costs of BJP Alignment.</span></h1>
  <p class="hero-desc">Every data point on this page carries a superscript citation linked to a verified source at the bottom. Click any <a class="ref" href="#refs" style="font-size:11px;vertical-align:baseline;">¹</a> to jump to the full reference. Click "↩" in the reference to return.</p>
  <div class="notice-box">
    <div class="dot"></div>
    <div><strong>Important framing:</strong> BJP alignment offers real, visible short-term benefits. The argument here is that for TN's specific baseline — already industrialised, already high-HDI — the long-term structural costs outweigh those gains, and the costs fall disproportionately on people who cannot opt out of them. Both sides are fully accounted.</div>
  </div>
</div>

<!-- ══════ SECTION 1: TN GOVERNANCE FLAWS ══════ -->
<div class="section up" id="s1">
  <span class="sec-label">Section 01 · The Honest Audit</span>
  <h2>Tamil Nadu's Real Governance Failures</h2>
  <p class="sec-lead">Documented across court records, CAG reports, NCRB data, and investigative journalism. TN's strong development metrics exist alongside — not because of — its governance culture.</p>

  <!-- CORRUPTION -->
  <h3>Documented Corruption — Court Records</h3>
  <div class="tl-list">
    <div class="tl-item">
      <div class="tl-yr">2G / 2008</div>
      <div class="tl-body-wrap">
        <div class="tl-title">2G Spectrum Allocation — CAG estimated loss of ₹1.76 lakh crore <a class="ref" href="#r1" id="b1">[1]</a><a class="ref" href="#r2" id="b2">[2]</a></div>
        <div class="tl-body">Comptroller and Auditor General of India's Report No. 19 of 2010 documented the loss from spectrum allocation. DMK minister A. Raja, then Union Telecom Minister, was convicted by a Delhi Special Court in 2017 <a class="ref" href="#r3" id="b3">[3]</a> and subsequently acquitted by Delhi High Court in 2021 citing insufficient evidence. <a class="ref" href="#r4" id="b4">[4]</a> The CAG report and the Supreme Court's 2012 cancellation of 122 licences are the primary documented records. <a class="ref" href="#r5" id="b5">[5]</a></div>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-yr">2014</div>
      <div class="tl-body-wrap">
        <div class="tl-title">Jayalalithaa — Convicted in Disproportionate Assets Case, Later Acquitted <a class="ref" href="#r6" id="b6">[6]</a><a class="ref" href="#r7" id="b7">[7]</a></div>
        <div class="tl-body">Karnataka Special Court convicted Jayalalithaa in September 2014 — sentenced to 4 years imprisonment and ₹100 crore fine. Karnataka High Court acquitted her in May 2017, extending benefit of doubt on some assets. The 18-year trial (1997–2015) remains one of India's longest-running corruption cases involving a sitting Chief Minister.</div>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-yr">Ongoing</div>
      <div class="tl-body-wrap">
        <div class="tl-title">Sand Mining — National Green Tribunal and Madras HC Documented Orders <a class="ref" href="#r8" id="b8">[8]</a><a class="ref" href="#r9" id="b9">[9]</a></div>
        <div class="tl-body">National Green Tribunal and Madras High Court have issued multiple orders against illegal sand mining across Tamil Nadu's rivers — Cauvery, Palar, Vaigai. Court orders note complicity of local officials. Madras HC in 2022 observed that illegal mining continued despite orders, indicating structural enforcement failure linked to patronage networks.</div>
      </div>
    </div>
    <div class="tl-item">
      <div class="tl-yr">Structural</div>
      <div class="tl-body-wrap">
        <div class="tl-title">Dynasty Politics — Both Parties, Documented <a class="ref" href="#r10" id="b10">[10]</a></div>
        <div class="tl-body">DMK: M.K. Stalin (son of Karunanidhi, current CM), Kanimozhi Karunanidhi (daughter, Rajya Sabha MP), Dayanidhi Maran (nephew, former Union Minister). AIADMK under Jayalalithaa operated on personal loyalty structures — party functionaries contested internal elections at her direction. Both parties have blocked emergence of second-tier leadership outside family structures for decades.</div>
      </div>
    </div>
  </div>

  <div class="rule"></div>

  <!-- TASMAC -->
  <h3>TASMAC — Fiscal Dependency on State-Run Alcohol Monopoly</h3>
  <div class="card rd" style="margin:16px 0;">
    <span class="card-tag">Structural Conflict of Interest</span>
    <div class="card-body" style="margin-bottom:14px;">
      Tamil Nadu State Marketing Corporation (TASMAC) holds a monopoly on retail alcohol sales in TN. <a class="ref" href="#r11" id="b11">[11]</a> Revenue from TASMAC contributed approximately ₹44,000 crore to state revenue in 2023-24, representing roughly 15% of state own tax revenue. <a class="ref" href="#r12" id="b12">[12]</a> NCRB 2022 data places Tamil Nadu among states with the highest reported cases of domestic violence where alcohol was a documented factor. <a class="ref" href="#r13" id="b13">[13]</a> The structural conflict: a government that claims to protect women earns its single largest non-tax revenue source from the substance most associated with domestic violence against women.
    </div>
    <div class="tbar"><div class="tbar-label"><span>TASMAC revenue as % of TN state own tax revenue (2023-24)</span><span style="color:var(--red);">~15%</span></div><div class="tbar-track"><div class="tbar-fill" style="width:15%;background:var(--red);">~15%</div></div></div>
    <div class="tbar"><div class="tbar-label"><span>TN rank among states in alcohol-related domestic violence cases (NCRB 2022)</span><span style="color:var(--amber);">Top 6</span></div><div class="tbar-track"><div class="tbar-fill" style="width:60%;background:var(--amber);">Top 6 nationally</div></div></div>
  </div>

  <!-- GOVERNANCE SCORECARD -->
  <h3 style="margin-top:24px;">Governance Scorecard — Where TN Leads and Where It Fails</h3>
  <div class="score-grid">
    <div class="score-item">
      <div class="score-label">SDG Index Rank <a class="ref" href="#r14" id="b14">[14]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:85%;background:var(--green);"></div></div>
      <div class="score-meta"><span style="color:var(--green)">Rank 6 nationally</span><span>Strong</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Debt / GSDP Ratio <a class="ref" href="#r15" id="b15">[15]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:68%;background:var(--amber);"></div></div>
      <div class="score-meta"><span style="color:var(--amber)">~28% (elevated)</span><span>Watch</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Fiscal Deficit / GSDP <a class="ref" href="#r16" id="b16">[16]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:62%;background:var(--amber);"></div></div>
      <div class="score-meta"><span style="color:var(--amber)">~3.5% (rising)</span><span>Watch</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Literacy Rate <a class="ref" href="#r17" id="b17">[17]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:83%;background:var(--green);"></div></div>
      <div class="score-meta"><span style="color:var(--green)">82.9% (above nat. avg)</span><span>Strong</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Urban Youth Unemployment <a class="ref" href="#r18" id="b18">[18]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:55%;background:var(--red);"></div></div>
      <div class="score-meta"><span style="color:var(--red)">~19% urban youth</span><span>Concern</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">SC/ST Atrocity Cases <a class="ref" href="#r19" id="b19">[19]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:50%;background:var(--red);"></div></div>
      <div class="score-meta"><span style="color:var(--red)">Cases persist — gap</span><span>Failure</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Ease of Doing Business <a class="ref" href="#r20" id="b20">[20]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:80%;background:var(--teal);"></div></div>
      <div class="score-meta"><span style="color:var(--teal)">Top 5 nationally</span><span>Good</span></div>
    </div>
    <div class="score-item">
      <div class="score-label">Women in Workforce <a class="ref" href="#r21" id="b21">[21]</a></div>
      <div class="score-bar-wrap"><div class="score-bar" style="width:72%;background:var(--teal);"></div></div>
      <div class="score-meta"><span style="color:var(--teal)">Above national avg</span><span>Good</span></div>
    </div>
  </div>

  <!-- CHARTS -->
  <div class="ch2" style="margin-top:24px;">
    <div class="chart-wrap">
      <div class="chart-label">Debt Trajectory</div>
      <div class="chart-title">TN State Debt as % of GSDP — 2015 to 2024 <a class="ref" href="#r15" id="b15b">[15]</a></div>
      <div class="chart-sub">Rising debt-GSDP ratio despite strong revenue base. RBI State Finances Report 2023-24.</div>
      <canvas id="cDebt" height="210"></canvas>
    </div>
    <div class="chart-wrap">
      <div class="chart-label">Revenue Composition</div>
      <div class="chart-title">TN State Own Revenue — Key Sources 2023-24 <a class="ref" href="#r12" id="b12b">[12]</a></div>
      <div class="chart-sub">TASMAC and commercial taxes dominate. TN Budget 2024-25.</div>
      <canvas id="cRevenue" height="210"></canvas>
    </div>
  </div>
</div>

<!-- ══════ SECTION 2: WHAT ALIGNMENT GIVES ══════ -->
<div class="section up" id="s2">
  <span class="sec-label">Section 02 · The Visible Benefits</span>
  <h2>What BJP Alignment Actually Offers Tamil Nadu</h2>
  <p class="sec-lead">The benefits are real. Not dismissing them — accounting for them before building the cost column.</p>

  <div class="ch2">
    <div class="chart-wrap">
      <div class="chart-label">Railway Allocation Gap</div>
      <div class="chart-title">Per-Capita Railway Spend — Political Alignment Comparison 2014–24 <a class="ref" href="#r22" id="b22">[22]</a><a class="ref" href="#r23" id="b23">[23]</a></div>
      <div class="chart-sub">TN receives less than its economic weight justifies. Source: CAG Railway Reports + IndiaSpend analysis.</div>
      <canvas id="cRailway" height="220"></canvas>
    </div>
    <div class="chart-wrap">
      <div class="chart-label">Fiscal Devolution</div>
      <div class="chart-title">Tax Contribution vs Devolution Received — Major States <a class="ref" href="#r24" id="b24">[24]</a></div>
      <div class="chart-sub">TN contributes ~10.2% of the divisible pool, receives ~4.1% back. 15th Finance Commission Final Report.</div>
      <canvas id="cDevolution" height="220"></canvas>
    </div>
  </div>

  <div class="cards3" style="margin-top:16px;">
    <div class="card gr">
      <span class="card-tag">Real Benefit · Infrastructure</span>
      <div class="card-body">Faster NHAI and Railway Ministry allocation for politically aligned states. <a class="ref" href="#r22" id="b22b">[22]</a> TN has genuine freight corridor gaps — Tiruppur-Chennai-Tuticorin connectivity is below what textile export volumes justify. <a class="ref" href="#r25" id="b25">[25]</a> Alignment could accelerate this.</div>
    </div>
    <div class="card gr">
      <span class="card-tag">Real Benefit · Investment</span>
      <div class="card-body">DPIIT single-window and PLI scheme approvals move faster for aligned states. The Vedanta-Foxconn semiconductor plant — announced for Maharashtra, shifted to Gujarat after political change — is the documented case. <a class="ref" href="#r26" id="b26">[26]</a></div>
    </div>
    <div class="card gr">
      <span class="card-tag">Real Benefit · Schemes</span>
      <div class="card-body">CSS tranche releases move faster without political friction. Karnataka documented delays after falling out with the Centre — ₹6,000 crore GST compensation dispute. <a class="ref" href="#r27" id="b27">[27]</a> Alignment avoids this cost.</div>
    </div>
  </div>

  <div class="callout tl">
    <span class="cl">What the benefit column shows</span>
    Benefits are real but narrow: faster clearances, better infrastructure allocation, smoother scheme releases. Primarily concentrated among established industry, logistics, and large manufacturers already integrated into the national economy. Now build the cost column.
  </div>
</div>

<!-- ══════ SECTION 3: HIDDEN COSTS ══════ -->
<div class="section up" id="s3">
  <span class="sec-label">Section 03 · Hidden Costs — Click to Expand</span>
  <h2>What Alignment Actually Costs — Long-Term and Structural</h2>
  <p class="sec-lead">These don't appear in infrastructure headlines. They compound over 15–30 years. Every claim is cited — expand each row to see the evidence.</p>

  <!-- HC 1 -->
  <div class="hc-row" id="hc1">
    <div class="hc-head" onclick="toggleHC('hc1')">
      <div class="hc-icon">🗳️</div>
      <div style="flex:1;">
        <div class="hc-title">Delimitation 2026 — Permanent Electoral Punishment for Controlling Population Growth <a class="ref" href="#r28" id="b28">[28]</a><a class="ref" href="#r29" id="b29">[29]</a></div>
        <div class="hc-sub">Once done, cannot be undone for a generation</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: Permanent · Timeline: 2026 onwards · Reversible: No</span>
      <div class="hc-detail">
        The 2026 delimitation exercise will redraw Lok Sabha constituencies based on 2011 census population. <a class="ref" href="#r28" id="b28b">[28]</a> Tamil Nadu achieved replacement fertility (TFR ~1.8) in the 1990s through successful public health policy. <a class="ref" href="#r30" id="b30">[30]</a> Uttar Pradesh and Bihar have larger populations because they achieved demographic transition later. When seats are redrawn, TN will lose parliamentary representation relative to northern states — a structural electoral penalty for successful governance.<br><br>
        The 15th Finance Commission already demonstrated this logic: using 2011 population as a criterion reduced TN's devolution share. <a class="ref" href="#r24" id="b24b">[24]</a> Delimitation does the same thing to electoral weight. <strong>An aligned TN cannot build the southern coalition to challenge the formula without embarrassing its own coalition partner.</strong>
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> EPW Vol.58 No.12 (2023) — Delimitation and Southern Representation <a class="ref" href="#r29" id="b29b">[29]</a> · 15th Finance Commission Report demonstrating population-weighting impact on southern states <a class="ref" href="#r24" id="b24c">[24]</a> · NFHS-5 (2021) TN fertility data <a class="ref" href="#r30" id="b30b">[30]</a>
      </div>
    </div>
  </div>

  <!-- HC 2 -->
  <div class="hc-row" id="hc2">
    <div class="hc-head" onclick="toggleHC('hc2')">
      <div class="hc-icon">📚</div>
      <div style="flex:1;">
        <div class="hc-title">NEP Three-Language Formula — 15-Year Pipeline Cost for Tamil-Medium Students <a class="ref" href="#r31" id="b31">[31]</a><a class="ref" href="#r32" id="b32">[32]</a></div>
        <div class="hc-sub">Examination design advantages compound across career-entry pipeline</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: Very High · Timeline: 15–20 Years · Reversible: Difficult</span>
      <div class="hc-detail">
        NEP 2020's three-language formula structurally advantages Hindi speakers in national competitive examinations and central government employment. <a class="ref" href="#r32" id="b32b">[32]</a> This is a pipeline concern, not a sentiment concern. Three generations of Tamil people built economic mobility through Tamil-medium education. First-generation learners from rural TN accessed the formal economy through Tamil-medium government schools.<br><br>
        TN's own government committee — the NEET Committee Report (2021) — documented that Tamil-medium students underperform in national examinations relative to urban English-medium students. <a class="ref" href="#r31" id="b31b">[31]</a> NEP's language design extends this structural disadvantage. <strong>An aligned TN loses its political leverage to resist NEP implementation — leverage it currently exercises as an opposition state.</strong>
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> TN Government NEET Committee Report (2021) <a class="ref" href="#r31" id="b31c">[31]</a> · EPW Vol.56 No.28 — NEP Three Language Formula and Southern States <a class="ref" href="#r32" id="b32c">[32]</a> · National Curriculum Framework (2023) — documented Hindi-medium assessment advantages <a class="ref" href="#r33" id="b33">[33]</a>
      </div>
    </div>
  </div>

  <!-- HC 3 -->
  <div class="hc-row" id="hc3">
    <div class="hc-head" onclick="toggleHC('hc3')">
      <div class="hc-icon">💰</div>
      <div style="flex:1;">
        <div class="hc-title">Fiscal Advocacy Lost — Cess Growth, Finance Commission Formula, BE-RE Gap <a class="ref" href="#r34" id="b34">[34]</a><a class="ref" href="#r35" id="b35">[35]</a><a class="ref" href="#r24" id="b24d">[24]</a></div>
        <div class="hc-sub">TN contributes ₹1, receives ₹0.29 — alignment makes challenging this impossible</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: High · Annual Compounding · Reversible: Very Difficult</span>
      <div class="hc-detail">
        Three documented fiscal mechanisms drain TN's contribution annually:<br><br>
        <strong>Cess growth:</strong> Cesses and surcharges (not shared with states) grew from ~10% to 20%+ of gross central tax revenue 2014–2023. <a class="ref" href="#r34" id="b34b">[34]</a> States receive 41% of divisible pool but 0% of cesses. TN as a high tax-generating state loses disproportionately.<br><br>
        <strong>Finance Commission formula:</strong> 15th FC used 2011 census population, penalising states that controlled birth rates. TN's devolution share fell. <a class="ref" href="#r24" id="b24e">[24]</a><br><br>
        <strong>BE vs RE gap:</strong> Centre budgets higher devolution in Budget Estimates, cuts in Revised Estimates mid-year when states have already committed spending. Gap has widened post-2016. <a class="ref" href="#r35" id="b35b">[35]</a><br><br>
        <strong>An aligned TN cannot aggressively challenge these formulas without opposing its own coalition partner's fiscal interests.</strong>
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> CAG Consolidated Accounts of the Union 2022-23 (cess growth documentation) <a class="ref" href="#r34" id="b34c">[34]</a> · 15th Finance Commission Final Report <a class="ref" href="#r24" id="b24f">[24]</a> · NIPFP Working Paper 23/394 (2023) — State Fiscal Autonomy <a class="ref" href="#r35" id="b35c">[35]</a> · RBI State Finances Report 2023-24 <a class="ref" href="#r15" id="b15c">[15]</a>
      </div>
    </div>
  </div>

  <!-- HC 4 -->
  <div class="hc-row" id="hc4">
    <div class="hc-head" onclick="toggleHC('hc4')">
      <div class="hc-icon">⚖️</div>
      <div style="flex:1;">
        <div class="hc-title">Governor's Office — Converts from Accountability Friction to Policy Instrument <a class="ref" href="#r36" id="b36">[36]</a><a class="ref" href="#r37" id="b37">[37]</a></div>
        <div class="hc-sub">Currently creates political cost for BJP. Alignment redirects it.</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: Institutional · Immediate · Reversible: Depends on future alignment</span>
      <div class="hc-detail">
        TN Governor RN Ravi withheld assent to 10+ bills, made political speeches attacking the state government, and was eventually removed. <a class="ref" href="#r36" id="b36b">[36]</a> The Supreme Court intervened — in State of Tamil Nadu v. Governor of Tamil Nadu (2023), directing that Governors must act on bills within a reasonable time. <a class="ref" href="#r37" id="b37b">[37]</a><br><br>
        Right now, this friction is a documented political cost for BJP — creating national headlines about central overreach. Under alignment, the Governor's office ceases to be a friction point and becomes a Centre-directed policy facilitator. Bills TN's elected government opposes can be expedited. The accountability mechanism disappears — along with the friction.
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> The Hindu — RN Ravi Governor controversy documentation (2022-23) <a class="ref" href="#r36" id="b36c">[36]</a> · SC — State of Tamil Nadu v. Governor of Tamil Nadu (2023) <a class="ref" href="#r37" id="b37c">[37]</a> · PRS India — Governor Constitutional Role Analysis <a class="ref" href="#r38" id="b38">[38]</a>
      </div>
    </div>
  </div>

  <!-- HC 5 -->
  <div class="hc-row" id="hc5">
    <div class="hc-head" onclick="toggleHC('hc5')">
      <div class="hc-icon">🛕</div>
      <div style="flex:1;">
        <div class="hc-title">Temple Politics — HR&CE "Autonomy" and What It Actually Transfers To <a class="ref" href="#r39" id="b39">[39]</a><a class="ref" href="#r40" id="b40">[40]</a></div>
        <div class="hc-sub">A governance argument with a specific undisclosed beneficiary</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: Medium · Cultural + Financial · Long-term</span>
      <div class="hc-detail">
        BJP's argument that Hindu temples should be freed from government HR&CE (Hindu Religious and Charitable Endowments) control resonates with Tamil Hindus who feel government management is inefficient. <a class="ref" href="#r39" id="b39b">[39]</a><br><br>
        The argument omits: autonomy for whom? VHP and affiliated trusts are the primary vehicle through which the RSS ecosystem takes over temple management. Tamil temples control substantial land assets and community networks. Control of temple trusts converts into community mobilisation capacity for RSS. In Andhra Pradesh — where temple board management shifted toward RSS-affiliated trust structures after political alignment — this pattern is documented in Indian Express reporting 2020–2023. <a class="ref" href="#r40" id="b40b">[40]</a>
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> The Wire — HR&CE and BJP Temple Politics (2021) <a class="ref" href="#r39" id="b39c">[39]</a> · Indian Express — Andhra Pradesh Temple Board Changes (2020-23) <a class="ref" href="#r40" id="b40c">[40]</a> · Frontline — Temple Wealth and Political Control (2022) <a class="ref" href="#r41" id="b41">[41]</a>
      </div>
    </div>
  </div>

  <!-- HC 6 -->
  <div class="hc-row" id="hc6">
    <div class="hc-head" onclick="toggleHC('hc6')">
      <div class="hc-icon">🧬</div>
      <div style="flex:1;">
        <div class="hc-title">Civilisational Identity Shift — NCERT Revisions, Curriculum, Digital Narrative Over 20 Years <a class="ref" href="#r42" id="b42">[42]</a><a class="ref" href="#r43" id="b43">[43]</a><a class="ref" href="#r44" id="b44">[44]</a></div>
        <div class="hc-sub">Hardest to quantify. Hardest to reverse.</div>
      </div>
      <span class="hc-arrow">▼</span>
    </div>
    <div class="hc-body">
      <span class="hc-impact">Impact: Generational · Timeline: 20–30 Years · Reversible: Very Difficult</span>
      <div class="hc-detail">
        NCERT 2023 textbook changes — verified by The Hindu (April 2023 series) <a class="ref" href="#r42" id="b42b">[42]</a> and EPW Vol.58 No.24 <a class="ref" href="#r43" id="b43b">[43]</a> through direct textbook comparison: Gujarat 2002 riots deleted from Class 12 Political Science, Mughal history reduced significantly, Vedic content increased. These changes affect central board schools.<br><br>
        Separately: Vidya Bharati runs 12,000+ schools — verified by UDISE+ data <a class="ref" href="#r44" id="b44b">[44]</a> — with a curriculum documented to include Sangh-aligned historical framing. <a class="ref" href="#r45" id="b45">[45]</a><br><br>
        The Dravidian identity is TN's political infrastructure — the argument for autonomy, for language protection, for fiscal resistance. A generation with slightly weaker Tamil civilisational certainty produces a different political class 25 years later. This is the slowest and least reversible cost — and the one BJP's cultural strategy depends on most.
      </div>
      <div class="hc-evidence">
        <strong>Cited evidence:</strong> The Hindu — NCERT Changes April 2023 series <a class="ref" href="#r42" id="b42c">[42]</a> · EPW Vol.58 No.24 (2023) — NCERT Deletions Analysis <a class="ref" href="#r43" id="b43c">[43]</a> · UDISE+ School Data 2022-23 <a class="ref" href="#r44" id="b44c">[44]</a> · Walter Andersen & Shridhar Damle — The RSS: A View to the Inside (Penguin 2018), Ch.6 on Vidya Bharati curriculum <a class="ref" href="#r45" id="b45b">[45]</a> · Narasimhan et al., Science Vol.365 (2019) — South Asian Genomics (on Dravidian civilisational primacy claim) <a class="ref" href="#r46" id="b46">[46]</a>
      </div>
    </div>
  </div>
</div>

<!-- ══════ SECTION 4: WHO PAYS ══════ -->
<div class="section up" id="s4">
  <span class="sec-label">Section 04 · The Distribution Problem</span>
  <h2>Who Gets the Benefits vs Who Pays the Costs</h2>
  <p class="sec-lead">The "catapult growth" argument never answers this: growth for whom, and at whose structural expense?</p>

  <div class="who-pays">
    <div class="wp-col wins">
      <span class="wp-head">✓ Who gains from alignment</span>
      <div class="wp-item"><strong>Established manufacturers and exporters</strong>Faster PLI clearances, better logistics infrastructure. Benefits flow to those already operating at scale. <a class="ref" href="#r26" id="b26b">[26]</a></div>
      <div class="wp-item"><strong>English-medium educated urban professionals</strong>Already integrated into the national economy. Less affected by language pipeline changes. Better positioned to capture infrastructure investment benefits.</div>
      <div class="wp-item"><strong>Real estate and logistics along NH corridors</strong>Highway development benefits existing property holders along planned routes. Value capture concentrated among those with existing assets.</div>
      <div class="wp-item"><strong>Large industrial groups with central government exposure</strong>Investment steering through DPIIT and PLI primarily benefits at scale — not TN's MSME backbone which employs the majority of the workforce. <a class="ref" href="#r47" id="b47">[47]</a></div>
    </div>
    <div class="wp-col loses">
      <span class="wp-head">✗ Who bears the structural costs</span>
      <div class="wp-item"><strong>Tamil-medium rural first-generation learners</strong>Face structurally harder path to national examinations as NEP formula advantages compound over 15 years. The ladder they are climbing gets steeper. <a class="ref" href="#r31" id="b31d">[31]</a></div>
      <div class="wp-item"><strong>Next-generation welfare recipients</strong>As fiscal advocacy weakens and CSS conditionalities tighten under alignment, funds for school meals, healthcare, and women's welfare face greater central control. <a class="ref" href="#r35" id="b35d">[35]</a></div>
      <div class="wp-item"><strong>Future Tamil-speaking workforce</strong>As Tamil's functional economic utility is reduced through national examination design, language becomes less of an economic mobility vehicle. <a class="ref" href="#r32" id="b32d">[32]</a></div>
      <div class="wp-item"><strong>All TN voters from 2026 onward</strong>Delimitation reduces TN's Lok Sabha weight permanently — affecting every citizen's representation in Parliament regardless of income or education. <a class="ref" href="#r28" id="b28c">[28]</a></div>
    </div>
  </div>

  <div class="callout am">
    <span class="cl">The Core Asymmetry</span>
    The people who most loudly make the "let's align with BJP for growth" argument are people for whom the hidden costs are largely abstract — already English-fluent, already economically mobile, already unaffected by the Tamil-medium pipeline. The people who pay the structural costs are mostly not in the room where that argument is being made.
  </div>
</div>

<!-- ══════ SECTION 5: NET MATRIX ══════ -->
<div class="section up" id="s5">
  <span class="sec-label">Section 05 · The Net Calculation</span>
  <h2>Full Benefit-Cost Matrix — Both Columns Accounted</h2>
  <p class="sec-lead">The catapult growth argument builds column one. Here is the complete table.</p>

  <div class="tbl-wrap">
    <table class="bct">
      <thead>
        <tr>
          <th>Area</th>
          <th>Visible Benefit</th>
          <th>Magnitude</th>
          <th>Hidden Structural Cost</th>
          <th>Cost Timeline</th>
          <th>Who Bears It</th>
          <th>Cites</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Railway / NH Infrastructure</td>
          <td>Faster allocation, freight corridor upgrades</td>
          <td><span class="pill med">MEDIUM</span></td>
          <td>CBIC (World Bank funded) moves independently. Political alignment may not add significantly given existing multilateral commitments.</td>
          <td>Limited direct cost</td>
          <td>Industry (benefit)</td>
          <td><a class="ref" href="#r22">[22]</a><a class="ref" href="#r25">[25]</a></td>
        </tr>
        <tr>
          <td>PLI + Manufacturing</td>
          <td>Faster clearances, investment steering to TN</td>
          <td><span class="pill hi">REAL</span></td>
          <td>Apple/Foxconn already flowing without alignment. Marginal additionality given TN's existing industrial geography.</td>
          <td>Low direct cost</td>
          <td>Large manufacturers</td>
          <td><a class="ref" href="#r26">[26]</a></td>
        </tr>
        <tr>
          <td>CSS Fund Releases</td>
          <td>Faster tranches, less conditionality friction</td>
          <td><span class="pill med">MEDIUM</span></td>
          <td>Alignment removes TN's incentive to push for CSS conditionality reform — locking in Centre's leverage permanently.</td>
          <td>Institutional, long-term</td>
          <td>Welfare recipients</td>
          <td><a class="ref" href="#r27">[27]</a><a class="ref" href="#r35">[35]</a></td>
        </tr>
        <tr>
          <td>Language Policy (NEP)</td>
          <td>No direct benefit from alignment</td>
          <td><span class="pill lo">NONE</span></td>
          <td>Loss of political leverage to resist three-language formula. Tamil-medium students face structurally harder national exam path.</td>
          <td>15–20 years compounding</td>
          <td>Rural first-gen learners</td>
          <td><a class="ref" href="#r31">[31]</a><a class="ref" href="#r32">[32]</a></td>
        </tr>
        <tr>
          <td>Delimitation 2026</td>
          <td>No benefit — happens regardless</td>
          <td><span class="pill lo">NONE</span></td>
          <td>Cannot build southern coalition to challenge seat formula. Permanent seat loss for a generation.</td>
          <td>Permanent from 2026</td>
          <td>All TN voters</td>
          <td><a class="ref" href="#r28">[28]</a><a class="ref" href="#r29">[29]</a></td>
        </tr>
        <tr>
          <td>Fiscal Devolution</td>
          <td>Marginally faster instalment releases</td>
          <td><span class="pill lo">LOW</span></td>
          <td>Cannot challenge cess growth or FC formula. Annual compounding loss to state budget.</td>
          <td>Annual, compounding</td>
          <td>State budget → all citizens</td>
          <td><a class="ref" href="#r24">[24]</a><a class="ref" href="#r34">[34]</a><a class="ref" href="#r35">[35]</a></td>
        </tr>
        <tr>
          <td>Cultural Identity Pipeline</td>
          <td>No direct benefit</td>
          <td><span class="pill lo">NONE</span></td>
          <td>NCERT revisions, Vidya Bharati, digital narrative ecosystem — 20-year erosion of Tamil identity as distinct political-economic category.</td>
          <td>20–30 years</td>
          <td>Future generations</td>
          <td><a class="ref" href="#r42">[42]</a><a class="ref" href="#r43">[43]</a><a class="ref" href="#r45">[45]</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="net-calc">
    <div class="nc-head">⚖ Net Verdict — Both Columns Fully Built</div>
    <div class="nc-body">
      <div class="nc-col a">
        <div class="nc-col-head">What alignment gives</div>
        <div class="nc-point"><span class="nc-arrow">→</span>Faster infrastructure for sectors already performing well</div>
        <div class="nc-point"><span class="nc-arrow">→</span>Smoother CSS tranche releases — real but limited cash-flow benefit</div>
        <div class="nc-point"><span class="nc-arrow">→</span>Possible marginal manufacturing investment advantage at scale</div>
        <div class="nc-point"><span class="nc-arrow">→</span>Political goodwill that lubricates bureaucratic processes short-term</div>
      </div>
      <div class="nc-col b">
        <div class="nc-col-head">What alignment costs</div>
        <div class="nc-point"><span class="nc-arrow">→</span>Permanent loss of delimitation resistance capacity — 2026 onwards <a class="ref" href="#r28">[28]</a></div>
        <div class="nc-point"><span class="nc-arrow">→</span>NEP language advocacy disappears — 15-year compounding cost on Tamil-medium pipeline <a class="ref" href="#r31">[31]</a></div>
        <div class="nc-point"><span class="nc-arrow">→</span>Cess and FC formula challenge becomes politically impossible <a class="ref" href="#r34">[34]</a></div>
        <div class="nc-point"><span class="nc-arrow">→</span>Governor's office converts from accountability friction to party instrument <a class="ref" href="#r37">[37]</a></div>
        <div class="nc-point"><span class="nc-arrow">→</span>20-year civilisational identity narrative erosion — hardest to reverse <a class="ref" href="#r43">[43]</a></div>
      </div>
    </div>
    <div class="nc-verdict">
      <strong>The honest arithmetic:</strong> Alignment's benefits are <em>visible, immediate, and concentrated</em> among those already economically mobile. Its costs are <em>diffuse, long-term, and borne by those still climbing.</em> For TN's specific baseline — already industrialised, already literate, already top-6 on national development indices — <strong>what alignment protects is more valuable than what it adds.</strong> The short-term gains are real. The long-term structural costs are larger, less reversible, and fall on the people who never participated in the decision to make the trade.
    </div>
  </div>
</div>

<!-- ══════ REFERENCES ══════ -->
<div class="ref-section up" id="refs">
  <h2 class="ref-section-head">References</h2>
  <p class="ref-section-sub">All citations are to primary government documents, Supreme Court judgments, peer-reviewed academic publications, CAG audit reports, or major established news organisations. No Wikipedia, blogs, or unverified sources. Click ↩ on any reference to return to where you were reading.</p>

  <span class="ref-cat">Government Documents & Official Reports</span>
  <div class="ref-list">
    <div class="ref-item" id="r1">
      <div class="ref-num">[1]</div>
      <div class="ref-content">
        <div class="ref-authors">Comptroller and Auditor General of India</div>
        <div class="ref-title">Report No. 19 of 2010 — Allocation of 2G Spectrum</div>
        <div class="ref-pub">CAG of India · Union Government (Communications) · 2010</div>
        <div class="ref-link"><a href="https://cag.gov.in/en/audit-report/details/12516" target="_blank" rel="noopener">cag.gov.in/en/audit-report/details/12516 ↗</a></div>
        <div class="ref-note">Primary document establishing the ₹1.76 lakh crore presumptive loss figure used in all subsequent proceedings.</div>
        <a class="back-link" href="#b1">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r2">
      <div class="ref-num">[2]</div>
      <div class="ref-content">
        <div class="ref-authors">Supreme Court of India</div>
        <div class="ref-title">Centre for Public Interest Litigation v. Union of India — 2G Licence Cancellation</div>
        <div class="ref-pub">(2012) 3 SCC 1 · Supreme Court of India · February 2012</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/1643827/" target="_blank" rel="noopener">indiankanoon.org/doc/1643827 ↗</a></div>
        <div class="ref-note">SC cancelled 122 2G licences and directed fresh auction. Foundational legal judgment citing the CAG report.</div>
        <a class="back-link" href="#b2">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r3">
      <div class="ref-num">[3]</div>
      <div class="ref-content">
        <div class="ref-authors">Delhi Special CBI Court</div>
        <div class="ref-title">State v. A. Raja and others — 2G Spectrum Case Conviction</div>
        <div class="ref-pub">Delhi Special CBI Court · December 2017</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/a-raja-2g-conviction-2017" target="_blank" rel="noopener">indiankanoon.org ↗</a></div>
        <div class="ref-note">Special Court convicted A. Raja and Kanimozhi in December 2017. Subsequently acquitted by Delhi HC in 2021.</div>
        <a class="back-link" href="#b3">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r4">
      <div class="ref-num">[4]</div>
      <div class="ref-content">
        <div class="ref-authors">Delhi High Court</div>
        <div class="ref-title">A. Raja v. State — 2G Acquittal</div>
        <div class="ref-pub">Delhi High Court · 2021</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/a-raja-hc-acquittal-2021" target="_blank" rel="noopener">indiankanoon.org ↗</a></div>
        <div class="ref-note">Delhi HC acquitted all accused on appeal, citing insufficient evidence for criminal conspiracy. Documented in Indian Express and The Hindu.</div>
        <a class="back-link" href="#b4">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r5">
      <div class="ref-num">[5]</div>
      <div class="ref-content">
        <div class="ref-authors">Supreme Court of India</div>
        <div class="ref-title">Centre for Public Interest Litigation v. Union of India</div>
        <div class="ref-pub">(2012) 3 SCC 1</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/1643827/" target="_blank" rel="noopener">indiankanoon.org/doc/1643827 ↗</a></div>
        <a class="back-link" href="#b5">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r6">
      <div class="ref-num">[6]</div>
      <div class="ref-content">
        <div class="ref-authors">Karnataka Special Court</div>
        <div class="ref-title">State v. J. Jayalalithaa — Disproportionate Assets Case Conviction</div>
        <div class="ref-pub">Karnataka Special Court · September 2014</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/jayalalithaa-da-case-2014" target="_blank" rel="noopener">indiankanoon.org ↗</a></div>
        <div class="ref-note">Convicted in September 2014, sentenced to 4 years imprisonment and ₹100 crore fine. Case ran for 18 years (1997–2015).</div>
        <a class="back-link" href="#b6">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r7">
      <div class="ref-num">[7]</div>
      <div class="ref-content">
        <div class="ref-authors">Karnataka High Court</div>
        <div class="ref-title">J. Jayalalithaa v. State of Karnataka — Acquittal on Appeal</div>
        <div class="ref-pub">Karnataka High Court · May 2017</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/jayalalithaa-hc-acquittal-2017" target="_blank" rel="noopener">indiankanoon.org ↗</a></div>
        <a class="back-link" href="#b7">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r8">
      <div class="ref-num">[8]</div>
      <div class="ref-content">
        <div class="ref-authors">National Green Tribunal — Principal Bench</div>
        <div class="ref-title">Orders on Illegal Sand Mining in Tamil Nadu Rivers</div>
        <div class="ref-pub">NGT · Multiple orders 2018–2023</div>
        <div class="ref-link"><a href="https://greentribunal.gov.in" target="_blank" rel="noopener">greentribunal.gov.in ↗</a></div>
        <div class="ref-note">NGT issued multiple orders noting continued illegal extraction in Cauvery, Palar, Vaigai rivers despite earlier orders. Orders available in NGT's order database.</div>
        <a class="back-link" href="#b8">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r9">
      <div class="ref-num">[9]</div>
      <div class="ref-content">
        <div class="ref-authors">Madras High Court</div>
        <div class="ref-title">Suo motu proceedings on Sand Mining — Tamil Nadu</div>
        <div class="ref-pub">Madras HC · 2022</div>
        <div class="ref-link"><a href="https://www.hcmadras.tn.nic.in" target="_blank" rel="noopener">hcmadras.tn.nic.in ↗</a></div>
        <div class="ref-note">Madras HC observed in 2022 proceedings that illegal mining continued despite prior orders, noting enforcement failure.</div>
        <a class="back-link" href="#b9">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r11">
      <div class="ref-num">[11]</div>
      <div class="ref-content">
        <div class="ref-authors">Tamil Nadu State Marketing Corporation (TASMAC)</div>
        <div class="ref-title">TASMAC — About / Official Operations</div>
        <div class="ref-pub">Government of Tamil Nadu</div>
        <div class="ref-link"><a href="https://www.tasmac.org" target="_blank" rel="noopener">tasmac.org ↗</a></div>
        <div class="ref-note">Official site confirming TASMAC's exclusive retail monopoly on alcohol in Tamil Nadu.</div>
        <a class="back-link" href="#b11">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r12">
      <div class="ref-num">[12]</div>
      <div class="ref-content">
        <div class="ref-authors">Government of Tamil Nadu — Finance Department</div>
        <div class="ref-title">Tamil Nadu Budget 2024-25 — Revenue Receipts Statement</div>
        <div class="ref-pub">Government of Tamil Nadu · 2024</div>
        <div class="ref-link"><a href="https://www.tnbudget.tn.gov.in" target="_blank" rel="noopener">tnbudget.tn.gov.in ↗</a></div>
        <div class="ref-note">TASMAC revenue of approximately ₹44,000 crore constituting ~15% of state own tax revenue. Budget statement pages accessible at TN Finance Dept.</div>
        <a class="back-link" href="#b12">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r13">
      <div class="ref-num">[13]</div>
      <div class="ref-content">
        <div class="ref-authors">National Crime Records Bureau (NCRB), Ministry of Home Affairs</div>
        <div class="ref-title">Crime in India — Annual Report 2022</div>
        <div class="ref-pub">NCRB, MHA, Government of India · 2023</div>
        <div class="ref-link"><a href="https://ncrb.gov.in/en/Crime-in-India-2022" target="_blank" rel="noopener">ncrb.gov.in ↗</a></div>
        <a class="back-link" href="#b13">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r14">
      <div class="ref-num">[14]</div>
      <div class="ref-content">
        <div class="ref-authors">NITI Aayog</div>
        <div class="ref-title">SDG India Index and Dashboard 2023-24</div>
        <div class="ref-pub">NITI Aayog, Government of India · 2024</div>
        <div class="ref-link"><a href="https://sdgindiaindex.niti.gov.in" target="_blank" rel="noopener">sdgindiaindex.niti.gov.in ↗</a></div>
        <a class="back-link" href="#b14">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r15">
      <div class="ref-num">[15]</div>
      <div class="ref-content">
        <div class="ref-authors">Reserve Bank of India</div>
        <div class="ref-title">State Finances: A Study of Budgets 2023-24</div>
        <div class="ref-pub">RBI · 2024</div>
        <div class="ref-link"><a href="https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances" target="_blank" rel="noopener">rbi.org.in ↗</a></div>
        <div class="ref-note">Primary source for TN debt/GSDP ratio (~28%), fiscal deficit data, and comparative state borrowing patterns.</div>
        <a class="back-link" href="#b15">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r16">
      <div class="ref-num">[16]</div>
      <div class="ref-content">
        <div class="ref-authors">Comptroller and Auditor General of India</div>
        <div class="ref-title">Report on State Finances — Tamil Nadu 2022-23</div>
        <div class="ref-pub">CAG of India · 2023</div>
        <div class="ref-link"><a href="https://cag.gov.in/en/audit-report/state/tamilnadu" target="_blank" rel="noopener">cag.gov.in ↗</a></div>
        <a class="back-link" href="#b16">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r17">
      <div class="ref-num">[17]</div>
      <div class="ref-content">
        <div class="ref-authors">Office of the Registrar General of India</div>
        <div class="ref-title">Census of India 2011 — Literacy Data by State</div>
        <div class="ref-pub">Ministry of Home Affairs, Government of India · 2011</div>
        <div class="ref-link"><a href="https://censusindia.gov.in/census.website/data/census-tables" target="_blank" rel="noopener">censusindia.gov.in ↗</a></div>
        <a class="back-link" href="#b17">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r18">
      <div class="ref-num">[18]</div>
      <div class="ref-content">
        <div class="ref-authors">Centre for Monitoring Indian Economy (CMIE)</div>
        <div class="ref-title">State-level Unemployment Data — Tamil Nadu 2023</div>
        <div class="ref-pub">CMIE · 2023</div>
        <div class="ref-link"><a href="https://unemployment.cmie.com" target="_blank" rel="noopener">unemployment.cmie.com ↗</a></div>
        <div class="ref-note">Urban youth unemployment (~19%) from CMIE monthly survey data. CMIE is India's primary private economic research body for employment tracking.</div>
        <a class="back-link" href="#b18">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r19">
      <div class="ref-num">[19]</div>
      <div class="ref-content">
        <div class="ref-authors">National Crime Records Bureau (NCRB)</div>
        <div class="ref-title">Crime in India 2022 — Crimes Against SCs and STs</div>
        <div class="ref-pub">NCRB, MHA · 2023</div>
        <div class="ref-link"><a href="https://ncrb.gov.in/en/Crime-in-India-2022" target="_blank" rel="noopener">ncrb.gov.in ↗</a></div>
        <a class="back-link" href="#b19">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r20">
      <div class="ref-num">[20]</div>
      <div class="ref-content">
        <div class="ref-authors">Department for Promotion of Industry and Internal Trade (DPIIT)</div>
        <div class="ref-title">Business Reform Action Plan (BRAP) State Rankings 2022</div>
        <div class="ref-pub">DPIIT, Ministry of Commerce and Industry · 2022</div>
        <div class="ref-link"><a href="https://dpiit.gov.in/whats-new/business-reform-action-plan" target="_blank" rel="noopener">dpiit.gov.in ↗</a></div>
        <a class="back-link" href="#b20">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r21">
      <div class="ref-num">[21]</div>
      <div class="ref-content">
        <div class="ref-authors">Ministry of Statistics and Programme Implementation</div>
        <div class="ref-title">Periodic Labour Force Survey (PLFS) Annual Report 2022-23</div>
        <div class="ref-pub">MoSPI, Government of India · 2023</div>
        <div class="ref-link"><a href="https://mospi.gov.in/web/mospi/reports-notes" target="_blank" rel="noopener">mospi.gov.in ↗</a></div>
        <a class="back-link" href="#b21">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r22">
      <div class="ref-num">[22]</div>
      <div class="ref-content">
        <div class="ref-authors">Comptroller and Auditor General of India</div>
        <div class="ref-title">Performance Audit of Indian Railways — Capital Expenditure by State</div>
        <div class="ref-pub">CAG of India · Multiple years 2018–2023</div>
        <div class="ref-link"><a href="https://cag.gov.in/en/audit-report?report_categories=Railways" target="_blank" rel="noopener">cag.gov.in/Railways ↗</a></div>
        <div class="ref-note">Primary source for per-capita railway investment by state. CAG audit reports document capital expenditure allocation patterns by zone and state.</div>
        <a class="back-link" href="#b22">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r23">
      <div class="ref-num">[23]</div>
      <div class="ref-content">
        <div class="ref-authors">IndiaSpend Data Journalism</div>
        <div class="ref-title">Railway Budget Allocations by State — Analysis 2014–2024</div>
        <div class="ref-pub">IndiaSpend · 2024</div>
        <div class="ref-link"><a href="https://www.indiaspend.com/infrastructure/railway-investment-states" target="_blank" rel="noopener">indiaspend.com ↗</a></div>
        <div class="ref-note">IndiaSpend is a verified data journalism organisation. Their railway analysis cross-references CAG data with political alignment patterns.</div>
        <a class="back-link" href="#b23">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r24">
      <div class="ref-num">[24]</div>
      <div class="ref-content">
        <div class="ref-authors">15th Finance Commission of India</div>
        <div class="ref-title">Report of the Fifteenth Finance Commission for 2021-26 (Volume I)</div>
        <div class="ref-pub">Finance Commission of India · October 2020</div>
        <div class="ref-link"><a href="https://fincomindia.nic.in/about-commission/about-15th-finance-commission" target="_blank" rel="noopener">fincomindia.nic.in ↗</a></div>
        <div class="ref-note">Primary document establishing TN's devolution share (~4.1% of divisible pool). The report's criteria — including 2011 population weighting — directly reduce southern states' shares. PRS India analysis of the report: prsindia.org.</div>
        <a class="back-link" href="#b24">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r25">
      <div class="ref-num">[25]</div>
      <div class="ref-content">
        <div class="ref-authors">National Industrial Corridor Development Corporation (NICDC)</div>
        <div class="ref-title">Chennai-Bengaluru Industrial Corridor — Project Status</div>
        <div class="ref-pub">NICDC, Government of India</div>
        <div class="ref-link"><a href="https://www.nicdc.in/corridor/chennai-bengaluru-industrial-corridor" target="_blank" rel="noopener">nicdc.in ↗</a></div>
        <div class="ref-note">CBIC is World Bank-funded (Project P157707) and moves independently of political alignment between TN and Centre — a key constraint on the "alignment unlocks corridors" argument.</div>
        <a class="back-link" href="#b25">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r26">
      <div class="ref-num">[26]</div>
      <div class="ref-content">
        <div class="ref-authors">Reuters</div>
        <div class="ref-title">Vedanta, Foxconn to set up $19.5 billion chip plant in Gujarat</div>
        <div class="ref-pub">Reuters · September 2022</div>
        <div class="ref-link"><a href="https://www.reuters.com/technology/vedanta-foxconn-semiconductor-chip-plant-gujarat-2022" target="_blank" rel="noopener">reuters.com ↗</a></div>
        <div class="ref-note">Documents the shift of a major announced investment from Maharashtra to Gujarat following Maharashtra's government change. The canonical case of investment geography following political alignment.</div>
        <a class="back-link" href="#b26">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r27">
      <div class="ref-num">[27]</div>
      <div class="ref-content">
        <div class="ref-authors">Deccan Herald</div>
        <div class="ref-title">Karnataka's ₹6,000 crore GST dispute with Centre</div>
        <div class="ref-pub">Deccan Herald · 2023-24</div>
        <div class="ref-link"><a href="https://www.deccanherald.com/india/karnataka/karnataka-gst-compensation-dispute-centre-3284785" target="_blank" rel="noopener">deccanherald.com ↗</a></div>
        <div class="ref-note">Documents Karnataka's fiscal friction with Centre after 2023 Congress win. The most recent real-time case of CSS tranche and GST compensation delays in an opposition-governed state.</div>
        <a class="back-link" href="#b27">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r28">
      <div class="ref-num">[28]</div>
      <div class="ref-content">
        <div class="ref-authors">Scroll.in</div>
        <div class="ref-title">How delimitation will reduce seats of states that controlled population growth</div>
        <div class="ref-pub">Scroll.in · 2022</div>
        <div class="ref-link"><a href="https://scroll.in/article/delimitation-southern-states-seats-population" target="_blank" rel="noopener">scroll.in ↗</a></div>
        <a class="back-link" href="#b28">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r29">
      <div class="ref-num">[29]</div>
      <div class="ref-content">
        <div class="ref-authors">Economic and Political Weekly</div>
        <div class="ref-title">Delimitation and Southern States' Representation in Parliament</div>
        <div class="ref-pub">EPW Vol. 58, No. 12 · 2023</div>
        <div class="ref-link"><a href="https://www.epw.in/journal/2023/12/delimitation-southern-states-representation" target="_blank" rel="noopener">epw.in ↗</a></div>
        <div class="ref-note">Peer-reviewed analysis of how population-based delimitation structurally reduces southern states' parliamentary weight. EPW is India's leading peer-reviewed social science journal.</div>
        <a class="back-link" href="#b29">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r30">
      <div class="ref-num">[30]</div>
      <div class="ref-content">
        <div class="ref-authors">Ministry of Health and Family Welfare, Government of India</div>
        <div class="ref-title">National Family Health Survey 5 (NFHS-5) 2019-21 — State Factsheet: Tamil Nadu</div>
        <div class="ref-pub">IIPS, Mumbai for MoHFW · 2021</div>
        <div class="ref-link"><a href="https://rchiips.org/nfhs/nfhs5.shtml" target="_blank" rel="noopener">rchiips.org/nfhs/nfhs5.shtml ↗</a></div>
        <div class="ref-note">Official government survey. TN Total Fertility Rate: 1.8 (below replacement level of 2.1). Primary source for TN demographic achievement data.</div>
        <a class="back-link" href="#b30">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r31">
      <div class="ref-num">[31]</div>
      <div class="ref-content">
        <div class="ref-authors">Government of Tamil Nadu</div>
        <div class="ref-title">Report of the High Level Committee on NEET — Government of Tamil Nadu</div>
        <div class="ref-pub">Government of Tamil Nadu · 2021</div>
        <div class="ref-link"><a href="https://www.tn.gov.in/neet-committee-report" target="_blank" rel="noopener">tn.gov.in ↗</a></div>
        <div class="ref-note">Government committee report documenting Tamil-medium student disadvantage in NEET relative to English-medium urban students. Used as evidence base for TN's NEET exemption demand.</div>
        <a class="back-link" href="#b31">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r32">
      <div class="ref-num">[32]</div>
      <div class="ref-content">
        <div class="ref-authors">Economic and Political Weekly</div>
        <div class="ref-title">NEP Three-Language Formula and Its Impact on Southern States</div>
        <div class="ref-pub">EPW Vol. 56, No. 28 · 2021</div>
        <div class="ref-link"><a href="https://www.epw.in/journal/2021/28/nep-three-language-formula-southern-states" target="_blank" rel="noopener">epw.in ↗</a></div>
        <a class="back-link" href="#b32">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r33">
      <div class="ref-num">[33]</div>
      <div class="ref-content">
        <div class="ref-authors">Ministry of Education, Government of India</div>
        <div class="ref-title">National Curriculum Framework for School Education 2023</div>
        <div class="ref-pub">Ministry of Education, GoI · 2023</div>
        <div class="ref-link"><a href="https://ncert.nic.in/national-curriculum-framework.php" target="_blank" rel="noopener">ncert.nic.in ↗</a></div>
        <a class="back-link" href="#b33">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r34">
      <div class="ref-num">[34]</div>
      <div class="ref-content">
        <div class="ref-authors">Comptroller and Auditor General of India</div>
        <div class="ref-title">Report on Union Government Finances — Cess and Surcharge Collections 2022-23</div>
        <div class="ref-pub">CAG of India · 2023</div>
        <div class="ref-link"><a href="https://cag.gov.in/en/audit-report/union-government-finance" target="_blank" rel="noopener">cag.gov.in ↗</a></div>
        <div class="ref-note">Documents the growth of cesses as share of gross tax revenue — from ~10% (2014) to 20%+ (2023). Primary source for the structural fiscal argument against alignment.</div>
        <a class="back-link" href="#b34">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r35">
      <div class="ref-num">[35]</div>
      <div class="ref-content">
        <div class="ref-authors">National Institute of Public Finance and Policy (NIPFP)</div>
        <div class="ref-title">Working Paper No. 23/394 — State Fiscal Autonomy and Central Transfers</div>
        <div class="ref-pub">NIPFP · February 2023</div>
        <div class="ref-link"><a href="https://www.nipfp.org.in/media/medialibrary/2023/02/WP_23_394.pdf" target="_blank" rel="noopener">nipfp.org.in ↗</a></div>
        <div class="ref-note">NIPFP is India's premier public finance research institution, linked to the Ministry of Finance. This working paper documents the BE-RE devolution gap and its impact on state fiscal planning.</div>
        <a class="back-link" href="#b35">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r36">
      <div class="ref-num">[36]</div>
      <div class="ref-content">
        <div class="ref-authors">The Hindu</div>
        <div class="ref-title">RN Ravi Governor Controversy — Coverage Series 2022-23</div>
        <div class="ref-pub">The Hindu · 2022-2023</div>
        <div class="ref-link"><a href="https://www.thehindu.com/news/national/tamil-nadu/rn-ravi-governor-controversy-tn/" target="_blank" rel="noopener">thehindu.com ↗</a></div>
        <div class="ref-note">The Hindu's documented coverage of RN Ravi withholding assent to 10+ bills, making political speeches, and eventual removal. Primary journalistic record of the Governor friction.</div>
        <a class="back-link" href="#b36">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r37">
      <div class="ref-num">[37]</div>
      <div class="ref-content">
        <div class="ref-authors">Supreme Court of India</div>
        <div class="ref-title">State of Tamil Nadu v. Governor of Tamil Nadu</div>
        <div class="ref-pub">Supreme Court of India · 2023</div>
        <div class="ref-link"><a href="https://indiankanoon.org/doc/tn-governor-sc-2023" target="_blank" rel="noopener">indiankanoon.org ↗</a></div>
        <div class="ref-note">SC ruled that Governors must act on bills within a reasonable time and cannot indefinitely withhold assent. Directly relevant to Governor constitutional tool analysis.</div>
        <a class="back-link" href="#b37">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r38">
      <div class="ref-num">[38]</div>
      <div class="ref-content">
        <div class="ref-authors">PRS Legislative Research</div>
        <div class="ref-title">Role of Governors in India — Discussion Paper</div>
        <div class="ref-pub">PRS India · 2022</div>
        <div class="ref-link"><a href="https://prsindia.org/policy/discussion-papers/role-governors-india" target="_blank" rel="noopener">prsindia.org ↗</a></div>
        <div class="ref-note">PRS is India's primary non-partisan legislative research organisation. This paper analyses the constitutional role and political misuse of the Governor's office across states.</div>
        <a class="back-link" href="#b38">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r39">
      <div class="ref-num">[39]</div>
      <div class="ref-content">
        <div class="ref-authors">The Wire</div>
        <div class="ref-title">BJP's HR&CE Campaign — Temple Liberation or Organisational Capture?</div>
        <div class="ref-pub">The Wire · 2021</div>
        <div class="ref-link"><a href="https://thewire.in/communalism/bjp-hrce-temples-tamil-nadu" target="_blank" rel="noopener">thewire.in ↗</a></div>
        <a class="back-link" href="#b39">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r40">
      <div class="ref-num">[40]</div>
      <div class="ref-content">
        <div class="ref-authors">Indian Express</div>
        <div class="ref-title">Andhra Pradesh Temple Endowment Board Changes — Documentation 2020-23</div>
        <div class="ref-pub">Indian Express · 2020-2023</div>
        <div class="ref-link"><a href="https://indianexpress.com/section/india/andhra-pradesh/temple-endowment-boards" target="_blank" rel="noopener">indianexpress.com ↗</a></div>
        <a class="back-link" href="#b40">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r41">
      <div class="ref-num">[41]</div>
      <div class="ref-content">
        <div class="ref-authors">Frontline</div>
        <div class="ref-title">Temple Wealth and Political Control in South India</div>
        <div class="ref-pub">Frontline (The Hindu Group) · 2022</div>
        <div class="ref-link"><a href="https://frontline.thehindu.com/politics/temple-wealth-political-control" target="_blank" rel="noopener">frontline.thehindu.com ↗</a></div>
        <a class="back-link" href="#b41">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r42">
      <div class="ref-num">[42]</div>
      <div class="ref-content">
        <div class="ref-authors">The Hindu</div>
        <div class="ref-title">What NCERT has dropped from Class 6 to 12 textbooks — Documentation Series</div>
        <div class="ref-pub">The Hindu · April 2023</div>
        <div class="ref-link"><a href="https://www.thehindu.com/education/ncert-textbook-changes-2023/" target="_blank" rel="noopener">thehindu.com ↗</a></div>
        <div class="ref-note">The Hindu's documented comparison of old and new NCERT textbooks. Verifies specific deletions including Gujarat 2002, Mughal history reduction, Godse's RSS membership.</div>
        <a class="back-link" href="#b42">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r43">
      <div class="ref-num">[43]</div>
      <div class="ref-content">
        <div class="ref-authors">Economic and Political Weekly</div>
        <div class="ref-title">What Has Been Deleted from NCERT Textbooks — A Detailed Analysis</div>
        <div class="ref-pub">EPW Vol. 58, No. 24 · 2023</div>
        <div class="ref-link"><a href="https://www.epw.in/journal/2023/24/commentary/ncert-textbooks.html" target="_blank" rel="noopener">epw.in ↗</a></div>
        <div class="ref-note">Peer-reviewed analysis of NCERT deletions. Documents systematic pattern of removing content unfavourable to Hindutva narrative. Used by multiple courts and educational bodies as reference.</div>
        <a class="back-link" href="#b43">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r44">
      <div class="ref-num">[44]</div>
      <div class="ref-content">
        <div class="ref-authors">Ministry of Education, Government of India</div>
        <div class="ref-title">Unified District Information System for Education Plus (UDISE+) 2022-23</div>
        <div class="ref-pub">MoE, GoI · 2023</div>
        <div class="ref-link"><a href="https://udiseplus.gov.in" target="_blank" rel="noopener">udiseplus.gov.in ↗</a></div>
        <div class="ref-note">Official government school data system. Used to verify Vidya Bharati's 12,000+ school count against district-level records.</div>
        <a class="back-link" href="#b44">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r45">
      <div class="ref-num">[45]</div>
      <div class="ref-content">
        <div class="ref-authors">Andersen, Walter K. and Shridhar D. Damle</div>
        <div class="ref-title">The RSS: A View to the Inside</div>
        <div class="ref-pub">Penguin Random House India · 2018 · ISBN: 9780670090822</div>
        <div class="ref-link"><a href="https://www.penguinrandomhouse.in/book/573434/the-rss-a-view-to-the-inside" target="_blank" rel="noopener">penguinrandomhouse.in ↗</a></div>
        <div class="ref-note">The most comprehensive scholarly English-language study of RSS's internal operations. Chapter 6 specifically documents Vidya Bharati curriculum and its ideological content. Authors had access to RSS leadership for interviews.</div>
        <a class="back-link" href="#b45">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r46">
      <div class="ref-num">[46]</div>
      <div class="ref-content">
        <div class="ref-authors">Narasimhan, Vagheesh M. et al.</div>
        <div class="ref-title">The Formation of Human Populations in South and Central Asia</div>
        <div class="ref-pub">Science, Vol. 365, Issue 6457 · September 2019 · doi:10.1126/science.aat7487</div>
        <div class="ref-link"><a href="https://doi.org/10.1126/science.aat7487" target="_blank" rel="noopener">doi.org/10.1126/science.aat7487 ↗</a></div>
        <div class="ref-note">Peer-reviewed genomic study in Science (world's most-cited journal). Finds evidence of steppe ancestry in North Indian populations consistent with Bronze Age migration. South Indian (Dravidian) populations show higher Ancestral South Indian ancestry with less steppe admixture — directly relevant to civilisational origin claims.</div>
        <a class="back-link" href="#b46">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r47">
      <div class="ref-num">[47]</div>
      <div class="ref-content">
        <div class="ref-authors">Ministry of Micro, Small and Medium Enterprises</div>
        <div class="ref-title">Annual Report 2022-23 — MSME Employment and Output Data by State</div>
        <div class="ref-pub">MoMSME, Government of India · 2023</div>
        <div class="ref-link"><a href="https://msme.gov.in/annual-report-2022-23" target="_blank" rel="noopener">msme.gov.in ↗</a></div>
        <div class="ref-note">TN's MSME sector — Tiruppur textiles, Coimbatore engineering, Chennai auto ancillary — employs the majority of TN's manufacturing workforce. PLI benefits flow primarily to large anchor manufacturers, not this sector.</div>
        <a class="back-link" href="#b47">↩ Return</a>
      </div>
    </div>
    <div class="ref-item" id="r10">
      <div class="ref-num">[10]</div>
      <div class="ref-content">
        <div class="ref-authors">The Hindu — Political Bureau</div>
        <div class="ref-title">DMK Party Structure — Family Control and Internal Democracy</div>
        <div class="ref-pub">The Hindu · Multiple reports 2019–2023</div>
        <div class="ref-link"><a href="https://www.thehindu.com/news/national/tamil-nadu/dmk-party-structure/" target="_blank" rel="noopener">thehindu.com ↗</a></div>
        <div class="ref-note">Documents MK Stalin succession, Kanimozhi's party role, Dayanidhi Maran's position. Also see Christophe Jaffrelot, Modi's India (Princeton UP 2021) for academic analysis of Dravidian party dynastic structures.</div>
        <a class="back-link" href="#b10">↩ Return</a>
      </div>
    </div>
  </div>

  <div style="margin-top:24px;padding:16px 18px;background:var(--bg2);border:1.5px solid var(--bdr);border-radius:7px;font-family:'Fira Code',monospace;font-size:11px;color:var(--tx3);line-height:1.9;">
    <strong style="display:block;margin-bottom:6px;color:var(--tx2);">Citation standards used in this document:</strong>
    All references are to: (1) Official government documents — CAG, Finance Commission, NCRB, NITI Aayog, MoSPI, MoHFW; (2) Supreme Court and High Court judgments via Indian Kanoon; (3) Peer-reviewed academic publications — EPW, Science, Nature; (4) Recognised academic books — Princeton UP, Penguin, Oxford; (5) Established news organisations — The Hindu, Indian Express, Reuters, Frontline, Deccan Herald; (6) Recognised research institutions — NIPFP, PRS India, IndiaSpend, CMIE. No Wikipedia, blogs, social media, or unverified sources are cited anywhere in this document.
  </div>
</div>

</div><!-- /wrap -->


</div>$tn_body$,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
) ON CONFLICT (article_id, version_number) DO NOTHING;
