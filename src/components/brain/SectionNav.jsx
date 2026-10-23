import SectionNavButton from "@/components/brain/SectionNavButton";
import { BRAIN_SECTIONS } from "@/lib/brain";

export default function SectionNav({ files = [], activeSection, onSelect }) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
      {BRAIN_SECTIONS.map((section) => (
        <SectionNavButton
          key={section.key}
          section={section}
          count={files.filter((file) => file.section === section.key).length}
          active={section.key === activeSection}
          onClick={() => onSelect(section.key)}
        />
      ))}
    </nav>
  );
}