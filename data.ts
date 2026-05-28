import { MediaItem, LiveChannel } from './types';

export const LIMITE_FINAL_FILME: MediaItem = {
  id: 999999,
  title: "Limite Final",
  name: "Limite Final",
  overview: `
    <p class="text-neutral-200 font-medium text-base mb-3 border-l-2 border-brand pl-3">
      <strong>Limite Final</strong> é uma obra de suspense e mistério criada e dirigida por Arthur Costa em 2024, desenvolvida a partir de um trailer conceitual que se tornou um fenômeno viral nas redes sociais.
    </p>
    <p class="text-neutral-300 text-sm mb-3">
      O que começou como uma ideia experimental tomou proporções inesperadas, alcançando milhares de visualizações e conquistando o público com sua atmosfera intrigante, estética nostálgica de thriller dos anos 90 e tensão psicológica crescente. Diante desse impacto fervoroso do público, o filme tomou forma completa no curta-metragem premium que você assiste agora com exclusividade.
    </p>
    <p class="text-neutral-300 font-bold mt-4 text-brand text-xs uppercase tracking-wider mb-2">🎬 Sinopse Completa:</p>
    <p class="text-neutral-300 text-sm mb-3 leading-relaxed">
      Em 2019, André desapareceu misteriosamente sem deixar rastro algum. Cinco anos depois, o caso é abruptamente reaberto quando as irmãs Vianna acidentalmente descobrem pistas criptografadas que desafiam o tempo e as leis da lógica. Em busca de respostas, elas unem forças com as antigas amigas de colégio de André e embarcam em uma investigação sombria que revela conexões esquecidas, símbolos esotéricos e segredos de família que estavam enterrados — ou propositalmente distorcidos pelo tempo.
    </p>
    <p class="text-neutral-300 text-sm leading-relaxed">
      À medida que as memórias do passado começam a se fundir perigosamente com as ameaças físicas do presente, o grupo é arrastado para um labirinto conspiratório onde cada decisão moral e pista rastreada ditará a linha tênue entre a sobrevivência ou o colapso do seu próprio mundo.
    </p>
  `,
  backdrop_path: null,
  poster_path: null,
  backdrop_url: "https://rival-gold-86gaabewkz.edgeone.app/file_000000000418720ea2f5e6d7bf9c5fcc.png",
  poster_url: "https://rival-gold-86gaabewkz.edgeone.app/file_000000000418720ea2f5e6d7bf9c5fcc.png",
  vote_average: 10.0,
  release_date: "2024-05-27",
  genres: [{ id: 9991, name: "Mistério" }, { id: 9992, name: "Tensão" }, { id: 9993, name: "Exclusivo" }],
  runtime: 30,
  media_type: "movie",
  embed_custom_url: "https://jumpshare.com/embed/BCM15Iu2xk4LQMPL18r3",
  castHTML: `
    <p class="font-semibold text-neutral-200 text-sm">🎥 Autoria e Produção</p>
    <div class="grid grid-cols-2 gap-2 text-xs text-neutral-400 mt-1">
      <div><strong>Direção e Roteiro:</strong> Arthur Costa</div>
      <div><strong>Edição & VFX:</strong> Arthur Costa</div>
    </div>
    <p class="mt-4 font-bold text-neutral-200 text-sm border-t border-white/5 pt-3">🎬 Elenco Principal</p>
    <ul class="grid grid-cols-2 gap-y-1.5 text-xs text-neutral-400 mt-2">
      <li>• <span class="text-white">Arthur Costa</span> como André Oliver</li>
      <li>• <span class="text-white">Hugo Leal</span> como Rian Drummond</li>
      <li>• <span class="text-white">Sofhia Novaes</span> como Lívia Vianna</li>
      <li>• <span class="text-white">Amanda Gomes</span> como Maya Vianna</li>
      <li>• <span class="text-white">Ailana Mota</span> como Sara Oliveira</li>
      <li>• <span class="text-white">Sofia Sousa</span> como Bia Menezes</li>
      <li>• <span class="text-white">Ana Sol</span> como Íris Sanchez</li>
      <li>• <span class="text-white">Gabriel Cairo</span> como Pedro Alves</li>
      <li>• <span class="text-white">Ítala Soglia</span> como Vanessa Ferreira</li>
      <li>• <span class="text-white">Amanda Souza</span> como Alice Lopes</li>
    </ul>
  `
};

