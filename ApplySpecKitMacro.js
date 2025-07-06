// === APPLY SPECIALIZATION KIT & BESTIARY LEVEL MACRO ===
// Author: Neo Shain (with lots of help from ChatGPT and CoPilot) | For Halo Mythic Foundry campaign

(async () => {
  // ── 0) Require a token selection
  if (!canvas.tokens.controlled.length) {
    return ui.notifications.warn("Please select at least one token.");
  }

  // ── 1) Pick your kit
  const specKits = [
    "Heavy Weapons","Vehicle Expert","Marksman","Close Quarters",
    "Battlefield Medic","Demolitions","Technician/Comms",
    "Point Man","Recon/Infiltration","Resource/Support",
    "Duelist","Command","Logistics","Medical Physician"
  ];
  const selectedSpec = await new Promise(resolve => {
    new Dialog({
      title: "Select Specialization Kit",
      content: "<p>Select which Specialization Kit to apply:</p>",
      buttons: specKits.reduce((o, kit) => {
        o[kit] = { label: kit, callback: () => { resolve(kit); return true; }};
        return o;
      }, {}),
      default: specKits[0]
    }).render(true);
  });

  // ── 2) Pick your Bestiary Level
  const levels = ["Easy","Normal","Heroic","Legendary"];
  const bestiaryLevel = await new Promise(resolve => {
    new Dialog({
      title: "Select Bestiary Level",
      content: "<p>Select Bestiary Level to apply:</p>",
      buttons: levels.reduce((o, lvl) => {
        o[lvl] = { label: lvl, callback: () => { resolve(lvl); return true; }};
        return o;
      }, {}),
      default: "Normal"
    }).render(true);
  });

  // ── 3) Prompt any follow-ups for variants
  let pilotVariant, navVariant, techVariant, medVariant;
  // a) Pilot / Nav / Tech for Vehicle Expert
  if (selectedSpec === "Vehicle Expert") {
    pilotVariant = await new Promise(resolve => {
      new Dialog({
        title: "Vehicle Expert → Pilot Type",
        content: "<p>Which Pilot skill?</p>",
        buttons: {
          air:    { label: "Pilot (Air)",    callback: () => { resolve("Air");    return true; } },
          ground: { label: "Pilot (Ground)", callback: () => { resolve("Ground"); return true; } }
        },
        default: "air"
      }).render(true);
    });
    navVariant = await new Promise(resolve => {
      new Dialog({
        title: "Vehicle Expert → Navigation Type",
        content: "<p>Which Navigation skill?</p>",
        buttons: {
          ga:    { label: "Navigation (Ground/Air)", callback: () => { resolve("Ground/Air"); return true; } },
          space: { label: "Navigation (Space)",       callback: () => { resolve("Space");      return true; } }
        },
        default: "ga"
      }).render(true);
    });
    techVariant = await new Promise(resolve => {
      new Dialog({
        title: "Vehicle Expert → Tech Type",
        content: "<p>Which Tech skill?</p>",
        buttons: {
          human:      { label: "Tech (Human)",      callback: () => { resolve("Human");      return true; } },
          covenant:   { label: "Tech (Covenant)",   callback: () => { resolve("Covenant");   return true; } },
          forerunner: { label: "Tech (Forerunner)", callback: () => { resolve("Forerunner"); return true; } }
        },
        default: "human"
      }).render(true);
    });
  }
  // b) Navigation for Marksman, Recon/Infiltration & Resource/Support
  else if (["Marksman","Recon/Infiltration","Resource/Support"].includes(selectedSpec)) {
    navVariant = await new Promise(resolve => {
      new Dialog({
        title: `${selectedSpec} → Navigation Type`,
        content: "<p>Which Navigation skill?</p>",
        buttons: {
          ga:    { label: "Navigation (Ground/Air)", callback: () => { resolve("Ground/Air"); return true; } },
          space: { label: "Navigation (Space)",       callback: () => { resolve("Space");      return true; } }
        },
        default: "ga"
      }).render(true);
    });
  }
  // c) Tech for any kit with “Technology”
  if ([
    "Vehicle Expert","Battlefield Medic",
    "Technician/Comms","Resource/Support",
    "Logistics","Medical Physician"
  ].includes(selectedSpec)) {
    techVariant = await new Promise(resolve => {
      new Dialog({
        title: `${selectedSpec} → Tech Type`,
        content: "<p>Which Tech skill?</p>",
        buttons: {
          human:      { label: "Tech (Human)",      callback: () => { resolve("Human");      return true; } },
          covenant:   { label: "Tech (Covenant)",   callback: () => { resolve("Covenant");   return true; } },
          forerunner: { label: "Tech (Forerunner)", callback: () => { resolve("Forerunner"); return true; } }
        },
        default: "human"
      }).render(true);
    });
  }
  // d) Med for Battlefield Medic & Medical Physician
  if (["Battlefield Medic","Medical Physician"].includes(selectedSpec)) {
    medVariant = await new Promise(resolve => {
      new Dialog({
        title: `${selectedSpec} → Medic Type`,
        content: "<p>Which Medic skill?</p>",
        buttons: {
          human:      { label: "Medic (Human)",       callback: () => { resolve("Human");      return true; } },
          covenant:   { label: "Medic (Covenant)",    callback: () => { resolve("Covenant");   return true; } },
          xenophile:  { label: "Medic (Xenophile)",   callback: () => { resolve("Xenophile"); return true; } }
        },
        default: "human"
      }).render(true);
    });
  }
  // e) Manual prompts for language & education
  let manualLanguage, manualEducation;
  if (selectedSpec === "Technician/Comms") {
    manualLanguage = await new Promise(resolve => {
      new Dialog({
        title: "Technician/Comms → Manual Step",
        content: "<p>Please manually choose and train <strong>One Enemy Language</strong> on the sheet.</p>",
        buttons: { ok: { label: "OK", callback: () => resolve(true) }},
        default: "ok"
      }).render(true);
    });
  }
  if (["Resource/Support","Logistics"].includes(selectedSpec)) {
    manualEducation = await new Promise(resolve => {
      new Dialog({
        title: `${selectedSpec} → Manual Step`,
        content: "<p>Please manually apply <strong>Chosen Education +5</strong> on the sheet.</p>",
        buttons: { ok: { label: "OK", callback: () => resolve(true) }},
        default: "ok"
      }).render(true);
    });
  }

  // ── 4) Your Specialization Data
  //    Replace or tweak these arrays if you want to adjust names/items
  const specializationData = { // the name field is the UUID, not the name, this is important! 
    "Heavy Weapons": {
      "Normal": [
        {type:"item", uuid: "Compendium.mythic.abilities.Item.bhhFkPEsIKRckffP"}, // Heavy Preparation
        {type:"item", uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"item", uuid: "Compendium.mythic.abilities.Item.XssXb6JETXmsJjfP"}, // Always Ready
        {type:"skill",skill:"Survival",    mod:0},
        {type:"skill",skill:"Athletics",   mod:0},
        {type:"skill",skill:"Intimidation",mod:0}
      ],
      "Heroic": [
        {type:"item",uuid: "Compendium.mythic.abilities.Item.CAyM3Vmh45DelGeV"}, // Quick Draw
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"item",uuid: "Compendium.mythic.abilities.Item.2VNR2iaZ8GrXZ5Sx"}, // Mind Timer
        {type:"skill",skill:"Evasion",      mod:0},
        {type:"skill",skill:"Athletics",    mod:10},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.uRR1tPqaF5NTlvmG"}, // Rapid Reload
        {type:"item",uuid: "Compendium.mythic.abilities.Item.XomjHBejCSh4W6HT"}, // Strong Back
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"skill",skill:"Evasion",      mod:10},
        {type:"skill",skill:"Survival",     mod:10},
        {type:"skill",skill:"Intimidation", mod:10}
      ]
    },
    "Vehicle Expert": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"}, // Eagle Eye
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"skill",skill:"Technology",mod:0},
        {type:"skill",skill:"Pilot",     mod:0},  // variant applied below
        {type:"skill",skill:"Navigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.GdTEqA4PykWSIXfI"}, // Manslaughter
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"item",uuid: "Compendium.mythic.abilities.Item.AsxSg8aDc8KDuaf7"}, // Aviator
        {type:"skill",skill:"Pilot",     mod:10},
        {type:"skill",skill:"Navigation",mod:10},
        {type:"skill",skill:"Stunting",  mod:0}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.WVbJDJZSIgC1uRa2"}, // Air Time
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0pUz3WIhib9q7QPy"}, // Resilient
        {type:"item",uuid: "Compendium.mythic.abilities.Item.QeSIq7XoazHnKH6o"}, // Wheelman
        {type:"skill",skill:"Pilot",     mod:20},
        {type:"skill",skill:"Navigation",mod:20},
        {type:"skill",skill:"Stunting",  mod:10}
      ]
    },
    "Marksman": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.XgrCkEcVOeVYli1k"}, // Marksman
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"}, // Eagle Eye
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qdwUHz1TMAe4z5kn"}, // Clear Target
        {type:"skill",skill:"Camouflage",mod:0},
        {type:"skill",skill:"Athletics", mod:0},
        {type:"skill",skill:"Navigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"item",uuid: "Compendium.mythic.abilities.Item.uRR1tPqaF5NTlvmG"}, // Rapid Reload
        {type:"item",uuid: "Compendium.mythic.abilities.Item.ZFYVOdZX28U8adJw"}, // Snapshot
        {type:"skill",skill:"Camouflage",mod:10},
        {type:"skill",skill:"Athletics", mod:10},
        {type:"skill",skill:"Navigation",mod:10}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.3KMXf1vwMEE8zufr"}, // Triangulation
        {type:"item",uuid: "Compendium.mythic.abilities.Item.WFfHiWzmaJuB031m"}, // Focused Warrior
        {type:"item",uuid: "Compendium.mythic.abilities.Item.7MIejljHGh3FTAgd"}, // Break Shot
        {type:"skill",skill:"Evasion",     mod:0},
        {type:"skill",skill:"Camouflage",  mod:20},
        {type:"skill",skill:"Investigation",mod:0}
      ]
    },
    "Close Quarters": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Frcf7nvSMFMLFyS3"}, // Evasive Maneuvers
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JYOeQiKK2d8cBNXY"}, // Disarm
        {type:"item",uuid: "Compendium.mythic.abilities.Item.c67KQTMdpyaoALat"}, // Hand-To-Hand Basics
        {type:"skill",skill:"Survival",    mod:0},
        {type:"skill",skill:"Athletics",   mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.kV1ldrIUoanjfWdQ"}, // Shotfun
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"item",uuid: "Compendium.mythic.abilities.Item.k0nhPCUavrzUpjb9"}, // Bound Back
        {type:"skill",skill:"Athletics",   mod:10},
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Evasion",     mod:0},
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.k0nhPCUavrzUpjb9"}, // Quick Toss
        {type:"item",uuid: "Compendium.mythic.abilities.Item.crNWOOlSFKXsa6n6"}, // Disarm (Improved)
        {type:"item",uuid: "Compendium.mythic.abilities.Item.GVhZ5ujoVyIDV6rv"}, // Rush
        {type:"skill",skill:"Athletics",   mod:20},
        {type:"skill",skill:"Evasion",     mod:10},
        {type:"skill",skill:"Survival",    mod:10}
      ]
    },
    "Battlefield Medic": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.K8bPGrN0DTWujQDy"}, // Cynical
        {type:"item",uuid: "Compendium.mythic.abilities.Item.HIWb77it2BEoVOqq"}, // Stabilization
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"skill",skill:"Investigation",mod:0},
        {type:"skill",skill:"Medication",   mod:0},
        {type:"skill",skill:"Technology",   mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"item",uuid: "Compendium.mythic.abilities.Item.XssXb6JETXmsJjfP"}, // Always Ready
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qvUsoMk7EMuCHurE"}, // Medical Insight
        {type:"skill",skill:"Evasion",      mod:0},
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Medication",   mod:10}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0OOIRNcRqKw1n5HS"}, // Blur
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Krt2F1WezBNvMi9Z"}, // Medical Prowess
        {type:"skill",skill:"Evasion",      mod:20},
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Technology",   mod:10}
      ]
    },
    "Demolitions": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"}, // Eagle Eye
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"skill",skill:"Demolition",  mod:0},
        {type:"skill",skill:"Athletics",   mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.g330eWgjHS1xnFCa"}, // Aggressive Advance
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0OOIRNcRqKw1n5HS"}, // Blur
        {type:"item",uuid: "Compendium.mythic.abilities.Item.3KMXf1vwMEE8zufr"}, // Triangulation
        {type:"skill",skill:"Demolition",  mod:10},
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Camouflage",  mod:0}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.VF0hzdmqI0NUvyw8"}, // Vault
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0pUz3WIhib9q7QPy"}, // Resilient
        {type:"item",uuid: "Compendium.mythic.abilities.Item.2VNR2iaZ8GrXZ5Sx"}, // Mind Timer
        {type:"skill",skill:"Demolition",  mod:20},
        {type:"skill",skill:"Camouflage",  mod:10},
        {type:"skill",skill:"Investigation",mod:20}
      ]
    },
    "Technician/Comms": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qNwmoK9nqxfRgOaG"}, // Alien Tech
        {type:"prompt", message:"**Manual:** Choose One Enemy Language."}, // TODO: incorporate this into a prompt that will add a language item
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"skill",skill:"Command",     mod:0},
        {type:"skill",skill:"Technology",   mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.IVEx3UfnW5SzTGGP"}, // Reliable Reputation
        {type:"item",uuid: "Compendium.mythic.abilities.Item.CAyM3Vmh45DelGeV"}, // Quick Draw
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Wz6lFlw9ziPHIuWw"}, // Peer
        {type:"skill",skill:"Command",     mod:10},
        {type:"skill",skill:"Technology",   mod:10},
        {type:"skill",skill:"Evasion",      mod:0},
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"item",uuid: "Compendium.mythic.abilities.Item.2VNR2iaZ8GrXZ5Sx"}, // Mind Timer
        {type:"item",uuid: "Compendium.mythic.abilities.Item.3KMXf1vwMEE8zufr"}, // Triangulation
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Technology",   mod:20},
        {type:"skill",skill:"Evasion",      mod:10}
      ]
    },
    "Point Man": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.92Y5gNJxXwd3EBPB"}, // Fast Foot
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0pUz3WIhib9q7QPy"}, // Resilient
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"skill",skill:"Athletics",   mod:0},
        {type:"skill",skill:"Survival",    mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.vN7OBvWX0zWIlCk9"}, // Adept Marksman
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"}, // Eagle Eye
        {type:"skill",skill:"Investigation", mod:10}, // ability as skill
        {type:"skill",skill:"Athletics",   mod:10},
        {type:"skill",skill:"Survival",    mod:10},
        {type:"skill",skill:"Evasion",      mod:0},
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.WFfHiWzmaJuB031m"}, // Focused Warrior
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"item",uuid: "Compendium.mythic.abilities.Item.ZFYVOdZX28U8adJw"}, // Snapshot
        {type:"skill",skill:"Camouflage",  mod:0},
        {type:"skill",skill:"Athletics",   mod:20},
        {type:"skill",skill:"Evasion",      mod:10}
      ]
    },
    "Recon/Infiltration": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"}, // Eagle Eye
        {type:"item",uuid: "Compendium.mythic.abilities.Item.E3wwCLYxaFgcWbvh"}, // Exceptional Hearing
        {type:"item",uuid: "Compendium.mythic.abilities.Item.XssXb6JETXmsJjfP"}, // Always Ready
        {type:"skill",skill:"Camouflage",  mod:0},
        {type:"skill",skill:"Athletics",   mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qdwUHz1TMAe4z5kn"}, // Clear Target
        {type:"item",uuid: "Compendium.mythic.abilities.Item.E3wwCLYxaFgcWbvh"}, // Disarm
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"skill",skill:"Camouflage",  mod:10},
        {type:"skill",skill:"Athletics",   mod:10},
        {type:"skill",skill:"Cryptography",mod:0},
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Ecxe55FHG2dPbJWq"}, // Mobile Fire
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0pUz3WIhib9q7QPy"}, // Outstanding Olfactory
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0pUz3WIhib9q7QPy"}, // Resilient
        {type:"skill",skill:"Camouflage",  mod:20},
        {type:"skill",skill:"Athletics",   mod:20},
        {type:"skill",skill:"Navigation",  mod:0}
      ]
    },
    "Resource/Support": {
      "Normal":[
        {type:"support",mod:2}, // Support Points +2
        {type:"prompt", message:"**Manual:** Apply Chosen Education +5."}, // TODO: incorporate this into a prompt that will add an education item
        {type:"item",uuid: "Compendium.mythic.abilities.Item.CAyM3Vmh45DelGeV"}, // Quick Draw
        {type:"skill",skill:"Technology",  mod:0},
        {type:"skill",skill:"Security",    mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Yfeh2DUkDLZEpDYN"}, // One Eye Open
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Wz6lFlw9ziPHIuWw"}, // Peer
        {type:"item",uuid: "Compendium.mythic.abilities.Item.SzbYbWPcUeP7uoLl"},   // Eagle Eye
        {type:"skill",skill:"Interrogation",mod:0},
        {type:"skill",skill:"Navigation",  mod:0},
        {type:"skill",skill:"Security",    mod:10},
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.XssXb6JETXmsJjfP"}, // Always Ready
        {type:"item",uuid: "Compendium.mythic.abilities.Item.BntBrX4BALzpaJOP"}, // Inspiration
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qNwmoK9nqxfRgOaG"},  // Alien Tech
        {type:"skill",skill:"Technology",  mod:10},
        {type:"skill",skill:"Cryptography",  mod:0},
        {type:"skill",skill:"Appeal",  mod:0}
      ]
    },
    "Duelist": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.VPu3FMZlHurMqMsR"}, // Akimbo
        {type:"item",uuid: "Compendium.mythic.abilities.Item.HTCXq6GoHltcSKoC"}, // Denial
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"skill",skill:"Evasion",     mod:0},
        {type:"skill",skill:"Survival",    mod:0},
        {type:"skill",skill:"Athletics",   mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.CAyM3Vmh45DelGeV"}, // Quick Draw
        {type:"item",uuid: "Compendium.mythic.abilities.Item.GVhZ5ujoVyIDV6rv"}, // Rush
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qdwUHz1TMAe4z5kn"}, // Clear Target
        {type:"skill",skill:"Evasion",     mod:10},
        {type:"skill",skill:"Athletics",   mod:10},
        {type:"skill",skill:"Stunting",    mod:0}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.92Y5gNJxXwd3EBPB"}, // Swift Shot
        {type:"item",uuid: "Compendium.mythic.abilities.Item.92Y5gNJxXwd3EBPB"}, // Fast Foot
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Frcf7nvSMFMLFyS3"}, // Evasive Maneuvers
        {type:"skill",skill:"Evasion",     mod:20},
        {type:"skill",skill:"Athletics",   mod:20},
        {type:"skill",skill:"Stunting",    mod:10}
      ]
    },
    "Command": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.fLU5y1uoix44oVqA"}, // Order of Things
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"item",uuid: "Compendium.mythic.abilities.Item.IVEx3UfnW5SzTGGP"}, // Reliable Reputation
        {type:"skill",skill:"Command",     mod:0},
        {type:"skill",skill:"Appeal",      mod:0},
        {type:"skill",skill:"Investigation",mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.BntBrX4BALzpaJOP"}, // Inspiration
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"skill",skill:"Command",     mod:10},
        {type:"skill",skill:"Appeal",      mod:10},
        {type:"skill",skill:"Intimidation",mod:0}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.2VNR2iaZ8GrXZ5Sx"}, // Mind Timer
        {type:"item",uuid: "Compendium.mythic.abilities.Item.4EK3EpBemumZt3qb"}, // Peer
        {type:"item",uuid: "Compendium.mythic.abilities.Item.4EK3EpBemumZt3qb"}, // Valorous
        {type:"skill",skill:"Command",     mod:20},
        {type:"skill",skill:"Intimidation",mod:10},
        {type:"skill",skill:"Investigation",mod:10}
      ]
    },
    "Logistics": {
      "Normal":[
        {type:"prompt", message:"**Manual:** Apply Chosen Education +5."}, // TODO: incorporate this into a prompt that will add an education item
        {type:"item",uuid: "Compendium.mythic.abilities.Item.E3wwCLYxaFgcWbvh"}, // Exceptional Hearing
        {type:"prompt", message:"**Manual:** One Enemy Language"}, // TODO: incorporate this into a prompt that will add a language item
        {type:"skill",skill:"Cryptography",mod:0},
        {type:"skill",skill:"Security",    mod:0},
        {type:"skill",skill:"Technology",  mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.5IndLMbdYr1QLYsg"}, // Battle Mind
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qNwmoK9nqxfRgOaG"}, // Alien Tech
        {type:"item",uuid: "Compendium.mythic.abilities.Item.3KMXf1vwMEE8zufr"}, // Triangulation
        {type:"skill",skill:"Cryptography",mod:10},
        {type:"skill",skill:"Security",    mod:10},
        {type:"skill",skill:"Technology",  mod:10}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.VF0hzdmqI0NUvyw8"}, // Vault
        {type:"item",uuid: "Compendium.mythic.abilities.Item.QeSIq7XoazHnKH6o"},    // Wheelman
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"skill",skill:"Cryptography",mod:20},
        {type:"skill",skill:"Security",    mod:20},
        {type:"skill",skill:"Technology",  mod:20}
      ]
    },
    "Medical Physician": {
      "Normal":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.K8bPGrN0DTWujQDy"}, // Cynical
        {type:"item",uuid: "Compendium.mythic.abilities.Item.HIWb77it2BEoVOqq"}, // Stabilization
        {type:"item",uuid: "Compendium.mythic.abilities.Item.iy2n5KwgQaCu1pcr"}, // Under Control
        {type:"skill",skill:"Investigation",mod:0},
        {type:"skill",skill:"Medication",   mod:0},
        {type:"skill",skill:"Technology",   mod:0}
      ],
      "Heroic":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.0OOIRNcRqKw1n5HS"},  // Blur
        {type:"item",uuid: "Compendium.mythic.abilities.Item.JwifQnFCCkRGDBvO"}, // Gather Senses
        {type:"item",uuid: "Compendium.mythic.abilities.Item.qvUsoMk7EMuCHurE"}, // Medical Insight
        {type:"skill",skill:"Medication",   mod:10},
        {type:"skill",skill:"Investigation",mod:10},
        {type:"skill",skill:"Technology",   mod:10}
      ],
      "Legendary":[
        {type:"item",uuid: "Compendium.mythic.abilities.Item.Krt2F1WezBNvMi9Z"}, // Medical Prowess
        {type:"item",uuid: "Compendium.mythic.abilities.Item.bjnFpmiVJe1WbDt4"}, // Field Medic -- I know this isn't what the book says, but the Medical Physician has "Stabilization" twice in the book, so I added Field Medic here as a choice.
        {type:"item",uuid: "Compendium.mythic.abilities.Item.l4fgPRwp4b8gNynd"}, // Second Chance
        {type:"skill",skill:"Medication",   mod:20},
        {type:"skill",skill:"Technology",   mod:20},
        {type:"skill",skill:"Evasion",      mod:0}
      ]
    }
  };

  // ── 5) Build cumulative tiers (Easy → none)
  const cumulative = [];
  if (bestiaryLevel !== "Easy")          cumulative.push("Normal");
  if (["Heroic","Legendary"].includes(bestiaryLevel)) cumulative.push("Heroic");
  if (bestiaryLevel === "Legendary")     cumulative.push("Legendary");
  const levelsToApply = [...new Set(cumulative)];

  // ── 6) Map display names → system.skills keys
  const skillKeyMap = {
    // Core
    "Appeal":             "appeal",
    "Athletics":          "athletics",
    "Camouflage":         "camouflage",
    "Command":            "command",
    "Cryptography":       "cryptography",
    "Deception":          "deception",
    "Demolition":         "demolition",
    "Evasion":            "evasion",
    "Gambling":           "gambling",
    "Interrogation":      "interrogation",
    "Intimidation":       "intimidation",
    "Investigation":      "investigation",
    "Negotiation":        "negotiation",
    "Security":           "security",
    "Stunting":           "stunting",
    "Survival":           "survival",
    // Pilot
    "Pilot (Air)":        "pilotAir",
    "Pilot (Ground)":     "pilotGround",
    "Pilot (Space)":      "pilotSpace",
    // Navigation
    "Navigation (Ground/Air)": "navGroundAir",
    "Navigation (Space)": "navSpace",
    // Tech
    "Tech (Human)":       "techHuman",
    "Tech (Covenant)":    "techCovenant",
    "Tech (Forerunner)":  "techForerunner",
    // Medic
    "Medic (Human)":      "medHuman",
    "Medic (Covenant)":   "medCovenant",
    "Medic (Xenophile)":  "medXenophile"
  };

  // ── 7) Apply to each selected token
  for (let token of canvas.tokens.controlled) {
    const actor = token.actor;

// ── A) Remove any existing Spec-Kit abilities & reset those skill trainings ──
// (1) Build a list of all the kit-provided item names
const kitItemNames = Object.values(specializationData)
  .flatMap(kit => Object.values(kit)
    .flatMap(entries => entries
      .filter(e => e.type === "item")
      .map(e => e.name)
    )
  );

// (2) Delete any matching items on the actor
const toDelete = actor.items.filter(i => kitItemNames.includes(i.name));
if ( toDelete.length ) {
  await actor.deleteEmbeddedDocuments("Item", toDelete.map(i => i.id));
}

// (3) Reset all Spec-Kit skills back to “none”
const resetData = {};
for ( let key of Object.values(skillKeyMap) ) {
  if ( actor.system.skills?.[key] ) {
    resetData[`system.skills.${key}.training.tier`] = "none";
  }
}
if ( Object.keys(resetData).length ) {
  await actor.update(resetData);
}
    
// B) Set the Bestiary‐Level → difficulty.tier and then top‐off Wounds ──
// Map your levels to numeric tiers
const tierMap = { Easy: 0, Normal: 1, Heroic: 2, Legendary: 3 };
await actor.update({
  "system.difficulty.tier": tierMap[bestiaryLevel].toString()
});

// Now max out Wounds.
const maxW = actor.system.wounds.max;   
await actor.update({ "system.wounds.value": maxW });

    // B) update the sheet’s specialization field
    await actor.update({ "system.specialization": selectedSpec });
    ui.notifications.info(`Set specialization → ${selectedSpec}`);





    // C) for each tier, loop entries
    for (let lvl of levelsToApply) {
      const entries = specializationData[selectedSpec]?.[lvl] || [];
      for (let entry of entries) {

        // — Items/Abilities
        if (entry.type === "item") {
          // Pull directly from the compendium by UUID
          const compendiumItem = await fromUuid(entry.uuid);
          if (!compendiumItem) {
            return ui.notifications.warn(`Could not find compendium entry ${entry.uuid}`);
          }
          // Create a copy of it on the actor
          await actor.createEmbeddedDocuments("Item", [ compendiumItem.toObject() ]);
          //ui.notifications.info(`Added item '${entry.name}' to ${actor.name}.`);
        }

        // — Skill trainings
        else if (entry.type === "skill") {
          // build displayName (apply any variant)
          let displayName = entry.skill;
          if (entry.skill === "Pilot"     && pilotVariant) displayName = `Pilot (${pilotVariant})`;
          if (entry.skill === "Navigation"&& navVariant)   displayName = `Navigation (${navVariant})`;
          if (entry.skill === "Technology"&& techVariant)  displayName = `Tech (${techVariant})`;
          if (entry.skill === "Medication"&& medVariant)   displayName = `Medic (${medVariant})`;

          // find the precise key
          const skillKey = skillKeyMap[displayName]
                         || displayName.toLowerCase().replace(/[^a-z0-9]/g,"");
          if (!actor.system.skills?.[skillKey]) {
            ui.notifications.warn(`Skill '${displayName}' not found on ${actor.name}.`);
            console.warn(`Missing skillKey '${skillKey}' for '${displayName}'`, Object.keys(actor.system.skills));
            continue;
          }

          // decide tier
          let newTier = "trained";
          if (entry.mod === 10)    newTier = "plus10";
          else if (entry.mod === 20) newTier = "plus20";

          // apply to training.tier
          await actor.update({ [`system.skills.${skillKey}.training.tier`]: newTier });
          //ui.notifications.info(`Set ${displayName} → ${newTier} on ${actor.name}.`);
        }

        // — Support points
        else if (entry.type === "support") {
          const current = actor.system.supportPoints?.other || 0;
          await actor.update({ "system.supportPoints.other": current + entry.mod });
          //ui.notifications.info(`Added ${entry.mod} support points to ${actor.name}.`);
        }

        // — Manual prompts
        else if (entry.type === "prompt") {
          await new Promise(res => {
            new Dialog({
              title: "Manual Step Required",
              content: `<p>${entry.message}</p>`,
              buttons: { ok: { label: "OK", callback: () => res(true) }},
              default: "ok"
            }).render(true);
          });
        }
      }
    }
  }

})();
