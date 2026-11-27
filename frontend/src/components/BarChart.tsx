import type { BarDatum } from "../utils/insightCharts";

type BarChartProps = {
  title: string;
  data: BarDatum[];
};

/** Plain CSS bars with the number printed next to each, so nothing relies on colour alone. */
export default function BarChart({ title, data }: BarChartProps) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="panel">
      <div className="panel-inner">
        <h2>{title}</h2>
        <ul className="bar-chart" aria-label={title}>
          {data.map((item) => (
            <li key={item.label}>
              <span className="bar-chart-label">{item.label}</span>
              <span className="bar-chart-track">
                <span
                  className="bar-chart-fill"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </span>
              <span className="bar-chart-value">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
