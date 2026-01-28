using System.Text.Json;
using System.Collections.Concurrent;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace CommercePrototype_Backend.Services;

public interface IShopperSessionStore
{
    string Save(SfccShopperSession session);
    bool TryGet(string sessionId, out SfccShopperSession session);
    void RemoveSession(string sessionId);
    void LinkBasketToSession(string basketId, string sessionId);
    bool TryGetSessionIdByBasket(string basketId, out string sessionId);
}

public sealed class ShopperSessionStore : IShopperSessionStore
{
    private const string SessionPrefix = "shopper-session:";
    private const string BasketPrefix = "basket-session:";
    private static readonly TimeSpan DefaultSessionTtl = TimeSpan.FromHours(4);

    private readonly IDistributedCache _cache;
    private readonly ILogger<ShopperSessionStore> _logger;

    // Fallback when Redis isn't available (prototype/dev convenience).
    private readonly ConcurrentDictionary<string, (string Payload, DateTime ExpiresAtUtc)> _inMemory = new();
    private volatile bool _distributedCacheHealthy = true;

    public ShopperSessionStore(IDistributedCache cache, ILogger<ShopperSessionStore> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    private bool TryGetString(string key, out string? value)
    {
        value = null;

        if (_distributedCacheHealthy)
        {
            try
            {
                value = _cache.GetString(key);
                return true;
            }
            catch (RedisConnectionException ex)
            {
                _distributedCacheHealthy = false;
                _logger.LogWarning(ex, "Redis unavailable; falling back to in-memory session store");
            }
            catch (Exception ex)
            {
                _distributedCacheHealthy = false;
                _logger.LogWarning(ex, "Distributed cache unavailable; falling back to in-memory session store");
            }
        }

        if (_inMemory.TryGetValue(key, out var entry))
        {
            if (DateTime.UtcNow >= entry.ExpiresAtUtc)
            {
                _inMemory.TryRemove(key, out _);
                return true;
            }

            value = entry.Payload;
        }

        return true;
    }

    private void SetString(string key, string payload, DateTime expiresAtUtc)
    {
        if (_distributedCacheHealthy)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpiration = expiresAtUtc > DateTime.UtcNow
                        ? expiresAtUtc
                        : DateTime.UtcNow.Add(DefaultSessionTtl)
                };
                _cache.SetString(key, payload, options);
                return;
            }
            catch (RedisConnectionException ex)
            {
                _distributedCacheHealthy = false;
                _logger.LogWarning(ex, "Redis unavailable; falling back to in-memory session store");
            }
            catch (Exception ex)
            {
                _distributedCacheHealthy = false;
                _logger.LogWarning(ex, "Distributed cache unavailable; falling back to in-memory session store");
            }
        }

        _inMemory[key] = (payload, expiresAtUtc > DateTime.UtcNow ? expiresAtUtc : DateTime.UtcNow.Add(DefaultSessionTtl));
    }

    private void RemoveKey(string key)
    {
        if (_distributedCacheHealthy)
        {
            try
            {
                _cache.Remove(key);
            }
            catch
            {
                _distributedCacheHealthy = false;
            }
        }

        _inMemory.TryRemove(key, out _);
    }

    public string Save(SfccShopperSession session)
    {
        var id = Guid.NewGuid().ToString("N");
        var key = SessionPrefix + id;
        var payload = JsonSerializer.Serialize(session);
        var expiresAtUtc = session.ExpiresAtUtc > DateTime.UtcNow
            ? session.ExpiresAtUtc
            : DateTime.UtcNow.Add(DefaultSessionTtl);

        SetString(key, payload, expiresAtUtc);
        return id;
    }

    public bool TryGet(string sessionId, out SfccShopperSession session)
    {
        session = default!;
        if (string.IsNullOrWhiteSpace(sessionId)) return false;

        var key = SessionPrefix + sessionId;
        TryGetString(key, out var payload);
        if (string.IsNullOrWhiteSpace(payload)) return false;

        try
        {
            var stored = JsonSerializer.Deserialize<SfccShopperSession>(payload);
            if (stored is null) return false;

            if (DateTime.UtcNow >= stored.ExpiresAtUtc)
            {
                RemoveKey(key);
                return false;
            }

            session = stored;
            return true;
        }
        catch (JsonException)
        {
            RemoveKey(key);
            return false;
        }
    }

    public void RemoveSession(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId)) return;
        RemoveKey(SessionPrefix + sessionId);
    }

    public void LinkBasketToSession(string basketId, string sessionId)
    {
        if (string.IsNullOrWhiteSpace(basketId) || string.IsNullOrWhiteSpace(sessionId)) return;

        var key = BasketPrefix + basketId;
        var expiresAtUtc = DateTime.UtcNow.Add(DefaultSessionTtl);
        if (TryGet(sessionId, out var session))
        {
            expiresAtUtc = session.ExpiresAtUtc > DateTime.UtcNow
                ? session.ExpiresAtUtc
                : DateTime.UtcNow.Add(DefaultSessionTtl);
        }

        SetString(key, sessionId, expiresAtUtc);
    }

    public bool TryGetSessionIdByBasket(string basketId, out string sessionId)
    {
        sessionId = default!;
        if (string.IsNullOrWhiteSpace(basketId)) return false;

        var key = BasketPrefix + basketId;
        TryGetString(key, out var cached);
        if (string.IsNullOrWhiteSpace(cached)) return false;

        sessionId = cached;
        return true;
    }
}
