export const getImagePath = (directory, imageName) => {
  return new URL(`../assets/images/${directory}/${imageName}`, import.meta.url).href;
};
