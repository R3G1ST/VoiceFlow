import { useServerStore } from '../../stores/serverStore';

export default function MemberList() {
  const { currentServer } = useServerStore();

  if (!currentServer) {
    return null;
  }

  const members = currentServer.members || [];

  return (
    <div className="w-60 bg-primary-200 flex flex-col overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-secondary-200 uppercase mb-3">
          Участники — {members.length}
        </h3>
        
        {members.length === 0 && (
          <p className="text-sm text-secondary-400">
            Пока нет участников
          </p>
        )}

        {members.map((member: any) => (
          <div
            key={member.id}
            className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary-500 cursor-pointer transition-colors duration-100 mb-1"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {member.user?.avatar ? (
                  <img src={member.user.avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  member.user?.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-primary-200 ${
                  member.user?.status === 'ONLINE'
                    ? 'bg-success'
                    : member.user?.status === 'IDLE'
                    ? 'bg-warning'
                    : member.user?.status === 'DND'
                    ? 'bg-danger'
                    : 'bg-secondary-400'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {member.nickname || member.user?.username}
              </p>
              {member.user?.customStatus && (
                <p className="text-xs text-secondary-200 truncate">
                  {member.user.customStatus}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
