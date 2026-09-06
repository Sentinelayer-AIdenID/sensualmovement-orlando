/*
  Sensual Movement — Orlando 11th Anniversary · front door
  data.js — every fact, every string, every chat answer. One file.

  SOURCE OF TRUTH RULES (from the build brief):
  - Only facts published on Sensual Movement's own pages.
  - Artist names only as they appear on the 11th-anniversary page.
  - Prices never shown. "See prices" goes to the live checkout.
  - Nothing invented: no attendance figures, no review quotes, no "40+ workshops".

  Sources, verified 2026-09-05:
  - https://sensualmovementusa.com/sensual-movement-11th-anniversary/
  - https://www.tickettailor.com/events/smdancecompany/2068265
*/

window.SM = (() => {
  /* ---------------------------------------------------------------- */
  /* Facts — language-neutral                                          */
  /* ---------------------------------------------------------------- */
  const FACTS = {
    // The checkout lists Thu Feb 11, 2027 9:30 PM as the opening. The brief said
    // 8:00 PM; the published figure wins until Carter says otherwise. Eastern
    // Standard Time in February = UTC-5.
    kickoffISO: "2027-02-12T02:30:00Z",
    kickoffLocal: "9:30 PM ET",
    dates: { start: "2027-02-11", end: "2027-02-15" },
    venue: {
      name: "Hyatt Regency Orlando",
      street: "9801 International Dr",
      city: "Orlando, FL 32819",
      roomBlock: "https://www.hyatt.com/events/en-US/group-booking/MCORO/G-SMD1",
      maps: "https://www.google.com/maps/search/?api=1&query=Hyatt+Regency+Orlando+9801+International+Dr+Orlando+FL+32819",
    },
    checkout: "https://www.tickettailor.com/events/smdancecompany/2068265",
    eventPage: "https://sensualmovementusa.com/sensual-movement-11th-anniversary/",
    // Their own checkout copy: "Socials going until 9AM."
    socialsUntil: "9 AM",
    handles: {
      instagram: { label: "@sensual_movement", url: "https://www.instagram.com/sensual_movement/" },
      tiktok: { label: "@sensual_movement", url: "https://www.tiktok.com/@sensual_movement" },
      youtube: { label: "@sensualmovement", url: "https://www.youtube.com/@sensualmovement" },
      facebook: { label: "facebook.com/newyorkbachata", url: "https://www.facebook.com/newyorkbachata" },
      igChat: { label: "Instagram chat", url: "https://ig.me/j/AbagxA1AKzkmgW-h/" },
    },
  };

  /*
    ARTISTS — two of Sensual Movement's own sources disagree.
    The 11th-anniversary web page lists one set; the TicketTailor checkout
    lists another; only Marco & Sara and Ros & Klau appear on both. The brief
    names the web page as the source, so `ARTIST_SOURCE = "page"`. Flip it to
    "checkout" if Carter confirms the checkout is the current list. Either way
    the copy says "and more to be announced", which both sources also say.
  */
  const ARTIST_SOURCE = "page";
  const ARTISTS = {
    page: ["Daniel & Desiree", "Marco & Sara", "Gero & Migle", "Miguel & Sunsiree", "Ros & Klau"],
    checkout: [
      "Melvin & Gatica",
      "Cornel & Rithika",
      "Marco & Sara",
      "Ros & Klau",
      "Dmitriy & Katia",
      "Mauricio & Serena",
      "Rezi & Sia",
    ],
  };
  const artists = () => ARTISTS[ARTIST_SOURCE];

  /*
    PASSES — tier names exactly as they read on the checkout. No prices.
    `includes` is limited to what their own pages state.
  */
  const PASSES = [
    { id: "eb1", tier: "full", name: "Full Pass — Early Bird Round 1" },
    { id: "eb2", tier: "full", name: "Full Pass — Early Bird Round 2" },
    { id: "eb3", tier: "full", name: "Full Pass — Early Bird Round 3" },
    { id: "door", tier: "full", name: "Full Pass — Door Price" },
    { id: "mc-dk", tier: "master", name: "Master Class — Dmitriy & Katia", when: "Friday 4 p.m." },
    { id: "mc-mg", tier: "master", name: "Master Class — Melvin & Gatica", when: "Saturday 4 p.m." },
  ];

  /* ---------------------------------------------------------------- */
  /* Strings — EN / ES / FR / PT. Every visible string. No auto-detect.  */
  /* ---------------------------------------------------------------- */
  const I18N = {
    en: {
      lang: "English",
      title: "Sensual Movement — 11th Anniversary · Orlando, February 11–15, 2027",
      description:
        "Sensual Movement's 11th Anniversary at the Hyatt Regency Orlando, February 11–15, 2027. Esencia Takeover. US Bachata Championships. Passes at the live checkout.",
      skip: "Skip to content",
      langLabel: "Language",
      scrollCue: "Scroll",
      // 0 · load
      countdownLine: "Orlando. Eleven years.",
      cd: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
      cdUntil: "until the doors open",
      // 1 · arrive
      arrive: { kicker: "Arrive", line: "Hyatt Regency Orlando · February 11–15, 2027" },
      // 2 · learn
      learn: { kicker: "Learn", line: "Workshops all day. Every level." },
      // 3 · dance
      dance: { kicker: "Dance", line: "Socials until 9 AM." },
      // 4 · compete
      compete: { kicker: "Compete", line: "US Bachata Championships." },
      esencia: "Esencia Takeover — for the first time, the Esencia family takes over Sensual Movement.",
      // 5 · passes
      passes: {
        kicker: "Passes",
        title: "Choose your nights.",
        full: "Full Pass",
        fullIncludes: "Workshops · Socials · Championships",
        fullNote: "Thursday party not included.",
        master: "Master Class",
        masterIncludes: "Lead or Follower · Add-on",
        rounds: "Early Bird rounds, then door price.",
        see: "See prices",
        ask: "Ask about this pass",
        noRefunds: "No refunds — their words.",
      },
      // 6 · ask
      chat: {
        kicker: "Ask",
        title: "Five things people ask first.",
        sub: "Scripted answers from Sensual Movement's own pages. The full assistant answers everything, in four languages, after kickoff.",
        placeholder: "Ask something…",
        send: "Send",
        fallback: "Ask me that after kickoff.",
        open: "Open chat",
        close: "Close",
        q: {
          pass: "Which pass do I need?",
          stay: "Where do I stay?",
          transfer: "Can I transfer my pass?",
          schedule: "What's the schedule?",
          teach: "Who's teaching?",
        },
        a: {
          pass: {
            title: "The Full Pass",
            body: "Covers the festival, February 11–15: workshops, socials and the US Bachata Championships. The Thursday party is not included. Master classes are separate add-ons.",
            cta: "See prices",
          },
          stay: {
            title: "Hyatt Regency Orlando",
            body: "9801 International Dr, Orlando, FL 32819. The festival hotel, with a room block for attendees.",
            cta: "Book your room",
          },
          transfer: {
            title: "No refunds",
            body: "That's the published policy. Transfers and name changes aren't spelled out on the event page — message the team and they'll tell you.",
            cta: "Message on Instagram",
          },
          schedule: {
            title: "February 11–15, 2027",
            body: "Doors Thursday 9:30 PM. Socials until 9 AM. Master classes Friday and Saturday at 4 p.m. The full schedule is on its way.",
            cta: "Event page",
          },
          teach: {
            title: "On the lineup",
            body: "__ARTISTS__ — with Sensual Movement's own artists, and more to be announced.",
            cta: "Event page",
          },
        },
      },
      // 7 · end
      end: { line: "See you in Orlando.", cta: "See prices", hotel: "Book your room" },
      footer: { follow: "Follow", built: "Front door by PlexAura", event: "Official event page" },
    },

    es: {
      lang: "Español",
      title: "Sensual Movement — 11.º Aniversario · Orlando, 11–15 de febrero de 2027",
      description:
        "11.º Aniversario de Sensual Movement en el Hyatt Regency Orlando, del 11 al 15 de febrero de 2027. Esencia Takeover. Campeonato de Bachata de EE. UU. Pases en la taquilla oficial.",
      skip: "Ir al contenido",
      langLabel: "Idioma",
      scrollCue: "Desliza",
      countdownLine: "Orlando. Once años.",
      cd: { days: "días", hours: "horas", minutes: "minutos", seconds: "segundos" },
      cdUntil: "para que abran las puertas",
      arrive: { kicker: "Llega", line: "Hyatt Regency Orlando · 11–15 de febrero de 2027" },
      learn: { kicker: "Aprende", line: "Talleres todo el día. Todos los niveles." },
      dance: { kicker: "Baila", line: "Sociales hasta las 9 de la mañana." },
      compete: { kicker: "Compite", line: "Campeonato de Bachata de EE. UU." },
      esencia: "Esencia Takeover — por primera vez, la familia Esencia toma las riendas de Sensual Movement.",
      passes: {
        kicker: "Pases",
        title: "Elige tus noches.",
        full: "Pase Completo",
        fullIncludes: "Talleres · Sociales · Campeonato",
        fullNote: "La fiesta del jueves no está incluida.",
        master: "Master Class",
        masterIncludes: "Líder o seguidor · Extra",
        rounds: "Rondas Early Bird, luego precio de puerta.",
        see: "Ver precios",
        ask: "Preguntar por este pase",
        noRefunds: "Sin reembolsos — en sus propias palabras.",
      },
      chat: {
        kicker: "Pregunta",
        title: "Las cinco cosas que todos preguntan primero.",
        sub: "Respuestas guionadas desde las propias páginas de Sensual Movement. El asistente completo responde todo, en cuatro idiomas, tras el arranque.",
        placeholder: "Pregunta algo…",
        send: "Enviar",
        fallback: "Pregúntame eso después del arranque.",
        open: "Abrir chat",
        close: "Cerrar",
        q: {
          pass: "¿Qué pase necesito?",
          stay: "¿Dónde me quedo?",
          transfer: "¿Puedo transferir mi pase?",
          schedule: "¿Cuál es el horario?",
          teach: "¿Quién enseña?",
        },
        a: {
          pass: {
            title: "El Pase Completo",
            body: "Cubre el festival, del 11 al 15 de febrero: talleres, sociales y el Campeonato de Bachata de EE. UU. La fiesta del jueves no está incluida. Las master classes son extras aparte.",
            cta: "Ver precios",
          },
          stay: {
            title: "Hyatt Regency Orlando",
            body: "9801 International Dr, Orlando, FL 32819. El hotel del festival, con bloque de habitaciones para asistentes.",
            cta: "Reserva tu habitación",
          },
          transfer: {
            title: "Sin reembolsos",
            body: "Esa es la política publicada. Las transferencias y cambios de nombre no están detallados en la página del evento — escríbele al equipo y te lo dirán.",
            cta: "Escribir por Instagram",
          },
          schedule: {
            title: "11–15 de febrero de 2027",
            body: "Puertas el jueves a las 9:30 PM. Sociales hasta las 9 AM. Master classes viernes y sábado a las 4 p.m. El horario completo está en camino.",
            cta: "Página del evento",
          },
          teach: {
            title: "En el cartel",
            body: "__ARTISTS__ — con los propios artistas de Sensual Movement, y más por anunciar.",
            cta: "Página del evento",
          },
        },
      },
      end: { line: "Nos vemos en Orlando.", cta: "Ver precios", hotel: "Reserva tu habitación" },
      footer: { follow: "Síguenos", built: "Portada por PlexAura", event: "Página oficial del evento" },
    },

    fr: {
      lang: "Français",
      title: "Sensual Movement — 11e anniversaire · Orlando, 11–15 février 2027",
      description:
        "11e anniversaire de Sensual Movement au Hyatt Regency Orlando, du 11 au 15 février 2027. Esencia Takeover. Championnat de bachata des États-Unis. Pass à la billetterie officielle.",
      skip: "Aller au contenu",
      langLabel: "Langue",
      scrollCue: "Défiler",
      countdownLine: "Orlando. Onze ans.",
      cd: { days: "jours", hours: "heures", minutes: "minutes", seconds: "secondes" },
      cdUntil: "avant l'ouverture des portes",
      arrive: { kicker: "Arriver", line: "Hyatt Regency Orlando · 11–15 février 2027" },
      learn: { kicker: "Apprendre", line: "Des ateliers toute la journée. Tous niveaux." },
      dance: { kicker: "Danser", line: "Soirées jusqu'à 9 h du matin." },
      compete: { kicker: "Concourir", line: "Championnat de bachata des États-Unis." },
      esencia: "Esencia Takeover — pour la première fois, la famille Esencia prend les rênes de Sensual Movement.",
      passes: {
        kicker: "Pass",
        title: "Choisissez vos nuits.",
        full: "Full Pass",
        fullIncludes: "Ateliers · Soirées · Championnat",
        fullNote: "La soirée du jeudi n'est pas incluse.",
        master: "Master Class",
        masterIncludes: "Leader ou follower · En supplément",
        rounds: "Tarifs Early Bird, puis tarif sur place.",
        see: "Voir les tarifs",
        ask: "Une question sur ce pass",
        noRefunds: "Aucun remboursement — ce sont leurs mots.",
      },
      chat: {
        kicker: "Demander",
        title: "Les cinq questions qu'on pose en premier.",
        sub: "Réponses scriptées, tirées des pages de Sensual Movement. L'assistant complet répond à tout, en quatre langues, après le lancement.",
        placeholder: "Posez une question…",
        send: "Envoyer",
        fallback: "Demandez-moi ça après le lancement.",
        open: "Ouvrir le chat",
        close: "Fermer",
        q: {
          pass: "Quel pass me faut-il ?",
          stay: "Où loger ?",
          transfer: "Puis-je transférer mon pass ?",
          schedule: "Quel est le programme ?",
          teach: "Qui enseigne ?",
        },
        a: {
          pass: {
            title: "Le Full Pass",
            body: "Couvre le festival du 11 au 15 février : ateliers, soirées et le championnat de bachata des États-Unis. La soirée du jeudi n'est pas incluse. Les master classes sont des suppléments.",
            cta: "Voir les tarifs",
          },
          stay: {
            title: "Hyatt Regency Orlando",
            body: "9801 International Dr, Orlando, FL 32819. L'hôtel du festival, avec un bloc de chambres pour les participants.",
            cta: "Réserver une chambre",
          },
          transfer: {
            title: "Aucun remboursement",
            body: "C'est la politique publiée. Les transferts et changements de nom ne sont pas détaillés sur la page de l'événement — écrivez à l'équipe, ils vous répondront.",
            cta: "Écrire sur Instagram",
          },
          schedule: {
            title: "11–15 février 2027",
            body: "Ouverture jeudi à 21 h 30. Soirées jusqu'à 9 h. Master classes vendredi et samedi à 16 h. Le programme complet arrive.",
            cta: "Page de l'événement",
          },
          teach: {
            title: "À l'affiche",
            body: "__ARTISTS__ — avec les artistes de Sensual Movement, et d'autres à venir.",
            cta: "Page de l'événement",
          },
        },
      },
      end: { line: "Rendez-vous à Orlando.", cta: "Voir les tarifs", hotel: "Réserver une chambre" },
      footer: { follow: "Suivre", built: "Porte d'entrée par PlexAura", event: "Page officielle de l'événement" },
    },

    pt: {
      lang: "Português",
      title: "Sensual Movement — 11.º Aniversário · Orlando, 11–15 de fevereiro de 2027",
      description:
        "11.º Aniversário do Sensual Movement no Hyatt Regency Orlando, de 11 a 15 de fevereiro de 2027. Esencia Takeover. Campeonato de Bachata dos EUA. Passes na bilheteria oficial.",
      skip: "Ir para o conteúdo",
      langLabel: "Idioma",
      scrollCue: "Role",
      countdownLine: "Orlando. Onze anos.",
      cd: { days: "dias", hours: "horas", minutes: "minutos", seconds: "segundos" },
      cdUntil: "até as portas abrirem",
      arrive: { kicker: "Chegue", line: "Hyatt Regency Orlando · 11–15 de fevereiro de 2027" },
      learn: { kicker: "Aprenda", line: "Workshops o dia todo. Todos os níveis." },
      dance: { kicker: "Dance", line: "Sociais até as 9 da manhã." },
      compete: { kicker: "Compita", line: "Campeonato de Bachata dos EUA." },
      esencia: "Esencia Takeover — pela primeira vez, a família Esencia assume o Sensual Movement.",
      passes: {
        kicker: "Passes",
        title: "Escolha suas noites.",
        full: "Full Pass",
        fullIncludes: "Workshops · Sociais · Campeonato",
        fullNote: "A festa de quinta não está incluída.",
        master: "Master Class",
        masterIncludes: "Condutor ou conduzida · Extra",
        rounds: "Lotes Early Bird, depois preço na porta.",
        see: "Ver preços",
        ask: "Perguntar sobre este passe",
        noRefunds: "Sem reembolsos — nas palavras deles.",
      },
      chat: {
        kicker: "Pergunte",
        title: "As cinco coisas que todo mundo pergunta primeiro.",
        sub: "Respostas roteirizadas a partir das páginas do próprio Sensual Movement. O assistente completo responde tudo, em quatro idiomas, depois do kickoff.",
        placeholder: "Pergunte algo…",
        send: "Enviar",
        fallback: "Me pergunte isso depois do kickoff.",
        open: "Abrir chat",
        close: "Fechar",
        q: {
          pass: "Qual passe eu preciso?",
          stay: "Onde me hospedo?",
          transfer: "Posso transferir meu passe?",
          schedule: "Qual é a programação?",
          teach: "Quem vai dar aula?",
        },
        a: {
          pass: {
            title: "O Full Pass",
            body: "Cobre o festival, de 11 a 15 de fevereiro: workshops, sociais e o Campeonato de Bachata dos EUA. A festa de quinta não está incluída. As master classes são extras à parte.",
            cta: "Ver preços",
          },
          stay: {
            title: "Hyatt Regency Orlando",
            body: "9801 International Dr, Orlando, FL 32819. O hotel do festival, com bloco de quartos para os participantes.",
            cta: "Reserve seu quarto",
          },
          transfer: {
            title: "Sem reembolsos",
            body: "Essa é a política publicada. Transferências e trocas de nome não estão detalhadas na página do evento — mande mensagem para a equipe e eles explicam.",
            cta: "Mensagem no Instagram",
          },
          schedule: {
            title: "11–15 de fevereiro de 2027",
            body: "Portas na quinta às 21h30. Sociais até as 9h. Master classes sexta e sábado às 16h. A programação completa está a caminho.",
            cta: "Página do evento",
          },
          teach: {
            title: "No lineup",
            body: "__ARTISTS__ — com os artistas do próprio Sensual Movement, e mais por anunciar.",
            cta: "Página do evento",
          },
        },
      },
      end: { line: "Nos vemos em Orlando.", cta: "Ver preços", hotel: "Reserve seu quarto" },
      footer: { follow: "Siga", built: "Porta de entrada por PlexAura", event: "Página oficial do evento" },
    },
  };

  const LANGS = ["en", "es", "fr", "pt"];

  /* Chat CTAs resolve to real URLs; nothing here is a dead button. */
  const CTA_URL = {
    pass: FACTS.checkout,
    stay: FACTS.venue.roomBlock,
    transfer: FACTS.handles.igChat.url,
    schedule: FACTS.eventPage,
    teach: FACTS.eventPage,
  };

  return { FACTS, ARTISTS, ARTIST_SOURCE, artists, PASSES, I18N, LANGS, CTA_URL };
})();