export const MOVIE_GENRES = [
  { id: 28, name: "💥 Ação" },
  { id: 12, name: "🗺️ Aventura" },
  { id: 16, name: "🎨 Animação" },
  { id: 35, name: "😂 Comédia" },
  { id: 18, name: "🎭 Drama" },
  { id: 878, name: "👽 Ficção Científica" },
  { id: 14, name: "🔮 Fantasia" },
  { id: 27, name: "💀 Terror" },
  { id: 9648, name: "🔍 Mistério" },
  { id: 10749, name: "❤️ Romance" }
];

export const TV_GENRES = [
  { id: 10759, name: "💥 Ação e Aventura" },
  { id: 16, name: "🎨 Animação" },
  { id: 35, name: "😂 Comédia" },
  { id: 18, name: "🎭 Drama" },
  { id: 9648, name: "🔍 Mistério" },
  { id: 10765, name: "👽 Sci-Fi & Fantasia" },
  { id: 80, name: "⚖️ Policial / Crime" },
  { id: 10768, name: "🎖️ Guerra e Política" }
];

// Rich fallback databases when TMDB connection fails or is restricted in some environments
export const BACKUP_MOVIES: MediaItem[] = [
  {
    id: 299534,
    title: "Vingadores: Ultimato",
    overview: "Após os eventos devastadores de Vingadores: Guerra Infinita, o universo está em ruínas. Com a ajuda dos aliados restantes, os Vingadores se reúnem mais uma vez para reverter as ações de Thanos e restaurar a ordem no universo.",
    backdrop_path: "/or8630A6v6U89g38gfZG9Y0N36u.jpg",
    poster_path: "/7Ry66fofmY60YCl00Zisg60v67w.jpg",
    vote_average: 8.3,
    release_date: "2019-04-24",
    genre_ids: [28, 12, 878],
    media_type: "movie"
  },
  {
    id: 19995,
    title: "Avatar",
    overview: "No exuberante mundo alienígena de Pandora vivem os Na'vi, seres que parecem primitivos, mas são altamente evoluídos. Como o ambiente do planeta é tóxico, foram criados híbridos humanóides controlados pela mente.",
    backdrop_path: "/vY79jhkSgwwY7z68LV2EArWSVee.jpg",
    poster_path: "/6mX9pXg7gWnEun68M1F18u53bS0.jpg",
    vote_average: 7.6,
    release_date: "2009-12-15",
    genre_ids: [28, 12, 14, 878],
    media_type: "movie"
  },
  {
    id: 157336,
    title: "Interestelar",
    overview: "As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie.",
    backdrop_path: "/xJHbUv9gC69b996ZzST987f6GgE.jpg",
    poster_path: "/g63ee6wSgH2asO68Ruy67U4v3gY.jpg",
    vote_average: 8.4,
    release_date: "2014-11-05",
    genre_ids: [12, 18, 878],
    media_type: "movie"
  },
  {
    id: 27205,
    title: "A Origem",
    overview: "Dom Cobb é um ladrão que invade o subconsciente das pessoas para roubar segredos de valor. Cansado de sua vida de fugitivo extraindo memórias, ele recebe uma última missão quase impossível: implantar uma ideia na mente de uma pessoa.",
    backdrop_path: "/lhCsh79fXm7pG1Uon3U8mZInM3z.jpg",
    poster_path: "/9re9g8Y5Ym87cxU96ZssnU0b7fT.jpg",
    vote_average: 8.4,
    release_date: "2010-07-14",
    genre_ids: [28, 878, 12],
    media_type: "movie"
  },
  {
    id: 120,
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    overview: "Em uma terra fantástica e cheia de perigos, um jovem hobbit recebe a monumental tarefa de destruir um poderoso anel mágico antes que este caia nas mãos do terrível Senhor do Escuro que o criou.",
    backdrop_path: "/8BP9797gv9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/jYmP88f9VAt8SszYgZssX8Yv7pG.jpg",
    vote_average: 8.4,
    release_date: "2001-12-18",
    genre_ids: [12, 14, 28],
    media_type: "movie"
  },
  {
    id: 438631,
    title: "Duna",
    overview: "Paul Atreides é um jovem brilhante e talentoso nascido com um grande destino. Ele deve viajar para o planeta mais perigoso do universo para garantir o futuro de sua família e seu povo enquanto forças malévolas lutam por uma especiaria preciosa.",
    backdrop_path: "/jYE96iO6m5pXgGvV3mXgZsmO7G.jpg",
    poster_path: "/jF04QZf9vXmZtO7G8xV6yN8Uo6e.jpg",
    vote_average: 7.8,
    release_date: "2021-09-15",
    genre_ids: [28, 12, 878],
    media_type: "movie"
  },
  {
    id: 502356,
    title: "Super Mario Bros. O Filme",
    overview: "Os encanadores Mario e Luigi acabam caindo no Reino dos Cogumelos e encontram vilões perigosos liderados por Bowser. Mario precisa aprender a utilizar power-ups lendários para resgatar seu irmão e salvar o reino.",
    backdrop_path: "/9n2tJBPLsrDKzbS6H86g6X86gD.jpg",
    poster_path: "/9R9uEUNs9M3ssN96gY8M3R3W6U.jpg",
    vote_average: 7.7,
    release_date: "2023-04-05",
    genre_ids: [16, 12, 14, 35],
    media_type: "movie"
  },
  {
    id: 634649,
    title: "Homem-Aranha: Sem Volta Para Casa",
    overview: "Com a identidade do Homem-Aranha revelada, Peter pede ajuda ao Doutor Estranho. Quando o feitiço dá errado, os inimigos mais perigosos de todos os mundos começam a invadir a realidade atual do herói.",
    backdrop_path: "/14biI6U89g3ZS6H86gWCl00v67Z.jpg",
    poster_path: "/f4P96YVAtmF8SssYgZ6yR4Uo6N.jpg",
    vote_average: 8.0,
    release_date: "2021-12-15",
    genre_ids: [28, 12, 878],
    media_type: "movie"
  }
];

