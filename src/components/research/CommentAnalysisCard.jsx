import Panel from "@/components/kit/Panel";
import ChipList from "@/components/research/ChipList";
import SentimentBar from "@/components/research/SentimentBar";

const SENTIMENT = [
  { key: "positive", label: "Positive", fill: "bg-chart-2" },
  { key: "neutral", label: "Neutral", fill: "bg-muted-foreground" },
  { key: "negative", label: "Negative", fill: "bg-destructive" },
];

export default function CommentAnalysisCard({ scan }) {
  const analysis = scan.comment_analysis || {};
  const sentiment = analysis.sentiment || {};
  const notable = analysis.notable_comments || [];

  return (
    <Panel title="Comment analysis">
      {analysis.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
      )}

      <div className="mt-5 space-y-4">
        {SENTIMENT.map((item) => (
          <SentimentBar
            key={item.key}
            label={item.label}
            fill={item.fill}
            value={sentiment[item.key]}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <ChipList title="Themes" items={analysis.themes} />
        <ChipList title="Questions viewers ask" items={analysis.questions} />
      </div>

      {notable.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs text-muted-foreground">
            Notable comments
          </h3>
          <ul className="mt-3 space-y-2">
            {notable.map((comment, index) => (
              <li key={`${comment}-${index}`} className="text-sm text-muted-foreground">
                {`“${comment}”`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}