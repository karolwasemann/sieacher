import type { TutorReply } from '@sieacher/shared';
import { useTranslation } from 'react-i18next';

type Correction = TutorReply['corrections'][number];

export const CorrectionCard = ({ correction }: { correction: Correction }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-highlight-med bg-surface px-3 py-2 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <del className="text-love">{correction.original}</del>
        <span className="text-muted">→</span>
        <ins className="font-medium text-pine no-underline">{correction.corrected}</ins>
        <span className="ml-auto rounded-full bg-overlay px-2 text-xs text-subtle">
          {t(`category.${correction.category}`)}
        </span>
      </div>
      <p className="mt-1 text-subtle">{correction.explanation}</p>
    </div>
  );
};
