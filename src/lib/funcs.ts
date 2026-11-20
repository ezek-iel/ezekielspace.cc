export const formatDay = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });