Sei un ingegnere del software esperto in ottimizzazione di contesti per LLM locali. 
Voglio che generi due file fondamentali per dare contesto a te stesso (o ad altri LLM) su questa codebase, riducendo al minimo lo spreco di token.

Genera il codice per questi due file:
1. `RULES.md`: Un file di regole globali. Deve impostare lo stack su React, Vite, TypeScript e istruirti a usare componenti funzionali e tipizzazione rigorosa. Includi linee guida per una UI moderna, minimale, con uso di glassmorphism (glass opaco) e accenti blu elettrico/viola. Ordina all'LLM di non fare spiegazioni logorroiche e mostrare solo il codice modificato.

2. `generate_map.py`: Uno script Python puro (senza dipendenze esterne) da lanciare nella root del progetto. Lo script deve scansionare la cartella `src/`, ignorando i file non rilevanti, e stampare un albero strutturale in formato Markdown dei componenti e dei tipi presenti.

Fornisci direttamente il codice pronto da salvare per entrambi i file.


Una volta che Qwen ti ha generato il codice dello script Python, salvalo come generate_map.py

uv run generate_map.py > PROJECT_MAP.md



-------------------------------------------------------------------------------------------------



"Analizza @01-RULES.md e @02-PROJECT_MAP.md.

Crea un file ARCHITECTURE.md che descriva la logica di alto livello dell'applicazione.

Spiega come i dati fluiscono dai servizi (Firebase) ai componenti UI.

Genera un blocco di codice mermaid (usando graph TD o flowchart TD) che rappresenti la struttura dei componenti e le dipendenze principali.

Il grafo deve mostrare chiaramente la gerarchia: App -> Layout -> Componenti UI -> Servizi/Hooks.

Il risultato deve essere un file Markdown pronto per essere salvato in .continue/rules/03-architecture.md."