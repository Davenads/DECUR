import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import SharedAssessmentTab from '../../shared/tabs/SharedAssessmentTab';

const data = burischData as BurischData;

const AssessmentTab: FC = () => {
  const { arguments: args } = data;
  const credibility = {
    supporting:    args.supporting.map((a: { claim: string }) => a.claim),
    contradicting: args.against.map((a: { claim: string }) => a.claim),
  };
  return (
    <SharedAssessmentTab
      credibility={credibility}
      methodologyNote="This section presents documented arguments for and against Burisch's credibility as compiled by researcher Brian Jackson over 13 years. DECUR does not adjudicate these claims; they are presented for methodological transparency."
    />
  );
};

export default AssessmentTab;