export const BACKUP_TV_SHOWS: MediaItem[] = [
  {
    id: 1396,
    name: "Breaking Bad",
    overview: "Ao descobrir um câncer terminal, um brilhante professor de química do ensino médio decide fabricar metanfetamina com um de seus antigos alunos para garantir a estabilidade financeira de sua família.",
    backdrop_path: "/96gje8Uv9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/gg63eSgH2asO68Ruy67U4v3gY.jpg",
    vote_average: 8.9,
    first_air_date: "2008-01-20",
    genre_ids: [18, 80],
    media_type: "tv"
  },
  {
    id: 119051,
    name: "Wandinha",
    overview: "Inteligente, sarcástica e um pouco fria demais, Wandinha Addams investiga uma onda de assassinatos sobrenaturais enquanto tenta sobreviver aos dilemas e amizades da prestigiada Escola Nunca Mais.",
    backdrop_path: "/6gHe8g9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/b96WAs23TgZssX8Yv7pG.jpg",
    vote_average: 8.5,
    first_air_date: "2022-11-23",
    genre_ids: [9648, 10765, 35],
    media_type: "tv"
  },
  {
    id: 85244,
    name: "The Last of Us",
    overview: "Vinte anos após uma terrível epidemia fúngica dizimar a civilização moderna, um sobrevivente calejado é contratado para contrabandear uma garota imune de 14 anos para fora de uma zona de quarentena autoritária.",
    backdrop_path: "/96A86g9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/fG63eeSgH2asO68Ruy67U4v3gY.jpg",
    vote_average: 8.7,
    first_air_date: "2023-01-15",
    genre_ids: [18, 10759, 10765],
    media_type: "tv"
  },
  {
    id: 60574,
    name: "Peaky Blinders",
    overview: "Uma gangue criminosa com base em Birmingham, Inglaterra, em 1919, é liderada pelo implacável Thomas Shelby, comandando redes de apostas ilegais, extorsão e contrabando com ambições industriais.",
    backdrop_path: "/4A86g9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/gAS63eeSgH2asO68Ruy67U4v3gY.jpg",
    vote_average: 8.6,
    first_air_date: "2013-09-12",
    genre_ids: [18, 80],
    media_type: "tv"
  },
  {
    id: 66732,
    name: "Stranger Things",
    overview: "Quando um garoto desaparece repentinamente em uma pequena cidade de Indiana, seus amigos enfrentam mistérios governamentais conspiratórios, experimentos letais e um portal sombrio para outra realidade.",
    backdrop_path: "/9n2Y797gv9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/bF04QZf9vXmZtO7G8xV6yN8Uo6e.jpg",
    vote_average: 8.6,
    first_air_date: "2016-07-15",
    genre_ids: [9648, 10765, 18],
    media_type: "tv"
  },
  {
    id: 31917,
    name: "Pretty Little Liars",
    overview: "Um ano após o misterioso desaparecimento de Alison, a abelha rainha da escola, quatro de suas antigas amigas começam a receber mensagens assinadas apenas por 'A', ameaçando revelar todos os seus podres.",
    backdrop_path: "/7bHe8g9pzs9Z7gVv9wM7Uo7O.jpg",
    poster_path: "/9R9uEUNs9M3ssN96gY8M3R3W6U.jpg",
    vote_average: 8.0,
    first_air_date: "2010-06-08",
    genre_ids: [18, 9648],
    media_type: "tv"
  }
];

