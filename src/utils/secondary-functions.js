export const clearForm = (formValues) => {
  const form = { ...formValues };

  for (const key in form) {
    form[key] = "";
  }

  return form;
};

export const isFormDataEmpty = (formData) => {
  for (let key in formData) {
    if (Array.isArray(formData[key])) {
      if (!formData[key].length) {
        return false;
      }
    } else {
      if (!formData[key]) {
        return false;
      }
    }
  }
  return true;
};

export const getFirstValue = (formData) => {
  const result = {};

  for (const key in formData) {
    if (Array.isArray(formData[key])) {
      result[key] = formData[key][0];
    } else {
      result[key] = formData[key];
    }
  }

  return result;
};

export const createIdMap = (items) => {
  const idMap = {};
  items.forEach((item) => {
    idMap[item.id] = item;
  });
  return idMap;
};
