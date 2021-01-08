require('ut-run').run({
    main: [
        () => ({
            test: () => [
                require('..'),
                require('ut-port-voicecom-sim')
            ]
        })
    ],
    method: 'unit',
    config: {
        test: true,
        voicecom: {
            url: 'http://localhost:8000',
            uri: '/multichannel-api/sendmulti/',
            voicecom: {
                sid: 1,
                token: 'test',
                messageIdTemplate: 'test'
            }
        }
    },
    params: {
        steps: [{
            method: 'voicecom.exec',
            name: 'Send SMS',
            params: {
                from: '1111',
                to: '2222',
                messageId: 'test-automation',
                text: 'test',
                body: 'test message'
            },
            error: (error, assert) => {
                assert.equals(error.type, 'port.notConnected', 'No voicecom server');
            }
        }]
    }
});