// REAL-WORLD WORKING HIGH DEF STREAMS & PORTUGUESE LIVE TV CHANNELS (YouTube embeddings & custom live streams)
export const IPTV_CHANNELS: LiveChannel[] = [
  // ESPORTES
  {
    id: "espn",
    name: "ESPN Brasil (Live Match Coverage)",
    category: "Esportes",
    logo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80",
    canal: "espn",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PL_8WbXl86XIdc7lI6Yf-C7m6tizA4eJ4K" // ESPN official sport clips
  },
  {
    id: "cazetv",
    name: "CazéTV (Transmissão Oficial)",
    category: "Esportes",
    logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=150&q=80",
    canal: "cazetv",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLfT3_wA6W68DqXmKpxW1dUnp8uP4D2XjA" // CazéTV latest streams / lives list
  },
  {
    id: "sportv",
    name: "SporTV",
    category: "Esportes",
    logo: "https://images.unsplash.com/photo-1540747737956-378724044453?auto=format&fit=crop&w=150&q=80",
    canal: "sportv",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLZpYyT8h4vR_S222q-R-s7-0W8l_mIsbO" // SporTV videos
  },
  {
    id: "bandsports",
    name: "Band Sports",
    category: "Esportes",
    logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=150&q=80",
    canal: "bandsports",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PL6n9p0o_yU35YhA3s8B3u6jC2q8I0Fj2V"
  },
  {
    id: "combate",
    name: "Canal Combate (UFC Premium)",
    category: "Esportes",
    logo: "https://images.unsplash.com/photo-1517438476312-10d79c0927e0?auto=format&fit=crop&w=150&q=80",
    canal: "combate",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLZpYyT8h4vR9M3OAt1sS6d6-6yvWzKk3i"
  },

  // CANAIS ABERTOS
  {
    id: "sbt_news",
    name: "SBT News (Ao Vivo)",
    category: "Canais Abertos",
    logo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=150&q=80",
    canal: "sbtnews",
    streamUrl: "https://www.youtube.com/embed/livesearch?src=yt&q=sbt+news+ao+vivo" // Fallback query or dynamic embed
  },
  {
    id: "record_news",
    name: "Record News HD (Ao Vivo 24/7)",
    category: "Canais Abertos",
    logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=150&q=80",
    canal: "recordnews",
    streamUrl: "https://www.youtube.com/embed/6i2mFf18fWw" // Stable Record News YT player ID
  },
  {
    id: "band_ao_vivo",
    name: "Band Jornalismo (Live)",
    category: "Canais Abertos",
    logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=150&q=80",
    canal: "bandjv",
    streamUrl: "https://www.youtube.com/embed/livesearch?src=yt&q=band+jornalismo+ao+vivo"
  },

  // NOTÍCIAS
  {
    id: "cnn_brasil",
    name: "CNN Brasil (Ao Vivo)",
    category: "Notícias",
    logo: "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=150&q=80",
    canal: "cnnbrasil",
    streamUrl: "https://www.youtube.com/embed/livesearch?src=yt&q=cnn+brasil+ao+vivo+jornal"
  },
  {
    id: "jovempan",
    name: "Jovem Pan News Ao Vivo",
    category: "Notícias",
    logo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=150&q=80",
    canal: "jovempan",
    streamUrl: "https://www.youtube.com/embed/livesearch?src=yt&q=jovem+pan+news+ao+vivo"
  },

  // FILMES E SÉRIES CANAIS
  {
    id: "hbo_tv",
    name: "HBO Signature (Premium Film List)",
    category: "Filmes e Séries",
    logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&q=80",
    canal: "hbo",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PL_8WbXl86XIdgL0M4E9N-Ufep7UWeR6vJ" // HBO promotional movies
  },
  {
    id: "telecine_premium",
    name: "Telecine Premium (Trailers & Cinema)",
    category: "Filmes e Séries",
    logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80",
    canal: "telecine",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLbHeU8A3A8L4C8L5-F4N6f_TjU6qI06f6"
  },
  {
    id: "studiouniversal",
    name: "Studio Universal (Movie Nights)",
    category: "Filmes e Séries",
    logo: "https://images.unsplash.com/photo-1478720568477-15109b3f3289?auto=format&fit=crop&w=150&q=80",
    canal: "studiouniversal",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLfT3_wA6W68CDhZpWehFf19W-Z4l8OWeK"
  },

  // REALITY SHOW
  {
    id: "bbb_camara_1",
    name: "Casa do Patrão 24h (Cam 1)",
    category: "Reality Show",
    logo: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=150&q=80",
    canal: "bbb1",
    streamUrl: "https://www.youtube.com/embed/livesearch?src=yt&q=reality+show+ao+vivo"
  },
  {
    id: "bbb_camara_2",
    name: "Casa do Patrão 24h (Cam 2)",
    category: "Reality Show",
    logo: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=150&q=80",
    canal: "bbb2",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLfT3_wA6W68CDhZpWehFf19W-Z4l8OWeK"
  },

  // INFANTIL
  {
    id: "cartoon",
    name: "Cartoon Network Play (Kids)",
    category: "Infantil",
    logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80",
    canal: "cartoon",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLfT3_wA6W68AFg6XfC0YI7p4U3MAn1P0o" // Cartoon clips
  },
  {
    id: "disney_kids",
    name: "Disney Kids Ao Vivo",
    category: "Infantil",
    logo: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=150&q=80",
    canal: "disneyplus",
    streamUrl: "https://www.youtube.com/embed/videoseries?list=PLfT3_wA6W68D7uH8LhS-M_tMUnK0x14tU" // Disney junior songs
  }
];
