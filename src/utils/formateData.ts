export function formatTime(dateTime: string): string {
    const date = new Date(dateTime);

    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}