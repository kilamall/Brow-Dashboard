import { useState, useEffect } from 'react';
import Messages from './Messages';
import SMSInterface from '../components/SMSInterface';

interface ConversationsProps {
	initialTab?: 'messages' | 'sms';
}

export default function Conversations({ initialTab = 'messages' }: ConversationsProps) {
	const [tab, setTab] = useState<'messages' | 'sms'>(initialTab);

	useEffect(() => {
		// Allow deep-linking via URL search params: ?tab=sms
		try {
			const params = new URLSearchParams(window.location.search);
			const t = params.get('tab');
			if (t === 'sms' || t === 'messages') setTab(t);
		} catch {}
	}, []);

	return (
		<div className="space-y-4">
			<div className="bg-white rounded-lg shadow-soft p-4">
				<h2 className="text-xl font-serif font-semibold mb-3">Conversations</h2>
				<div className="flex gap-2">
					<button
						id="tab-messages"
						name="tab-messages"
						onClick={() => setTab('messages')}
						className={`px-3 py-1 rounded-md text-sm ${
							tab === 'messages' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Messages
					</button>
					<button
						id="tab-sms"
						name="tab-sms"
						onClick={() => setTab('sms')}
						className={`px-3 py-1 rounded-md text-sm ${
							tab === 'sms' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						SMS
					</button>
				</div>
			</div>

			<div className="bg-transparent">
				{tab === 'messages' ? (
					<Messages />
				) : (
					<SMSInterface />
				)}
			</div>
		</div>
	);
}
