import fs from 'fs';

import {FetchMessageObject, ImapFlow, ImapFlowOptions, MailboxLockObject, SearchObject} from 'imapflow';
import {Attachment, ParsedMail, simpleParser} from 'mailparser';


const config: ImapFlowOptions = {
	host: process.env.EMAIL_URL,
	port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 993,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
};
const client: ImapFlow = new ImapFlow(config);

const main = async (): Promise<void> => {
	const mails: FetchMessageObject[] = [];

	await client.connect();

	const lock: MailboxLockObject = await client.getMailboxLock('INBOX');

	try {
		for await (const message of client.fetch({seq: '1:*', seen: false}, {uid: true, source: true})) {
			mails.push(message);
		}

		await Promise.all(
			mails.map(async ({uid, source}) => {
				const parsed: ParsedMail = await simpleParser(source);
				const files: Attachment[] = parsed.attachments
					.filter((attachment) => attachment.contentDisposition === 'attachment');

				const fileSave: string[] = await Promise.all(
					files.map(async (file) => {
						const {content, filename} = file;

						try {
							fs.writeFileSync(`/uploads/${filename}`, content);
						} catch (error) {
							return (error as Error).message;
						}

						return 'success';
					})
				);

				if (fileSave.every((value) => value === 'success')) {
					const searchObject: SearchObject = {uid: String(uid), seen: false};

					await client.messageFlagsSet(searchObject, ['\\Seen']);
				}
			})
		);
	} finally {
		lock.release();
	}

	await client.logout();
};

main()
	.catch((error) => console.error(error)); // eslint-disable-line no-console
