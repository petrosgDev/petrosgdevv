import type { ComponentType } from 'react';
import { FaJava } from 'react-icons/fa6';
import {
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiExpo,
  SiExpress,
  SiFlutter,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiHtml5,
  SiJavascript,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiQt,
  SiReact,
  SiRender,
  SiSpringboot,
  SiSwiper,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiWhatsapp,
} from 'react-icons/si';
import type { SkillCategory } from '@/data/portfolio';

interface TechLogoMeta {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  colorClass: string;
}

const TECH_LOGOS: Record<string, TechLogoMeta> = {
  JavaScript: { icon: SiJavascript, colorClass: 'text-[#E5B80B] dark:text-[#F7DF1E]' },
  TypeScript: { icon: SiTypescript, colorClass: 'text-[#3178C6]' },
  Python: { icon: SiPython, colorClass: 'text-[#3776AB] dark:text-[#5B9BD5]' },
  Java: { icon: FaJava, colorClass: 'text-[#E76F00]' },
  'C++': { icon: SiCplusplus, colorClass: 'text-[#00599C] dark:text-[#4C9AD6]' },
  Dart: { icon: SiDart, colorClass: 'text-[#0175C2] dark:text-[#29B6F6]' },
  React: { icon: SiReact, colorClass: 'text-[#00B4D8] dark:text-[#61DAFB]' },
  'Next.js': { icon: SiNextdotjs, colorClass: 'text-[#111110] dark:text-[#F5F5F3]' },
  HTML5: { icon: SiHtml5, colorClass: 'text-[#E34F26]' },
  CSS3: { icon: SiCss, colorClass: 'text-[#1572B6] dark:text-[#3898EC]' },
  'Tailwind CSS': { icon: SiTailwindcss, colorClass: 'text-[#06B6D4]' },
  Flutter: { icon: SiFlutter, colorClass: 'text-[#02569B] dark:text-[#54C5F8]' },
  'React Native (Expo)': { icon: SiExpo, colorClass: 'text-[#111110] dark:text-[#F5F5F3]' },
  'Swiper.js': { icon: SiSwiper, colorClass: 'text-[#6332F6] dark:text-[#8B5CF6]' },
  'Node.js': { icon: SiNodedotjs, colorClass: 'text-[#339933] dark:text-[#52B852]' },
  Express: { icon: SiExpress, colorClass: 'text-[#1A1A1A] dark:text-[#F0F0EE]' },
  'Spring Boot': { icon: SiSpringboot, colorClass: 'text-[#6DB33F]' },
  'WhatsApp API': { icon: SiWhatsapp, colorClass: 'text-[#25D366]' },
  PostgreSQL: { icon: SiPostgresql, colorClass: 'text-[#336791] dark:text-[#6095C9]' },
  MySQL: { icon: SiMysql, colorClass: 'text-[#4479A1] dark:text-[#66A4D1]' },
  JavaFX: { icon: SiOpenjdk, colorClass: 'text-[#E76F00]' },
  'Qt 6 Widgets': { icon: SiQt, colorClass: 'text-[#41CD52]' },
  Git: { icon: SiGit, colorClass: 'text-[#F05032]' },
  GitHub: { icon: SiGithub, colorClass: 'text-[#181717] dark:text-[#F5F5F3]' },
  Docker: { icon: SiDocker, colorClass: 'text-[#2496ED]' },
  Vercel: { icon: SiVercel, colorClass: 'text-[#111110] dark:text-[#F5F5F3]' },
  Render: { icon: SiRender, colorClass: 'text-[#111110] dark:text-[#46E3B7]' },
  'CI/CD': { icon: SiGithubactions, colorClass: 'text-[#2088FF]' },
};

interface SkillShowcaseProps {
  categories: SkillCategory[];
}

export function SkillShowcase({ categories }: SkillShowcaseProps) {
  return (
    <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
      {categories.map((category) => (
        <div
          key={category.id}
          className="grid grid-cols-1 gap-3.5 py-6 md:grid-cols-12 md:items-start md:py-7"
        >
          <div className="md:col-span-3 md:pt-2">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#666662] dark:text-[#9A9A96]">
              {category.name}
            </h3>
          </div>

          <div className="md:col-span-9 flex flex-wrap items-center gap-2.5">
            {category.items.map((item) => {
              const logo = TECH_LOGOS[item];
              const Icon = logo?.icon;
              return (
                <div
                  key={item}
                  className="inline-flex items-center gap-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#17191C] px-3.5 py-2 text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all duration-150 hover:-translate-y-[1px] hover:border-black/[0.18] dark:hover:border-white/[0.22] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.45)] whitespace-nowrap"
                >
                  {Icon && (
                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${logo.colorClass}`}
                      aria-hidden={true}
                    />
                  )}
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
