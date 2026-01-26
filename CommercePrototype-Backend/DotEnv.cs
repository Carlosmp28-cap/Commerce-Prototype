using System;
using System.IO;

namespace CommercePrototype_Backend
{
    public static class DotEnv
    {
        public static void Load(string filePath)
        {
            if (!File.Exists(filePath))
                return;

            foreach (var line in File.ReadAllLines(filePath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#"))
                    continue;

                var idx = trimmed.IndexOf('=');
                if (idx <= 0) continue;

                var key = trimmed.Substring(0, idx).Trim();
                var val = trimmed.Substring(idx + 1).Trim();

                if ((val.StartsWith("\"") && val.EndsWith("\"")) || (val.StartsWith("'") && val.EndsWith("'")))
                {
                    val = val.Substring(1, val.Length - 2);
                }

                Environment.SetEnvironmentVariable(key, val);
            }
        }
    }
}
