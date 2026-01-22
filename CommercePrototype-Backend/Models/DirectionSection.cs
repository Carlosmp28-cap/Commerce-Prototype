namespace CommercePrototype_Backend.Models
{
    public class DirectionSection
    {
        public string Type { get; set; } = string.Empty;
        public int Steps { get; set; }
        public (int x, int y) From { get; set; }
        public (int x, int y) To { get; set; }
        public string? Text { get; set; }
    }
}
