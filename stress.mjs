// Disjoint intervals for the UTCI stress categories in the supplied chart.
export function stressCategory(value) {
  if (!Number.isFinite(value)) return null;
  if (value > 46) return {label:'Extreme heat stress',range:'Above 46°C'};
  if (value > 38) return {label:'Very strong heat stress',range:'Above 38°C to 46°C'};
  if (value > 32) return {label:'Strong heat stress',range:'Above 32°C to 38°C'};
  if (value > 26) return {label:'Moderate heat stress',range:'Above 26°C to 32°C'};
  if (value >= 9) return {label:'No thermal stress',range:'9°C to 26°C'};
  if (value >= 0) return {label:'Slight cold stress',range:'0°C to below 9°C'};
  if (value >= -13) return {label:'Moderate cold stress',range:'−13°C to below 0°C'};
  if (value >= -27) return {label:'Strong cold stress',range:'−27°C to below −13°C'};
  if (value >= -40) return {label:'Very strong cold stress',range:'−40°C to below −27°C'};
  return {label:'Extreme cold stress',range:'Below −40°C'};
}
