export function SpacecraftVisual() {
  return (
    <div className="spacecraft-stage" aria-label="Stylized spacecraft illustration">
      <div className="stage-radar"><span /><span /><span /></div>
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <div className="ship-glow" />
      <div className="spacecraft">
        <div className="ship-nose" /><div className="ship-core" /><div className="ship-wing ship-wing-left" />
        <div className="ship-wing ship-wing-right" /><div className="ship-fin" />
        <div className="ship-window" /><div className="ship-engine ship-engine-left" /><div className="ship-engine ship-engine-right" />
      </div>
      <div className="visual-label label-mass"><span /> MASS 2.84 T</div>
      <div className="visual-label label-orbit"><span /> ORBITAL PATH / 01</div>
      <div className="visual-caption"><span>01</span><p>EXPLORER<br /><em>MK. I</em></p></div>
    </div>
  );
}
