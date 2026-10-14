import type { RootState } from "../store";

export function selectShelfCity(state: RootState): string {

    const city = state.search.city.trim();

    return city === '' ? 'Pietermaritzburg' : city;

}