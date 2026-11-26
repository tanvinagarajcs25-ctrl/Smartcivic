function generateTicketId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';

    for (let i = 0; i < 4; i++) {
        randomPart += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return `SC-${date}-${randomPart}`;
}

module.exports = generateTicketId;