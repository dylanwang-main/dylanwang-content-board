import Panel from "@/components/kit/Panel";
import BulletList from "@/components/research/BulletList";
import CommonalityRow from "@/components/research/CommonalityRow";

const LISTS = [
  { key: "pains", title: "Pains" },
  { key: "desires", title: "Desires" },
  { key: "objections", title: "Objections" },
  { key: "language", title: "Their language" },
];

export default function CustomerResearchReport({ record }) {
  const research = record.customer_research || {};
  const commonalities = research.commonalities || [];

  return (
    <Panel title="Customer research">
      {research.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">{research.summary}</p>
      )}

      {commonalities.length > 0 && (
        <div className="mt-6 space-y-5">
          {commonalities.map((item, index) => (
            <CommonalityRow key={`${item.theme}-${index}`} item={item} />
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {LISTS.map((list) => (
          <BulletList key={list.key} title={list.title} items={research[list.key]} />
        ))}
      </div>
    </Panel>
  );
}