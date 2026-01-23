using System.Collections.Concurrent;
using CommercePrototype_Backend.Services.Sfcc.Shared;

namespace CommercePrototype_Backend.Services;

public interface IShopperSessionStore
{
    string Save(SfccShopperSession session);
    bool TryGet(string sessionId, out SfccShopperSession session);
    void LinkBasketToSession(string basketId, string sessionId);
    bool TryGetSessionIdByBasket(string basketId, out string sessionId);
}

public sealed class ShopperSessionStore : IShopperSessionStore
{
    private readonly ConcurrentDictionary<string, SfccShopperSession> _sessions = new();
    private readonly ConcurrentDictionary<string, string> _basketToSession = new();

    public string Save(SfccShopperSession session)
    {
        var id = Guid.NewGuid().ToString("N");
        _sessions[id] = session;
        return id;
    }

    public bool TryGet(string sessionId, out SfccShopperSession session)
    {
        if (_sessions.TryGetValue(sessionId, out session!))
        {
            if (DateTime.UtcNow < session.ExpiresAtUtc)
            {
                return true;
            }

            _sessions.TryRemove(sessionId, out _);
        }

        session = default!;
        return false;
    }

    public void LinkBasketToSession(string basketId, string sessionId)
    {
        if (string.IsNullOrWhiteSpace(basketId) || string.IsNullOrWhiteSpace(sessionId)) return;
        _basketToSession[basketId] = sessionId;
    }

    public bool TryGetSessionIdByBasket(string basketId, out string sessionId)
    {
        return _basketToSession.TryGetValue(basketId, out sessionId!);
    }
}
