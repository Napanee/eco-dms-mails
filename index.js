const fs = require('fs');
const {ImapFlow} = require('imapflow');
const {simpleParser} = require('mailparser');


const client = new ImapFlow({
    host: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT || 993,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

const main = async () => {
    const mails = [];

    await client.connect();

    let lock = await client.getMailboxLock('INBOX');

    try {
        for await (let message of client.fetch({seq: '1:*', seen: false}, {uid: true, source: true})) {
            mails.push(message);
        }

        await Promise.all(
            mails.map(async ({uid, source}) => {
                const parsed = await simpleParser(source);
                const files = parsed.attachments.filter((attachment) => attachment.contentDisposition === 'attachment');

                const fileSave = await Promise.all(
                    files.map(async (file) => {
                        const {content, filename} = file;

                        try {
                            fs.writeFileSync(`/upload/${filename}`, content);
                        } catch (error) {
                            return error.message;
                        }

                        return 'success';
                    })
                );

                if (fileSave.every((value) => value === 'success')) {
                    await client.messageFlagsSet({uid, seen: false}, ['\\Seen']);
                }
            })
        );
    } finally {
        lock.release();
    }

    await client.logout();
};

main().catch(err => console.error(err));
