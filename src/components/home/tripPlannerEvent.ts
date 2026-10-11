export const OPEN_PLANNER_EVENT = 'travel4life:open-planner';

export interface PlannerEventDetail {
  destination?: string;
}

export function openTravelPlanner(destination?: string) {
  window.dispatchEvent(new CustomEvent<PlannerEventDetail>(OPEN_PLANNER_EVENT, { detail: { destination } }));
}
