import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import CredibilityBalance from '../../shared/CredibilityBalance';
import CategoryBreakdown from '../../shared/CategoryBreakdown';
import MethodologyNote from '../../shared/MethodologyNote';
import ArgumentsSection from '../../shared/ArgumentsSection';

const data = burischData as BurischData;

const AssessmentTab: FC = () => {
  const { arguments: args } = data;
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={args.supporting.length}
        contradicting={args.against.length}
      />

      <CategoryBreakdown supporting={args.supporting} against={args.against} />

      <MethodologyNote>
        This section presents documented arguments for and against Burisch&apos;s credibility as
        compiled by researcher Brian Jackson over 13 years. DECUR does not adjudicate these claims;
        they are presented for methodological transparency.
      </MethodologyNote>

      <ArgumentsSection type="supporting" items={args.supporting} />
      <ArgumentsSection type="against" items={args.against} />
    </div>
  );
};

export default AssessmentTab;
