import { useLeagueDataContext } from "../contexts/LeagueDataContext";

/** @deprecated Prefer useLeagueDataContext; kept for call sites that still import the hook name. */
export default function useLeagueData() {
  return useLeagueDataContext();
}
