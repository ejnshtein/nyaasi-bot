module.exports = {
    offset: {
        plus: (plus = 10) => `↓ ${plus}`,
        minus: (minus = 10) => `↑ ${minus}`
    },
    page: {
        next: (page = 1) => `${page} ›`,
        nextDub: (page) => `${page} »`,
        prev: (page = 1) => `‹ ${page}`,
        prevDub: (page = 0) => `« ${page}`,
        locate: (page) => `· ${page} ·`,
        refresh: '🗘 Refresh'
    },
    back: '🡄 Back',
    torrent: {
        download: '🡇 Torrent',
        magnet: '🔗 Magnet'
    }
}