const categories = [
  {
    title: 'All categories',
    id: 0,
    subcategories: []
  },
  {
    title: 'Anime',
    id: 1,
    subcategories: [
      {
        id: 1,
        name: 'AMV'
      },
      {
        id: 2,
        name: 'English'
      },
      {
        id: 3,
        name: 'Non-English'
      },
      {
        id: 4,
        name: 'Raw'
      }
    ]
  },
  {
    title: 'Audio',
    id: 2,
    subcategories: [
      {
        id: 1,
        name: 'Lossless'
      },
      {
        id: 2,
        name: 'Lossy'
      }
    ]
  },
  {
    title: 'Literature',
    id: 3,
    subcategories: [
      {
        id: 1,
        name: 'English'
      },
      {
        id: 2,
        name: 'Non-English'
      },
      {
        id: 3,
        name: 'Raw'
      }
    ]
  },
  {
    title: 'Live Action',
    id: 4,
    subcategories: [
      {
        id: 1,
        name: 'English'
      },
      {
        id: 2,
        name: 'Idol/PV'
      },
      {
        id: 3,
        name: 'Non-English'
      },
      {
        id: 4,
        name: 'Raw'
      }
    ]
  },
  {
    title: 'Pictures',
    id: 5,
    subcategories: [
      {
        id: 1,
        name: 'Graphics'
      },
      {
        id: 2,
        name: 'Photos'
      }
    ]
  },
  {
    title: 'Software',
    id: 6,
    subcategories: [
      {
        id: 1,
        name: 'Apps'
      },
      {
        id: 2,
        name: 'Games'
      }
    ]
  }
]
const filters = [
  {
    title: 'No filter',
    id: 0
  },
  {
    title: 'No remakes',
    id: 1
  },
  {
    title: 'Trusted only',
    id: 2
  }
]
module.exports = query => {
  return query.split(' ')
    .filter(val => /-(c|f):(\S+)/i.test(val))
    .reduce((acc, val) => {
      const match = val.match(/-(c|f):(\d)_?(\d)?/i)
      const type = match[1]
      const categoryId = Number(match[2])
      const subcategoryId = match[3] ? Number(match[3]) : undefined
      if (type === 'c') {}
    }, [])
}

const getCategoryData = (type, categoryId, subcategoryId) => {
  switch (type) {
    case 'c':
      const category = categories.find(category => category.id === categoryId)
      if (!category) {
        return null
      }
      if (!subcategoryId) {
        return category.title
      }
      const subcategory = category.subcategories.find(subcategory => subcategory.id === subcategoryId)
      if (!subcategory) {
        return ''
      }
  }
}