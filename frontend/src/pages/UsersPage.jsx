import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../services/api';
import { Users, Mail, Shield, User as UserIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        // Filter: CEO sees all others, Managers see Team Members
        const filtered = res.data
          .filter(u => u._id !== user?._id)
          .filter(u => {
            if (user?.role === 'CEO' || user?.role === 'Founder') return true;
            return u.role === 'Team Member';
          });
        setTeam(filtered);
      } catch (err) {
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [user]);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="flex flex-col gap-10 max-w-[1600px] mx-auto w-full relative min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Squad Directory</h1>
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">View and manage your team collaborators</p>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          <p className="font-medium animate-pulse">Scanning frequencies...</p>
        </div>
      ) : team.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Squad Members Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-[280px] mx-auto font-medium">There are currently no team members matching your organizational view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {team.map((u) => (
            <div 
              key={u._id}
              className="group relative bg-white/60 backdrop-blur-xl border border-slate-200/50 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-6 overflow-hidden transform group-hover:rotate-6 transition-transform duration-500 ring-4 ring-transparent group-hover:ring-primary/10">
                  <span className="text-3xl font-black text-slate-800">{getInitials(u.name)}</span>
                </div>

                {/* Identity */}
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 truncate w-full">{u.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                  <Mail size={12} className="shrink-0" />
                  <span className="text-[11px] font-bold truncate max-w-[150px]">{u.email}</span>
                </div>

                {/* Badge Container */}
                <div className="w-full pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <div className={twMerge(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                    u.role === 'CEO' || u.role === 'Founder' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                    u.role === 'Manager' ? "bg-primary/5 text-primary border-primary/10" :
                    "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    <Shield size={12} strokeWidth={3} />
                    {u.role}
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* Interaction Overlay (Subtle) */}
              <div className="absolute inset-0 bg-primary/2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
