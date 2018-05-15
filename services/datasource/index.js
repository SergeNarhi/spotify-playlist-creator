var datasource = {};
datasource.seeds = [
    {
        audienceGroupName: 'Songs',
        type: 'track',
        calculateable: false
    },
    {
        audienceGroupName: 'Celebrities',
        type: 'artist',
        calculateable: false
    },
    {
        audienceGroupName: 'Music Genre',
        type: 'genre',
        calculateable: false
    },
    {
        audienceGroupName: 'Example Tuneable',
        type: 'mood',
        calculateable: true,
        tuneableAttributes: {
            energy: 0.91
        }
    }
];

module.exports = datasource;
