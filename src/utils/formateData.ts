export function formatTime(dateTime: string): string {
    console.log("Valor recebido:", dateTime);

    const date = new Date(dateTime);

    console.log("Data interpretada:", date.toString());
    console.log("Data UTC:", date.toISOString());

    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}