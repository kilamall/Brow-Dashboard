import { useEffect } from 'react';


export default function Notification({ message, type = 'info', duration = 3000, position = 'top-right', onClose }) {
useEffect(() => {
if (!message) return;
const t = setTimeout(() => onClose?.(), duration);
return () => clearTimeout(t);
}, [message, duration, onClose]);


if (!message) return null;


return (
<div className={`fixed ${position.includes('top') ? 'top-4' : 'bottom-4'} ${position.includes('right') ? 'right-4' : 'left-4'}`}>
<div className={`rounded-lg px-4 py-2 shadow text-white ${
type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800'
}`}>
{message}
</div>
</div>
);
}