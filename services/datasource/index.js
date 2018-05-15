var datasource = {};
datasource.seeds = [
    {
        audienceGroupName: 'Songs',
        type: 'track',
        calculateable: false,
        target: 'seed'
    },
    {
        audienceGroupName: 'Celebrities',
        type: 'artist',
        calculateable: false,
        target: 'seed'
    },
    {
        audienceGroupName: 'Music Genre',
        type: 'genre',
        calculateable: false,
        target: 'seed'
    },
    {
        audienceGroupName: 'Example Tuneable',
        type: 'mood',
        calculateable: true,
        target: 'tuneable',
        tuneableAttributes: {
            energy: 0.91
        }
    }
];

module.exports = datasource;
