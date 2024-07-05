// colorUtils.js
// export const colors = ['#FFCCCC', '#FFB2B2', '#FF9999', '#FF7F7F', '#FF6666', '#FF4C4C', '#FF3232', '#FF1919', '#FF0000', '#990000'];
export const colors = ['#FFCCCC', '#FFB2B2', '#FF9999', '#FF7F7F', '#FF6666', '#FF4C4C', '#FF3232', '#FF1919', '#FF0000'];

export const getColorByFrequency = (frequency, max_freq) => {
  if (max_freq === 1) {
    return colors[4];
  } else {
    const colorIndex = Math.min(colors.length - 1, Math.floor(frequency * (colors.length - 1) / max_freq));
    return colors[colorIndex];
  }
};
