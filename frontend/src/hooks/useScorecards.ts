import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { InterviewScorecardTemplate } from '../types';
import * as crudApi from '../services/crudApi';

export const useScorecards = ({ loggedInUserId }: { loggedInUserId?: string } = {}) => {
  const queryClient = useQueryClient();
  const scorecardsQueryKey = ['scorecards', loggedInUserId] as const;

  const { data: scorecardTemplates = [] } = useQuery({
    queryKey: scorecardsQueryKey,
    queryFn: () => crudApi.listScorecards(),
    enabled: !!loggedInUserId,
  });

  const setScorecardTemplates = useCallback(
    (updater: InterviewScorecardTemplate[] | ((prev: InterviewScorecardTemplate[]) => InterviewScorecardTemplate[])) => {
      queryClient.setQueryData<InterviewScorecardTemplate[]>(scorecardsQueryKey, (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, loggedInUserId]
  );

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
          crudApi.listScorecards().then(setScorecardTemplates).catch(console.error);
        });
      return [template, ...prev];
    });
  }, [setScorecardTemplates]);

  const deleteScorecardTemplate = useCallback((id: string) => {
    setScorecardTemplates((prev) => prev.filter((t) => t.id !== id));
    crudApi.deleteScorecard(id).catch((err) => {
      console.error(err);
      crudApi.listScorecards().then(setScorecardTemplates).catch(console.error);
    });
  }, [setScorecardTemplates]);

  return {
    scorecardTemplates,
    setScorecardTemplates,
    saveScorecardTemplate,
    deleteScorecardTemplate,
  };
};
