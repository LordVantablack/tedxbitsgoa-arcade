import { SiteNav } from "../SiteNav";

const CABINETS = [
  {
    id: "01",
    title: "Sober Parhawk",
    hook: "Parhawk takes flight through B-Dome's portico.",
    prompts: ["Parhawk flight sprite", "Column and lantern gate language", "Flap / clear / close sound trio"],
  },
  {
    id: "02",
    title: "B-Dome Stack",
    hook: "Build the room before the speaker arrives.",
    prompts: ["Modular TEDx block texture", "BITS Goa night-stage backdrop", "Perfect-drop celebration"],
  },
  {
    id: "03",
    title: "Coco Chase",
    hook: "Stay curious. Outrun the noise.",
    prompts: ["Original seeker sprites", "Circuit-wall motif", "Idea-spark collectibles"],
  },
];

export default function GameLabPage() {
  return (
    <main className="experience game-lab">
      <SiteNav active="lab" />
      <section className="game-lab__hero">
        <p className="eyebrow">TEDxBITSGoa / GAME LAB</p>
        <h1>MAKE THE<br /><i>ARCADE OURS.</i></h1>
        <p>Use this board to align the visual language before assets are made: sharp, stage-lit, student-built, and unmistakably TEDxBITSGoa.</p>
      </section>
      <section className="game-lab__principles" aria-label="Creative direction">
        <span>TEDx RED / BLACK / WARM WHITE</span><span>PIXEL CLARITY, NOT RETRO PASTICHE</span><span>STAGE ENERGY / BITS GOA TEXTURE</span>
      </section>
      <section className="game-lab__grid" aria-label="Game asset ideation prompts">
        {CABINETS.map((cabinet) => <article key={cabinet.id} className="game-lab__card">
          <p>{cabinet.id} / ASSET DIRECTION</p><h2>{cabinet.title}</h2><blockquote>{cabinet.hook}</blockquote>
          <ul>{cabinet.prompts.map((prompt) => <li key={prompt}>□ {prompt}</li>)}</ul>
          <small>MECHANICS LOCKED · PRESENTATION OPEN</small>
        </article>)}
      </section>
    </main>
  );
}
