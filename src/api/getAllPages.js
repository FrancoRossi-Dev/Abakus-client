import backend from './backend';

// Pide página por página hasta tener todos los items de un listado paginado
// (el backend responde { data, page, pages, total })
export const getAllPages = async (endpoint) => {
  const items = [];
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const res = await backend.get(endpoint, { params: { page, limit: 100 } });
    items.push(...res.data.data);
    pages = res.data.pages;
    page++;
  }

  return items;
};
