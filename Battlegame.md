You are Claude Code. Build a web app MVP for a kids game called "Crazy Fun" (temporary name). The game is a deterministic fusion creature battler.

Key requirements:
- Web app only. Target ages 7–12. Pixel-art style.
- Players pick 2 inputs: animal+animal or animal+object.
- Fusion is commutative/deterministic: Rhino+Skateboard == Skateboard+Rhino.
- All fusion outputs are pre-generated offline using AI and stored statically in a DB. No live AI calls during gameplay.
- Each fusion has:
  - name, description, pixel-art image_url
  - 2 elemental types
  - stats: HP, Attack, Defense, Speed, SpecialPower
  - exactly 2 moves (one from each input)
- Battle system:
  - 1v1 turn-based, speed determines first
  - moves always hit
  - simple type advantage multipliers (1.5 / 0.75 / 1.0)
  - typical match length 4–7 turns
- Async PvP:
  - user battles creatures created by other trainers (can be implemented as “opponent is AI-controlled but sourced from another trainer’s fusion”)
- Trainer accounts:
  - username + avatar
  - trainer XP + leveling (unlocking longer battles later; can stub unlocks)

Deliverables:
1) Propose a minimal tech stack for fast iteration (frontend + backend + DB).
2) Define DB schema (tables described above are acceptable).
3) Implement core screens:
   - Trainer creation/login (simple)
   - Fusion creator (pick 2 entities, show fusion)
   - Collection (saved fusions)
   - Arena/opponent select
   - Battle screen (turn-based state machine)
4) Implement deterministic fusion key and retrieval:
   - fusionKey = sort([idA,idB]).join("_")
   - fetch fusion from DB; if missing, show “not generated yet” (but MVP expects pre-generated)
5) Implement battle engine (server-side or shared module).
6) Provide a step-by-step dev plan and then begin implementation in small, testable steps.

Important:
- Keep code clean, modular, and easy for a parent/kids project.
- Use safe defaults and kid-friendly copy.
- No chat, no user-generated text beyond usernames.
