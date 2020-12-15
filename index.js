const crypto = require('crypto');
const templateRender = require('ut-function.template');
const errors = require('./errors');

module.exports = function voicecom({config, registerErrors, utNotify, utMethod, utError: {getError}}) {
    return class voicecom extends require('ut-port-http')(...arguments) {
        get defaults() {
            return {
                namespace: 'voicecom',
                drainSend: 6000000,
                raw: {
                    strictSSL: false,
                    json: true
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                parseResponse: false,
                method: 'POST'
            };
        }

        get schema() {
            return {
                type: 'object',
                required: ['url', 'uri', 'type', 'voicecom'],
                properties: {
                    url: {
                        type: 'string'
                    },
                    uri: {
                        type: 'string'
                    },
                    type: {
                        type: 'string'
                    },
                    voicecom: {
                        type: 'object',
                        required: ['sid', 'token', 'messageIdTemplate'],
                        properties: {
                            sid: {
                                type: 'number'
                            },
                            token: {
                                type: 'string'
                            },
                            messageIdTemplate: {
                                type: 'string'
                            }

                        }
                    }
                }
            };
        }

        async init(...params) {
            const result = await super.init(...params);
            Object.assign(this.errors, registerErrors(errors));
            return result;
        }

        handlers() {
            return {
                'drainSend.event.receive'(msg, $meta) {
                    $meta.mtid = 'notification';
                    $meta.method = 'notice.message.process';
                    return {
                        port: this.config.id,
                        method: this.config.namespace + '.exec',
                        length: msg.length
                    };
                },
                [`${this.config.namespace}.exec.request.send`]: (msg, $meta) => {
                    const {voicecom} = config;
                    const hash = crypto.createHash('md5');
                    const id = templateRender(voicecom.messageIdTemplate, {messageId: msg.messageId});
                    const smsToken = hash.update(id + voicecom.token).digest('hex');
                    const sms = {
                        sid: voicecom.sid,
                        request_id: id,
                        to: msg.to,
                        token: smsToken,
                        priority: 1,
                        defer: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        send_order: ['sms'],
                        callback_url: '',
                        sms: {
                            text: msg.body,
                            encoding: 'UTF-8',
                            concatenate: 2,
                            form: msg.from,
                            validity: {
                                ttl: 10,
                                units: 'min'
                            },
                            mccmnc: '0'
                        }
                    };
                    return {payload: sms};
                },
                receive: (msg, $meta) => {
                    if (msg.payload.return_code > 0) {
                        const error = this.errors[`sms.voicecom.service.${msg.payload.return_code}`] || this.errors['sms.voicecom'];
                        throw error();
                    }
                    return msg;
                }
            };
        }
    };
};
