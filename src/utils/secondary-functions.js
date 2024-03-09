export function clearForm(formData, exceptions = []) {
  const clearedFormData = {};
  for (const key in formData) {
    if (!exceptions.includes(key)) {
      clearedFormData[key] = Array.isArray(formData[key]) ? [] : "";
    } else {
      clearedFormData[key] = formData[key];
    }
  }
  return clearedFormData;
}

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

export const createIdMap = (items) => {
  const idMap = {};
  items.forEach((item) => {
    idMap[item.id] = item;
  });
  return idMap;
};

export const priceSeperator = (price = 0) =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const clearState = (formData) => {
  let body = { ...formData };

  const keys = Object.keys(body);

  keys.forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key] = [];
    } else {
      body[key] = "";
    }
  });

  return body;
}