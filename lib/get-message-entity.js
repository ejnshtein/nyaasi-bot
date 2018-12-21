module.exports = message => {
  const entities = message.entities.filter(el => el.type === 'text_link')
  return entities[entities.length - 1]
}
