import { initFirebase } from '../../../../packages/shared/src/firebase';
import { signOut } from 'firebase/auth';

const { auth } = initFirebase();

export default function Header(){
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <h1 className="font-serif text-xl text-slate-800">Dashboard</h1>
      <button className="text-terracotta" onClick={()=>signOut(auth)}>Sign out</button>
    </header>
  );
}
