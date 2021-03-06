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
        voicecomsim: {
            server: {
                port: 8026
            }
        },
        voicecom: {
            url: 'http://localhost:8026',
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
            result: (result, assert) => {
                assert.equals(result.payload.return_code, 0, 'sms successfully sent');
            }
        }, {
            method: 'voicecom.exec',
            name: 'simulate error',
            params: {
                from: '1111',
                to: '2222',
                messageId: 'test-automation',
                text: 'test',
                body: 'error'
            },
            error: (result, assert) => {
                assert.ok(result instanceof Error, 'sms sending error');
                assert.equals(result.type, 'sms.voicecom.service.1000', 'error handled correctly');
            }
        }]
    }
});
