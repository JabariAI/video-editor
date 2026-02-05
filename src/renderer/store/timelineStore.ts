import { useMemo, useReducer } from 'react';
import { createEmptyProject } from '@shared/timeline/schema';
import { reduceTimeline, TimelineAction, TimelineState } from '@shared/timeline/operations';

const initialState: TimelineState = {
  past: [],
  present: createEmptyProject(),
  future: []
};

export const useTimelineStore = () => {
  const [state, dispatch] = useReducer(reduceTimeline, initialState);

  return useMemo(
    () => ({
      project: state.present,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      dispatch: (action: TimelineAction) => dispatch(action)
    }),
    [state]
  );
};
