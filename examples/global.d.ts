declare module '*.scss' {
    const content: { [Key: string]: string };
    export = content;
}

declare module '*.json' {
    const content: string;
    export default content;
}
