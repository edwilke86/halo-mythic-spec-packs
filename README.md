# Specialization Kit & Bestiary Level Macro

A drop-in macro for Foundry VTT (Pf2e/Halo Mythic Foundry) that automates:

- **Specialization Kits**: Heavy Weapons, Vehicle Expert, Marksman, Close Quarters, Battlefield Medic, Demolitions, Technician/Comms, Point Man, Recon/Infiltration, Resource/Support, Duelist, Command, Logistics, Medical Physician.  
- **B﻿estiary Levels**: Easy (no changes), Normal, Heroic, Legendary (cumulative).  
- **Variant Prompts**: e.g. Pilot (Air/Ground), Navigation (Ground-Air/Space), Technology (Human/Covenant/Forerunner), Medic type.  
- **Compendium-UUID Sourcing**: Pulls abilities directly by UUID, avoiding name-lookup issues.  
- **Clean Slate**: Strips out any existing Spec-Kit items and resets those skills to “none” before applying the new kit.  
- **Difficulty & Wounds**: Updates `system.difficulty.tier` to match the chosen level and auto-tops off current Wounds to the new max.  
- **Manual Prompts**: Reminds the GM to handle “Enemy Language” and “Chosen Education +5” where needed.  

## Installation

1. Copy the contents of `ApplySpecKitMacro.js` into a new **Macro** in your Foundry VTT world.  
2. Save and assign an icon if desired. (Custom Icon Available in Git, if you want to use it)
3. Make sure your “Specialization Abilities” compendium is installed and up to date.  

## Usage

1. Select one or more tokens on your canvas.  
2. Run the “Specialization Kit & Bestiary Level” macro.  
3. Choose your Spec-Kit and Bestiary Level from the dialogs.  
4. Answer any follow-up prompts (e.g. Pilot variant).  
5. Watch as the macro:
   - Clears any old Spec-Kit abilities/skills  
   - Sets the new kit name in `system.specialization`  
   - Adds all relevant abilities by UUID  
   - Trains/un-trains skills under `system.skills.*.training.tier`  
   - Updates `system.difficulty.tier`  
   - Tops off Wounds to `system.wounds.max`  

## Customization

- **Compendium UUIDs**: Edit the `specializationData` block to swap in your own compendium pack keys & IDs.  
- **Skill Keys**: Extend the `skillKeyMap` if you add new skills or variant names.  
- **Additional Kits**: Add or modify kits by updating the `specializationData` object arrays.  

---

Feel free to adjust any section to match your project conventions or add badges, screenshots, or usage GIFs!
