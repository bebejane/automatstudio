export type MetaField = {
  id: string
  label: string
  type: 'text' | 'number' | 'boolean'
}

const metaFields: MetaField[] = [{
  id: 'name',
  label: 'Name',
  type: 'text',
}, {
  id: 'year',
  label: 'Year',
  type: 'text',
}, {
  id: 'country',
  label: 'Country',
  type: 'text',
}, {
  id: 'region',
  label: 'Region',
  type: 'text',
}, {
  id: 'producer',
  label: 'Producer',
  type: 'text',
}, {
  id: 'city',
  label: 'City',
  type: 'text',
}, {
  id: 'category',
  label: 'Category',
  type: 'text',
}, {
  id: 'grape',
  label: 'Grape',
  type: 'text',
}, {
  id: 'eco',
  label: 'Eco',
  type: 'boolean',
}, {
  id: 'pricelist',
  label: 'Pricelist',
  type: 'boolean',
}, {
  id: 'price',
  label: 'Price',
  type: 'number',
}]

export default metaFields