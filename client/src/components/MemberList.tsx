import { useServerStore } from '../stores/serverStore';
import { Crown } from 'lucide-react';

export default function MemberList() {
  const { currentServer } = useServerStore();

  if (!currentServer) {
    return null;
  }

  const members: any[] = currentServer.members || [];
  
  // Группировка участников по ролям
  const owner = members.find((m) => m.user?.id === currentServer.ownerId);
  const otherMembers = members.filter((m) => m.user?.id !== currentServer.ownerId);

  const renderMember = (member: any) => (
    <div
      key={member.id}
      className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#35373c] cursor-pointer transition-colors mb-1 group"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold overflow-hidden">
          {member.user?.avatar ? (
            <img src={member.user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            member.user?.username?.charAt(0).toUpperCase() || '?'
          )}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#2b2d31] ${
            member.user?.status === 'ONLINE'
              ? 'bg-[#23a559]'
              : member.user?.status === 'IDLE'
              ? 'bg-[#f0b232]'
              : member.user?.status === 'DND'
              ? 'bg-[#f23f43]'
              : 'bg-[#80848e]'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={`text-sm font-medium truncate ${
            member.user?.id === currentServer.ownerId ? 'text-[#f0b232]' : 'text-[#dbdee1]'
          } group-hover:text-white`}>
            {member.nickname || member.user?.username}
          </p>
          {member.user?.id === currentServer.ownerId && (
            <Crown className="w-3 h-3 text-[#f0b232] flex-shrink-0" />
          )}
        </div>
        {member.user?.customStatus && (
          <p className="text-xs text-[#949ba4] truncate group-hover:text-[#b5bac1]">
            {member.user.customStatus}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col overflow-y-auto flex-shrink-0">
      <div className="p-4">
        {/* Owner Section */}
        {owner && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[#949ba4] uppercase mb-3 tracking-wide">
              Владелец — 1
            </h3>
            {renderMember(owner)}
          </div>
        )}

        {/* Other Members Section */}
        {otherMembers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[#949ba4] uppercase mb-3 tracking-wide">
              Участники — {otherMembers.length}
            </h3>
            {otherMembers.map(renderMember)}
          </div>
        )}

        {members.length === 0 && (
          <p className="text-sm text-[#949ba4]">
            Пока нет участников
          </p>
        )}
      </div>
    </div>
  );
}
