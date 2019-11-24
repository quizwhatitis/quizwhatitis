import React from "react";
import * as seedrandom from "seedrandom";

const dist = (p1, p2) => {
  const x1 = p1.r * Math.cos(p1.theta);
  const y1 = p1.r * Math.sin(p1.theta);
  const x2 = p2.r * Math.cos(p2.theta);
  const y2 = p2.r * Math.sin(p2.theta);
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

export default class PersonalityMap extends React.Component {
  constructor(props) {
    super(props);
    this.cvsRef = React.createRef();
  }
  render() {
    const { traits, seed } = this.props;
    return (
      <>
        <h2>Your personality map</h2>
        <canvas id="cvs" ref={this.cvsRef} height={600} width={900} />
      </>
    );
  }
  componentDidMount() {
    const { traits, seed, winnerName, otherTitles } = this.props;
    const colors = ["#FF0", "#0FF", "#00F", "#000", "#000", "#F00"];
    const height = 600;
    const width = 600;
    const radius = height / 2 - 45;
    const prng = seedrandom(JSON.stringify(seed));

    const you = {
      theta: prng.quick() * Math.PI * 2,
      r: prng.quick() * radius,
      d: 0
    };
    const [winner, ...otherPoints] = new Array(otherTitles.length + 1)
      .fill(0)
      .map(_ => ({
        theta: prng.quick() * Math.PI * 2,
        r: prng.quick() * radius
      }))
      .map(p => ({ ...p, d: dist(p, you) }))
      .sort((x, y) => x.d - y.d);
    console.log(otherPoints);
    const points = [
      { ...you, color: "red", label: "you" },
      { ...winner, color: "blue", label: winnerName },
      ...otherPoints.map((p, i) => ({ ...p, label: otherTitles[i] }))
    ];

    const ctx = this.cvsRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height + 10);
    ctx.save();

    ctx.translate(200 + width / 2, height / 2);
    //ctx.arc(0, 0, radius, rads(359.1667), rads(180.833));
    const n = traits.length;
    for (let i = 0; i < traits.length; i++) {
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        radius,
        (2 * i * Math.PI) / n,
        (2 * (i + 1) * Math.PI) / n,
        false
      );
      ctx.strokeStyle = colors[i % (colors.length - 1)];
      ctx.lineWidth = "5";
      ctx.stroke();
    }

    for (let i = 0; i < traits.length; i++) {
      ctx.save();
      ctx.font = "24px serif";
      const theta = (2 * (i + 0.5) * Math.PI) / n;
      ctx.textAlign =
        theta < Math.PI / 2 || theta > (3 / 2) * Math.PI ? "left" : "right";
      //ctx.translate(Math.cos(theta), Math.sin(theta));
      ctx.fillText(
        traits[i],
        Math.cos(theta) * (radius + 20),
        Math.sin(theta) * (radius + 20)
      );
      ctx.restore();
    }

    const graphPoint = point => {
      const { theta, r, color } = point;
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        r * Math.cos(theta),
        r * Math.sin(theta),
        5,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = color || "black";
      ctx.fill();
    };

    const drawLabel = point => {
      ctx.save();
      const { theta, r } = point;
      ctx.textAlign = "center";
      //ctx.translate(Math.cos(theta), Math.sin(theta));
      ctx.fillStyle = point.color || "black";
      ctx.font = "12px serif";
      ctx.fillText(point.label, Math.cos(theta) * r, Math.sin(theta) * r - 10);
      ctx.restore();
    };

    for (let i = points.length - 1; i >= 0; i--) {
      graphPoint(points[i]);
      drawLabel(points[i]);
    }
  }
}
