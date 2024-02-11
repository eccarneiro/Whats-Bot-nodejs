class NoAuth { }

class Client {
    subcribers = {};

    initialize() {
        this.emit("qr");
        this.emit("ready")
    }
    on(eventName, cb) {
        if (!this.subcribers[eventName]) {
            this.subcribers[eventName] = []
        }
        this.subcribers[eventName].push(cb);
    }
    async emit(eventName, payload = {}) {
        payload = payload;

        for (let cb of this.subcribers[eventName]) {
            const reply = (message) => {
                console.log(`${payload.body} > `, message)
            }
            const sendMessage = (number, message) => {
                console.log('[me] ', message)
            }

            const context = {
                ...payload,
                reply,
                sendMessage,
            };

            await cb(context);
        }
    }
}

module.exports = { Client, NoAuth };