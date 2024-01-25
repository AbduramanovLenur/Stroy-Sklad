export const clearForm = (formValues) => {
  const form = { ...formValues };

  for (const key in form) {
    form[key] = "";
  }

  return form;
};
