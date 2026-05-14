import { useCallback, useEffect, useState } from 'react';
import { InterviewScorecardTemplate } from '../types';
import * as crudApi from '../services/crudApi';

export const useScorecards = () => {
  const [scorecardTemplates, setScorecardTemplates] = useState<InterviewScorecardTemplate[]>([]);

  useEffect(() => {
    crudApi.listScorecards().then(setScorecardTemplates).catch(console.error);
  }, []);

  const saveScorecardTemplate = useCallback((template: InterviewScorecardTemplate) => {
    setScorecardTemplates((prev) => {
      const existing = prev.find((t) => t.id === template.id);

      if (existing) {
        crudApi
          .updateScorecard(template)
          .then((updated) =>
            setScorecardTemplates((curr) => curr.map((t) => t.id === updated.id ? updated : t))
          )
          .catch(console.error);
        return prev.map((t) => t.id === template.id ? template : t);
      }

      crudApi
        .createScorecard(template)
        .then((created) =>
          setScorecardTemplates((curr) => curr.map((t) => t.id === template.id ? created : t))
        )
        .catch((err) => {
          console.error(err);
          setScorecardTemplates((curr) => curr.filter((t) => t.id !== template.id));
        });
      return [template, ...prev];
    });
  }, []);

  const deleteScorecardTemplate = useCallback((id: string) => {
    setScorecardTemplates((prev) => prev.filter((t) => t.id !== id));
    crudApi.deleteScorecard(id).catch((err) => {
      console.error(err);
      crudApi.listScorecards().then(setScorecardTemplates).catch(console.error);
    });
  }, []);

  return {
    scorecardTemplates,
    setScorecardTemplates,
    saveScorecardTemplate,
    deleteScorecardTemplate,
  };
};
